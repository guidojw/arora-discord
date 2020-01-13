'use strict'
require('dotenv').config()

const axios = require('axios')

module.exports = async (method, pathname, data) => {
    return axios({
        method: method,
        url: process.env.HOST + pathname,
        data: data,
        headers: {
            Authorization: 'Bearer ' + process.env.TOKEN
        }
    })
}
