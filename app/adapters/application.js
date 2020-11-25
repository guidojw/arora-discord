'use strict'
const axios = require('axios')

const applicationConfig = require('../../config/application')

module.exports = async (method, pathname, data) => {
  if (applicationConfig.apiEnabled) {
    return axios({
      method,
      url: process.env.HOST + pathname,
      data,
      headers: {
        Authorization: 'Bearer ' + process.env.TOKEN
      }
    })
  } else {
    throw new Error('This bot has no API enabled.')
  }
}
