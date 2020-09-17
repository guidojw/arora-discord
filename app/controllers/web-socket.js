'use strict'
require('dotenv').config()

const EventEmitter = require('events')
const WebSocket = require('ws')

module.exports = class WebSocketController extends EventEmitter {
    constructor (host) {
        super()
        this.host = host
        this.connect()
    }

    connect () {
        this.connection = new WebSocket(`${this.host}/v1`, {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`
            }
        })

        this.connection.on('open', this.open.bind(this))
        this.connection.on('error', console.error)
        this.connection.on('close', this.close.bind(this))
        this.connection.on('ping', this.ping.bind(this))
        this.connection.on('message', this.message.bind(this))
    }

    heartbeat () {
        clearTimeout(this.pingTimeout)
        this.pingTimeout = setTimeout(() => {
            this.connection.terminate()
        }, 30000 + 1000)
    }

    open () {
        console.log('Connected!')
        this.heartbeat()
    }

    close () {
        console.log('Disconnected!')
        clearTimeout(this.pingTimeout)
        setTimeout(this.connect.bind(this), 30000)
    }

    ping () {
        this.heartbeat()
    }

    message (message) {
        const { event, data } = JSON.parse(message)
        const [...args] = Object.values(data)
        this.emit(event, ...args)
    }
}
