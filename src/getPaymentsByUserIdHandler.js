'use strict';

const AWS = require('aws-sdk');
const dynamodbclient = new AWS.DynamoDB.DocumentClient();

module.exports.getPaymentsByUserId = (event, context, callback) => {

  console.log('Fetching all payment for user ' + event.pathParameters.userId)

  const params = {
    TableName: process.env.payment_table,
    FilterExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': event.pathParameters.userId,
    },
  };

  dynamodbclient.scan(params, (error, result) => {
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
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });
};