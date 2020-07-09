'use strict';

const AWS = require('aws-sdk');

const dynamodbclient = new AWS.DynamoDB.DocumentClient();

module.exports.updatePayment = async (data) => {
  console.log(`Updating payment ${data.paymentId}`);
  const params = {
    TableName: process.env.payment_table,
    Item: data,
  };

  return dynamodbclient.put(params).promise();
};
