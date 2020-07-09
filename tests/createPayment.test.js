const chai = require('chai');
const AWS = require('aws-sdk-mock');

describe('Create Payment tests', () => {

    it('it ', done => {
        AWS.mock('DynamoDB.DocumentClient', 'get', function(params, callback) {
            callback(null, {Item: {Key: 'Value'}});
          });
      });
});