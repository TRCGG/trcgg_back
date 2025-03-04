const axios = require('axios');

const instance = axios.create({
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    // TO-DO pre job before requests
    // ex) add tokens
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // The server responded with a status code other than 2xx
      console.error('Response Error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // request error (got no response)
      console.error('Request Error:', error.request);
    } else {
      // request setting error
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// HTTP methods
const httpClient = {
  /**
   * @description GET Request
   * @param {string} url - Request URL
   * @param {Object} [config] - axios Setting
   */
  async get(url, config = {}) {
    try {
      return await instance.get(url, config);
    } catch (error) {
      throw error;
    }
  },

  /**
   * @description POST Request
   * @param {string} url - Request URL
   * @param {Object} data - Request Data
   * @param {Object} [config] - axios Setting
   */
  async post(url, data, config = {}) {
    try {
      return await instance.post(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  /**
   * @description PUT Request
   * @param {string} url - Request URL
   * @param {Object} data - Request Data
   * @param {Object} [config] - axios Setting
   */
  async put(url, data, config = {}) {
    try {
      return await instance.put(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  /**
   * @description DELETE Request
   * @param {string} url - Request URL
   * @param {Object} [config] - axios Setting
   */
  async delete(url, config = {}) {
    try {
      return await instance.delete(url, config);
    } catch (error) {
      throw error;
    }
  },
};

module.exports = httpClient;