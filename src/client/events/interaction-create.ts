import type BaseHandler from '../base'
import type Client from '../client'
import type { Interaction } from 'discord.js'
import { injectable } from 'inversify'

@injectable()
export default class InteractionCreateEventHandler implements BaseHandler {
  public async handle (client: Client, interaction: Interaction): Promise<void> {
    try {
      await client.dispatcher.handleInteraction(interaction)
    } catch (err: any) {
      if (interaction.isCommand() && !interaction.replied) {
        return await interaction.reply({
          content: err.toString(),
          ephemeral: true
        })
      }
      throw err
    }
  }
}
