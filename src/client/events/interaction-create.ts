import type { BaseHandler, Dispatcher } from '..'
import { inject, injectable } from 'inversify'
import type { Interaction } from 'discord.js'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class InteractionCreateEventHandler implements BaseHandler {
  @inject(TYPES.Dispatcher)
  private readonly dispatcher!: Dispatcher

  public async handle (interaction: Interaction): Promise<void> {
    try {
      await this.dispatcher.handleInteraction(interaction)
    } catch (err: any) {
      console.error(err)
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
