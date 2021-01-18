'use strict'
const WebSocket = require('ws')
const packetHandlers = require('./handlers')

class WebSocketManager {
  constructor (client, host = process.env.HOST) {
    this.client = client

    this.host = host
  }

  connect () {
    this.ws = new WebSocket(`${this.host}/v1`, {
      headers: {
        Authorization: `Bearer ${process.env.TOKEN}`
      }
    })

    this.ws.on('open', this.onOpen.bind(this))
    this.ws.on('message', this.onMessage.bind(this))
    this.ws.on('close', this.onClose.bind(this))
    this.ws.on('error', this.onError.bind(this))
    this.ws.on('ping', this.onPing.bind(this))
  }

  onOpen () {
    console.log('Connected!')
    this.heartbeat()
  }

  onMessage (message) {
    const packet = JSON.parse(message)
    this.handlePacket(packet)
  }

  onClose () {
    console.log('Disconnected!')
    clearTimeout(this.pingTimeout)
    setTimeout(this.connect.bind(this), 30000)
  }

  onError (error) {
    this.client.emit('webhookError', error)
  }

  onPing () {
    this.heartbeat()
  }

  heartbeat () {
    clearTimeout(this.pingTimeout)
    this.pingTimeout = setTimeout(this.ws.terminate, 30000 + 1000)
  }

  handlePacket (packet) {
    if (packet && packetHandlers[packet.event]) {
      packetHandlers[packet.event](this.client, packet)
    }
  }
}

module.exports = WebSocketManager
