import type { Client } from 'discord.js'

export default abstract class BaseStructure {
  public readonly client: Client<true>

  public constructor (client: Client<true>) {
    this.client = client
  }

  public abstract setup (data: any): void
}
