'use strict'
const EventEmitter = require('events')
const WebSocket = require('ws')

module.exports = class WebSocketController extends EventEmitter {
    constructor (host) {
        super()
        this.host = host

        this.connect()
    }

    connect () {
        this.connection = new WebSocket(this.host + '/v1')
        this.connection.on('open', this.open.bind(this))
        this.connection.on('error', this.error.bind(this))
        this.connection.on('close', this.close.bind(this))
        this.connection.on('ping', this.ping.bind(this))
        this.connection.on('message', this.message.bind(this))
    }

    heartbeat () {
        clearTimeout(this.pingTimeout)
        this.pingTimeout = setTimeout(() => {
            this.connection.terminate()
        }, 60000 + 1000)
    }

    open () {
        this.heartbeat()
    }

    error (err) {
        console.error(err)
    }

    close () {
        clearTimeout(this.pingTimeout)
        this.connect()
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
