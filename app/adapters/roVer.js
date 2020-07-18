'use strict'
const axios = require('axios')

module.exports = async (method, pathname) => {
    return axios({
        method,
        url: 'https://verify.eryn.io/api' + pathname
    })
}
