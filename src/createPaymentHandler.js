'use strict';
const uuid = require('uuid');
const AWS = require('aws-sdk');
const dynamodbclient = new AWS.DynamoDB.DocumentClient();

module.exports.createPayment = (event, context, callback) => {

  const timestamp = new Date().getTime();
  const _uuid = uuid.v1();
  const data = JSON.parse(event.body);
 
  console.log('Creating Payement ' + _uuid);
  const params = {
    TableName: process.env.payment_table,
    Item: data
  };

  dynamodbclient.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'application/json' },
        body: {
          'error': 'failed to create payment.'
        },
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      },
      body: '',
    };
    callback(null, response);
  });
};
