'use strict';

const AWS = require('aws-sdk');
const dynamodbclient = new AWS.DynamoDB.DocumentClient();

module.exports.deletePayment = async (paymentId) => {
  console.log(`Deleting payment ${paymentId}`);

  const params = {
    TableName: process.env.payment_table,
    Key: {
      paymentId: paymentId,
    },
  };

  return dynamodbclient.delete(params).promise();
};
