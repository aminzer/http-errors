const { Forbidden } = require('http-errors');
const {
  wrapError,
  raise,
  raiseExpected,
  isLoggable,
  isExposable,
  getMessage,
  getDetails,
  getStatusCode,
} = require('../src');

const testCases = [
  {
    description: 'when string is passed',
    args: ['Some message'],
    expectedResults: {
      message: 'Some message',
      details: {},
      statusCode: 500,
      isLogged: true,
      isExposed: false,
    },
  }, {
    description: 'when plain object is passed',
    args: [{ key1: 'value1', key2: 'value2' }],
    expectedResults: {
      message: 'value1\nvalue2',
      details: { key1: 'value1', key2: 'value2' },
      statusCode: 500,
      isLogged: true,
      isExposed: false,
    },
  }, {
    description: 'when https error is passed',
    args: [new Forbidden()],
    expectedResults: {
      message: 'Forbidden',
      details: {},
      statusCode: 403,
      isLogged: true,
      isExposed: false,
    },
  }, {
    description: 'when error is passed',
    args: [new Error('Some message')],
    expectedResults: {
      message: 'Some message',
      details: {},
      statusCode: 500,
      isLogged: true,
      isExposed: false,
    },
  }, {
    description: 'when `exposed` option is set to `true`',
    args: ['Some message', { expose: true }],
    expectedResults: {
      message: 'Some message',
      details: {},
      statusCode: 500,
      isLogged: true,
      isExposed: true,
    },
  }, {
    description: 'when `exposed` option is set to `false`',
    args: ['Some message', { expose: false }],
    expectedResults: {
      message: 'Some message',
      details: {},
      statusCode: 500,
      isLogged: true,
      isExposed: false,
    },
  }, {
    description: 'when `log` option is set to `true`',
    args: ['Some message', { log: true }],
    expectedResults: {
      message: 'Some message',
      details: {},
      statusCode: 500,
      isLogged: true,
      isExposed: false,
    },
  }, {
    description: 'when `log` option is set to `false`',
    args: ['Some message', { log: false }],
    expectedResults: {
      message: 'Some message',
      details: {},
      statusCode: 500,
      isLogged: false,
      isExposed: false,
    },
  }, {
    description: 'when `exposed` option is set to `true` and `log` option is set to `false`',
    args: ['Some message', { expose: true, log: false }],
    expectedResults: {
      message: 'Some message',
      details: {},
      statusCode: 500,
      isLogged: false,
      isExposed: true,
    },
  }, {
    description: 'when `statusCode` option is set',
    args: ['Some message', { statusCode: 404 }],
    expectedResults: {
      message: 'Some message',
      details: {},
      statusCode: 404,
      isLogged: true,
      isExposed: false,
    },
  }, {
    description: 'when `statusCode` option is set and error contains `statusCode` prop',
    args: [new Forbidden(), { statusCode: 404 }],
    expectedResults: {
      message: 'Forbidden',
      details: {},
      statusCode: 404,
      isLogged: true,
      isExposed: false,
    },
  },
];

function checkTestCase(receivedError, expectedResults) {
  const {
    message, details, statusCode, isLogged, isExposed,
  } = expectedResults;

  it('creates error', () => {
    expect(receivedError).toBeInstanceOf(Error);
  });

  it('creates error with correct message', () => {
    expect(getMessage(receivedError)).toBe(message);
  });

  it('creates error with correct details', () => {
    expect(getDetails(receivedError)).toEqual(details);
  });

  it('creates error with status code', () => {
    expect(getStatusCode(receivedError)).toBe(statusCode);
  });

  it(`creates error which will ${isLogged ? '' : 'not '}be logged`, () => {
    expect(isLoggable(receivedError)).toBe(isLogged);
  });

  it(`creates error which will ${isExposed ? '' : 'not '}be exposed`, () => {
    expect(isExposable(receivedError)).toBe(isExposed);
  });
}

describe('errorHelper', () => {
  describe('wrapError', () => {
    testCases.forEach(({ description, args, expectedResults }) => {
      describe(description, () => {
        const error = wrapError(...args);
        checkTestCase(error, expectedResults);
      });
    });
  });

  describe('raise', () => {
    testCases.forEach(({ description, args, expectedResults }) => {
      describe(description, () => {
        try {
          raise(...args);
          expect(false).toBe(true);
        } catch (error) {
          checkTestCase(error, expectedResults);
        }
      });
    });
  });

  describe('raiseExpected', () => {
    try {
      raiseExpected('Some message');
      expect(false).toBe(true);
    } catch (error) {
      checkTestCase(error, {
        message: 'Some message',
        details: {},
        statusCode: 422,
        isLogged: false,
        isExposed: true,
      });
    }
  });
});
