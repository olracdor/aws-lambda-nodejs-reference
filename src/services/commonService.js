'use strict';

const AWS = require('aws-sdk');
const dynamodbclient = new AWS.DynamoDB.DocumentClient();

//Updates 
async function updateItem(params) {
  dynamodbclient.put(params, (error, result) => {
    if (error) {
      console.log(error);
      return;
    }
    console.log('Update successful ' + result);
  });
}

async function processUpdateCascade(params, paymentId) {
  dynamodbclient.scan(params, (error, result) => {
    if (error) {
      console.error(error);

      return;
    }
    result.Items.forEach(function(item) {
      item.paymentId = paymentId;
      console.log('Updating ' + params.TableName + ' with payment ' + item.paymentId);

      updateItem({
        TableName: params.TableName,
        Item: item,
      });
    });
  });
}

async function processUpdatePaidCascade(params, paymentId, callback) {
  dynamodbclient.scan(params, (error, result) => {
    let total = 0;
    if (error) {
      console.error(error);

      return;
    }
    result.Items.forEach(function(item) {
      item.paymentId = paymentId;
      console.log('Updating ' + params.TableName + ' with payment ' + item.paymentId);
      total = total + parseFloat(item.total);
      updateItem({
        TableName: params.TableName,
        Item: item,
      });
    });
    callback(null, total);
  });
}
async function handlePaidPaymentCascade(paymentId, userId) {
  let params = unpaidExpensesParams(userId); // set unpaid to paid

  processUpdatePaidCascade(params, paymentId, (error, result) => {
    setPaymentTotalExpense(paymentId, result);
  });


  params = {
    TableName: process.env.invoice_table,
    FilterExpression: '#userId = :userId AND (attribute_not_exists(paymentId) OR #paymentId = :paymentIdEmpty)',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#paymentId': 'paymentId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':paymentIdEmpty': '', // remove record paymentId related to current payment
    },
  };
  processUpdateCascade(params, paymentId);
}

async function handlePaymentRollbackIfPaid(paymentId, userId) {
  let params = paidExpensesParams(paymentId, userId); // set paid to unpaid

  processUpdateCascade(params, '');

  params = {
    TableName: process.env.invoice_table,
    FilterExpression: '#userId = :userId AND #paymentId = :paymentId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#paymentId': 'paymentId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':paymentId': paymentId,
    },
  };
  processUpdateCascade(params, '');
}

async function setPaymentTotalExpense(paymentId, total) {
  const params = {
    TableName: process.env.payment_table,
    Key: {
      paymentId: paymentId,
    },
  };

  dynamodbclient.get(params, (error, result) => {
    if (error) {
      throw new Error(error);
    }
    result.Item.expenses = total;
    updateItem({
      TableName: params.TableName,
      Item: result.Item,
    });
  });
}

function paidExpensesParams(paymentId, userId) {
  return {
    TableName: process.env.expense_table,
    FilterExpression: '#userId = :userId AND #status = :status AND #paymentId = :paymentId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#status': 'status',
      '#paymentId': 'paymentId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':status': 'Committed',
      ':paymentId': paymentId,
    },
  };
}

function unpaidExpensesParams(userId) {
  return {
    TableName: process.env.expense_table,
    FilterExpression: '#userId = :userId AND #status = :status AND (attribute_not_exists(paymentId) OR #paymentId = :paymentIdEmpty)',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#status': 'status',
      '#paymentId': 'paymentId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':status': 'Committed',
      ':paymentIdEmpty': '', // remove record paymentId related to current payment
    },
  };
}

module.exports.getNewPaymentId = async () => {
  const lambda = new AWS.Lambda({
    region: process.env.region,
  });
  console.log('Invoking ' + process.env.service_reference_id);
  return await lambda.invoke({
    FunctionName: process.env.service_reference_id,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify('payment'),
  }).promise();
};
module.exports.handleUpdateCascade = (paymentId, userId, status) => {
  if ('Paid' === status) {
    handlePaidPaymentCascade(paymentId, userId);
  } else {
    handlePaymentRollbackIfPaid(paymentId, userId);
  }
};

module.exports.handleGenerateId = () => {
  const params = {
    TableName: process.env.expense_table,
    FilterExpression: '#userId = :userId AND #status = :status AND (attribute_not_exists(paymentId) OR #paymentId = :paymentIdEmpty)',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#status': 'status',
      '#paymentId': 'paymentId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':status': 'Committed',
      ':paymentIdEmpty': '', // remove record paymentId related to current payment
    },
  };
};
