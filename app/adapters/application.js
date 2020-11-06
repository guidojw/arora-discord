'use strict'
const axios = require('axios')

module.exports = async (method, pathname, data) => {
  return axios({
    method,
    url: process.env.HOST + pathname,
    data,
    headers: {
      Authorization: 'Bearer ' + process.env.TOKEN
    }
  })
}
