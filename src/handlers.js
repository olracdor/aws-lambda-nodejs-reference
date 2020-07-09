const getService = require('./services/getService');
const updateService = require('./services/updateService');
const createService = require('./services/createService');
const deleteService = require('./services/deleteService');
const commonService = require('./services/commonService');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

const errorBody = {
  'error': 'failed to get payments.',
};

module.exports.getPayments = async (event, context) => {
  try {
    const result = await getService.getPayments();
    if (result) {
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(result),
      };
    }

    return {
      statusCode: 404,
      headers: headers,
      body: '',
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: error.statusCode || 501,
      headers: headers,
      body: errorBody,
    };
  }
};

module.exports.getPaymentsByUserId = async (event, context) => {
  try {
    const result = await getService
        .getPaymentsByUserId(event.pathParameters.userId);
    if (result) {
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(result),
      };
    }
    return {
      statusCode: 404,
      headers: headers,
      body: '',
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: error.statusCode || 501,
      headers: headers,
      body: errorBody,
    };
  }
};

module.exports.getPaymentById = async (event, context) => {
  try {
    const result = await getService
        .getPaymentById(event.pathParameters.paymentId);
    if (result) {
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(result),
      };
    }
    return {
      statusCode: 404,
      headers: headers,
      body: '',
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: error.statusCode || 501,
      headers: headers,
      body: errorBody,
    };
  }
};

module.exports.createPayment = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    const userId = data.userId;
    const status = data.status;
    const newIdResponse = await commonService.getNewPaymentId();

    const body = JSON.parse(newIdResponse.Payload).body;
    const newPaymentId = JSON.parse(body).refId;
    const response = await createService.createPayment(newPaymentId, data);

    commonService.handleUpdateCascade(newPaymentId, userId, status);
    console.log(response.result);
    // if(response.result)
    return {
      statusCode: 201,
      headers: headers,
      body: JSON.stringify({
        meta: {
          type: 'Create payment',
        },
        data: {
          paymentId: data.paymentId,
        },
      }),
    };
  } catch (error) {
    console.log(error);

    return {
      statusCode: error.statusCode || 501,
      headers: headers,
      body: errorBody,
    };
  }
};

module.exports.updatePayment = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    const userId = data.userId;
    const status = data.status;
    const paymentId = data.paymentId;

    console.log('Updating payment');

    const result = await updateService.updatePayment(data);

    if (result) {
      commonService.handleUpdateCascade(paymentId, userId, status);

      return {
        statusCode: 204,
        headers: headers,
        body: '',
      };
    }

    return {
      statusCode: 501,
      headers: headers,
      body: errorBody,
    };
  } catch (error) {
    console.log(error);

    return {
      statusCode: error.statusCode || 501,
      headers: headers,
      body: errorBody,
    };
  }
};

module.exports.deletePayment = async (event, context) => {
  try {
    const result = await deleteService
        .deletePayment(event.pathParameters.paymentId);
    if (result) {
      return {
        statusCode: 200,
        headers: headers,
        body: '',
      };
    }

    return {
      statusCode: 404,
      headers: headers,
      body: '',
    };
  } catch (error) {
    console.log(error);

    return {
      statusCode: error.statusCode || 501,
      headers: headers,
      body: errorBody,
    };
  }
};
