const isPlainObject = require('lodash.isplainobject');
const { UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR } = require('http-status-codes');

const EXPOSE_KEY = Symbol('expose');
const LOG_KEY = Symbol('log');
const DETAILS_KEY = Symbol('details');
const STATUS_CODE_KEY = Symbol('statusCode');

function wrapError(errorData, { statusCode, expose = false, log = true } = {}) {
  let error;

  if (typeof errorData === 'string') {
    const errorMessage = errorData;
    error = new Error(errorMessage);
  } else if (isPlainObject(errorData)) {
    const errorDetails = errorData;
    const errorMessage = Object.values(errorDetails).join('\n');

    error = new Error(errorMessage);
    error[DETAILS_KEY] = errorDetails;
  } else {
    error = errorData;
  }

  error[STATUS_CODE_KEY] = statusCode;
  error[EXPOSE_KEY] = expose;
  error[LOG_KEY] = log;

  return error;
}

function raise(...args) {
  throw wrapError(...args);
}

function raiseExpected(errorData, options = {}) {
  raise(errorData, {
    statusCode: UNPROCESSABLE_ENTITY,
    expose: true,
    log: false,
    ...options,
  });
}

function isExposable(error) {
  return error[EXPOSE_KEY] === true;
}

function isLoggable(error) {
  return error[LOG_KEY] !== false;
}

function getMessage(error) {
  return error.message;
}

function getDetails(error) {
  return error[DETAILS_KEY] || {};
}

function getStatusCode(error) {
  return error[STATUS_CODE_KEY] || error.statusCode || error.status || INTERNAL_SERVER_ERROR;
}

module.exports = {
  wrapError,
  raise,
  raiseExpected,
  isExposable,
  isLoggable,
  getMessage,
  getDetails,
  getStatusCode,
};
