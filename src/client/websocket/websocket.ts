import type Client from '../client'
import WebSocket from 'ws'

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

  public constructor (client: Client, host = process.env.WS_HOST) {
    this.client = client
    this.host = host ?? 'ws://127.0.0.1'
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
      clearTimeout(this.pingTimeout)
    }
    setTimeout(this.connect.bind(this), RECONNECT_TIMEOUT).unref()
  }

  private onPing (): void {
    this.heartbeat()
  }

  private heartbeat (): void {
    if (this.pingTimeout !== null) {
      clearTimeout(this.pingTimeout)
    }
    this.pingTimeout = setTimeout(() => this.connection?.terminate(), PING_TIMEOUT).unref()
  }

  private handlePacket (packet: Packet): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.client.packetHandlerFactory(packet.event).handle(this.client, packet)
  }
}
