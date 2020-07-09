const chai = require('chai');
const AWS = require('aws-sdk-mock');
const MockResponse = require('./dynamodbMockResponse');

describe('Get Payment tests', () => {

    it('it should return a single Payment record', done => {
        AWS.mock('DynamoDB.DocumentClient', 'get', function(params, callback) {
            callback(null, MockResponse.getByPaymentIdMockResponse());
          });
        
          done();
      });
});