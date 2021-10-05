import type { CommandInteraction, Interaction } from 'discord.js'
import type { BaseCommand } from '../commands'
import type Client from './client'
import applicationConfig from '../configs/application'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class Dispatcher {
  @lazyInject(TYPES.CommandFactory)
  public readonly commandFactory!: (commandName: string) => BaseCommand | undefined

  private readonly client: Client

  public constructor (client: Client) {
    this.client = client
  }

  public async handleInteraction (interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      return await this.handleCommandInteraction(interaction)
    }
  }

  private async handleCommandInteraction (interaction: CommandInteraction): Promise<void> {
    const command = this.commandFactory(interaction.commandName)
    if (typeof command === 'undefined') {
      throw new Error(`Command "${interaction.commandName}" does not exist.`)
    }

    let error
    if (command.requiresApi === true && applicationConfig.apiEnabled !== true) {
      error = 'This command requires that the bot has an API connected.'
    }
    if (command.requiresRobloxGroup === true && (interaction.guild === null ||
      interaction.guild.robloxGroupId === null)) {
      error = 'This command requires that the server has its robloxGroup setting set.'
    }
    if (command.requiresSingleGuild === true && this.client.guilds.cache.size !== 1) {
      error = 'This command requires the bot to be in only one guild.'
    }
    if (command.ownerOwnly === true) {
      if (this.client.application?.owner === null) {
        await this.client.application?.fetch()
      }
      if (interaction.user.id !== this.client.application?.owner?.id) {
        error = 'This command can only be run by the application owner.'
      }
    }
    if (typeof error !== 'undefined') {
      return await interaction.reply({ content: error, ephemeral: true })
    }

    await command.execute(interaction)
  }
}
