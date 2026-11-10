'use strict';

// R16-56: only intentional application-created client errors receive this mark.
// A numeric HTTP status supplied by an unexpected exception is NOT sufficient.
const expectedClientErrors = new WeakSet();

function markExpectedClientError(error) {
    if (error && (typeof error === 'object' || typeof error === 'function')) {
        expectedClientErrors.add(error);
    }
    return error;
}

function isExpectedClientError(error) {
    return Boolean(error && expectedClientErrors.has(error));
}

module.exports = { markExpectedClientError, isExpectedClientError };
