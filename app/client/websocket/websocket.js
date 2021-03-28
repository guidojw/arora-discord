'use strict'

const WebSocket = require('ws')
const packetHandlers = require('./handlers')

const RECONNECT_TIMEOUT = 30 * 1000
const PING_TIMEOUT = 30 * 1000 + 1000

class WebSocketManager {
  constructor (client, host = process.env.HOST) {
    this.client = client

    this.host = host
  }

  connect () {
    const ws = (this.connection = new WebSocket(`${this.host}/v1`, {
      headers: {
        Authorization: `Bearer ${process.env.TOKEN}`
      }
    }))

    ws.on('open', this.onOpen.bind(this))
    ws.on('message', this.onMessage.bind(this))
    ws.on('ping', this.onPing.bind(this))
    ws.on('error', this.onError.bind(this))
    ws.on('close', this.onClose.bind(this))
  }

  onOpen () {
    console.log('Connected!')
    this.heartbeat()
  }

  onMessage (message) {
    const packet = JSON.parse(message)
    return this.handlePacket(packet)
  }

  onClose () {
    console.log('Disconnected!')
    clearTimeout(this.pingTimeout)
    setTimeout(this.connect.bind(this), RECONNECT_TIMEOUT)
  }

  onError (error) {
    this.client.emit('webSocketError', error)
  }

  onPing () {
    this.heartbeat()
  }

  heartbeat () {
    clearTimeout(this.pingTimeout)
    this.pingTimeout = setTimeout(this.connection.terminate, PING_TIMEOUT)
  }

  handlePacket (packet) {
    if (packet && packetHandlers[packet.event]) {
      return packetHandlers[packet.event](this.client, packet)
    }
  }
}

module.exports = WebSocketManager
