'use strict';

const AWS = require('aws-sdk');
const dynamodbclient = new AWS.DynamoDB.DocumentClient();

module.exports.getPayments = (event, context, callback) => {
  const params = {
    TableName: process.env.payment_table,
  };
  
  dynamodbclient.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'application/json' },
        body: {
          'error': 'failed to getting all payments.'
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
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });
};