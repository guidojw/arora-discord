'use strict'

const axios = require('axios')

const applicationConfig = require('../../config/application')

function applicationAdapter (method, pathname, data) {
  if (applicationConfig.apiEnabled) {
    return axios({
      url: process.env.HOST + pathname,
      method,
      data,
      headers: {
        Authorization: `Bearer ${process.env.TOKEN}`
      }
    })
  } else {
    throw new Error('This bot has no API enabled.')
  }
}

module.exports = applicationAdapter
