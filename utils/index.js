/**
 * Try catch for promises
 * @param {Promise} promise
 * @returns {Promise<Array>} data,error
 */
const asyncTryCatch = async (promise) => {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error];
  }
};

module.exports = {
  asyncTryCatch,
};
