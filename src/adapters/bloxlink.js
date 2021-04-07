'use strict'

const axios = require('axios')

function bloxlinkAdapter (method, pathname) {
  return axios({
    url: 'https://api.blox.link/v1/' + pathname,
    method
  })
}

module.exports = bloxlinkAdapter
