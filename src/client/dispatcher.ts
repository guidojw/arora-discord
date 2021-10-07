import type { ArgumentOptions, BaseCommand } from '../commands'
import { Command, SubCommandCommand } from '../commands'
import type { CommandInteraction, Interaction } from 'discord.js'
import type { BaseArgumentType } from '../types'
import type Client from './client'
import applicationConfig from '../configs/application'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class Dispatcher {
  @lazyInject(TYPES.ArgumentTypeFactory)
  public readonly argumentTypeFactory!: (argumentTypeName: string) => BaseArgumentType<any> | undefined

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
    if (command.options.requiresApi === true && applicationConfig.apiEnabled !== true) {
      error = 'This command requires that the bot has an API connected.'
    }
    if (command.options.requiresRobloxGroup === true && (interaction.guild === null ||
      interaction.guild.robloxGroupId === null)) {
      error = 'This command requires that the server has its robloxGroup setting set.'
    }
    if (command.options.requiresSingleGuild === true && this.client.guilds.cache.size !== 1) {
      error = 'This command requires the bot to be in only one guild.'
    }
    if (command.options.ownerOwnly === true) {
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

    let subcommandName
    let subcommandOptions
    if (command instanceof Command) {
      subcommandName = interaction.commandName
      subcommandOptions = command.options.command
    } else if (command instanceof SubCommandCommand) {
      subcommandName = interaction.options.getSubcommand(true)
      subcommandOptions = command.options.subcommands[subcommandName]
    }
    if (typeof subcommandName === 'undefined' || typeof subcommandOptions === 'undefined') {
      throw new Error(`Subcommand "${subcommandName ?? 'unknown'}" does not exist.`)
    }

    const args = subcommandOptions !== true
      ? await this.parseArgs(interaction, Object.values(subcommandOptions.args))
      : {}

    if (command instanceof Command) {
      return await command.execute(interaction, args)
    } else if (command instanceof SubCommandCommand) {
      return await command.execute(interaction, subcommandName, args)
    }
  }

  private async parseArgs (interaction: CommandInteraction, args: ArgumentOptions[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {}
    for (const arg of args) {
      const option = interaction.options.get(arg.key, arg.required)
      if (option === null) {
        result[arg.key] = null
        continue
      }

      const val = option.value
      if (typeof val === 'string' && typeof arg.type !== 'undefined') {
        const argumentType = this.argumentTypeFactory(arg.type)
        if (typeof argumentType === 'undefined') {
          throw new Error(`Argument type "${arg.type}" does not exist.`)
        }

        const validationResult = await argumentType.validate(val, interaction, arg)
        if (validationResult === false) {
          throw new Error(`Invalid ${arg.key}`)
        } else if (typeof validationResult === 'string') {
          throw new Error(validationResult)
        }
        result[arg.key] = await argumentType.parse(val, interaction, arg)
      }
    }
    return result
  }
}
