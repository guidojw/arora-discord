'use strict'
const axios = require('axios')

function request (method, pathname) {
  return axios({
    method,
    url: 'https://verify.eryn.io/api' + pathname
  })
}

module.exports = request
