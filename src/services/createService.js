'use strict';

const AWS = require('aws-sdk');
const dynamodbclient = new AWS.DynamoDB.DocumentClient();

module.exports.createPayment = async (newPaymentId, data) => {
  data.paymentId=newPaymentId;
  console.log(`Creating Payement ${data.paymentId}`);

  const params = {
    TableName: process.env.payment_table,
    Item: data,
  };

  return dynamodbclient.put(params).promise();
};
