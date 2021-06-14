import WebSocket, { ErrorEvent } from 'ws'
import type Client from '../client'
import packetHandlers from './handlers'

export interface Packet {
  event: string
  data?: any
}

const RECONNECT_TIMEOUT = 30 * 1000
const PING_TIMEOUT = 30 * 1000 + 1000

export default class WebSocketManager {
  public readonly client: Client
  private readonly host: string
  private connection: WebSocket | null
  private pingTimeout: NodeJS.Timeout | null

  public constructor (client: Client, host = process.env.HOST) {
    this.client = client
    this.host = host ?? '127.0.0.1'
    this.connection = null
    this.pingTimeout = null
  }

  public connect (): void {
    if (typeof process.env.TOKEN === 'undefined') {
      throw new Error('Invalid token.')
    }

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

  private onOpen (): void {
    console.log('Connected!')
    this.heartbeat()
  }

  private onMessage (data: Extract<WebSocket.Data, string>): void {
    this.handlePacket(JSON.parse(data))
  }

  private onClose (): void {
    console.log('Disconnected!')
    if (this.pingTimeout !== null) {
      this.client.clearTimeout(this.pingTimeout)
    }
    this.client.setTimeout(this.connect.bind(this), RECONNECT_TIMEOUT)
  }

  private onError (error: ErrorEvent): void {
    // @ts-expect-error
    this.client.emit('webSocketError', error)
  }

  private onPing (): void {
    this.heartbeat()
  }

  private heartbeat (): void {
    if (this.pingTimeout !== null) {
      this.client.clearTimeout(this.pingTimeout)
    }
    this.pingTimeout = this.client.setTimeout(() => this.connection?.terminate(), PING_TIMEOUT)
  }

  private handlePacket (packet: Packet): void {
    packetHandlers[packet.event]?.(this.client, packet)
  }
}
