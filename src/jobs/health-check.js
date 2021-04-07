'use strict'

const axios = require('axios')

function healthCheckJob (healthCheck) {
  const url = process.env[`${healthCheck.toUpperCase()}_HEALTH_CHECK_URL`]
  if (url) {
    return axios.get(url)
  }
}

module.exports = healthCheckJob
