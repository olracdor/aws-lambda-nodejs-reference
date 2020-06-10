'use strict';
const uuid = require('uuid');
const AWS = require('aws-sdk');
const dynamodbclient = new AWS.DynamoDB.DocumentClient();

module.exports.getPaymentById = (event, context, callback) => {
  const params = {
    TableName: process.env.payment_table,
    Key: {
      paymentId: event.pathParameters.paymentId,
    },
  };

  dynamodbclient.get(params, (error, result) => {
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
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
};
