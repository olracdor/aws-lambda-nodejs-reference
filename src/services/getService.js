'use strict';

const AWS = require('aws-sdk');
const dynamodbclient = new AWS.DynamoDB.DocumentClient();

module.exports.getPaymentById = async (paymentId) => {
  const response = await dynamodbclient.get({
    TableName: process.env.payment_table,
    Key: {
      paymentId: paymentId,
    },
  }).promise();

  return response.Item;
};


module.exports.getPaymentsByUserId = async (userId) => {
  console.log(`Fetching all payment for user ${userId}`);

  const result = await dynamodbclient.scan({
    TableName: process.env.payment_table,
    FilterExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  }).promise();

  return result.Items;
};


module.exports.getPayments = async () => {
  const result = await dynamodbclient.scan({
    TableName: process.env.payment_table,
  }).promise();
  return result.Items;
};
