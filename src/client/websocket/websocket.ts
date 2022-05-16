import { inject, injectable, type interfaces } from 'inversify'
import type { BaseHandler } from '..'
import WebSocket from 'ws'
import { constants } from '../../utils'

const { TYPES } = constants

const RECONNECT_TIMEOUT = 30_000
const PING_TIMEOUT = 30_000 + 1000

export interface Packet {
  event: string
  data?: any
}

@injectable()
export default class WebSocketManager {
  @inject(TYPES.PacketHandlerFactory)
  private readonly packetHandlerFactory!: interfaces.AutoNamedFactory<BaseHandler>

  private readonly host: string
  private connection: WebSocket | null
  private pingTimeout: NodeJS.Timeout | null

  public constructor () {
    this.host = 'ws://127.0.0.1'
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
    Promise.resolve(this.packetHandlerFactory(packet.event).handle(packet)).catch(console.error)
  }
}
