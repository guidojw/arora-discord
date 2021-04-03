'use strict'

const axios = require('axios')

function robloxAdapter (method, api, pathname, data) {
  return axios({
    url: `https://${api}.roblox.com/${pathname}`,
    method,
    data
  })
}

module.exports = robloxAdapter
