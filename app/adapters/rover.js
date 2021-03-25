'use strict'
const axios = require('axios')

function roVerAdapter (method, pathname) {
  return axios({
    url: 'https://verify.eryn.io/api' + pathname,
    method
  })
}

module.exports = roVerAdapter
