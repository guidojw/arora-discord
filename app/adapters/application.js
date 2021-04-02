'use strict'

const axios = require('axios')

function applicationAdapter (method, pathname, data) {
  return axios({
    url: process.env.HOST + pathname,
    method,
    data,
    headers: {
      Authorization: `Bearer ${process.env.TOKEN}`
    }
  })
}

module.exports = applicationAdapter
