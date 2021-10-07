import type {
  APIInteractionDataResolvedChannel,
  APIInteractionDataResolvedGuildMember,
  APIMessage,
  APIRole
} from 'discord-api-types'
import type { ArgumentOptions, BaseCommand } from '../commands'
import { Command, SubCommandCommand } from '../commands'
import type {
  CommandInteraction,
  CommandInteractionOption,
  GuildChannel,
  GuildMember,
  Interaction,
  Message,
  Role,
  ThreadChannel,
  User
} from 'discord.js'
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
      const key = arg.name ?? arg.key
      const option = interaction.options.get(arg.key, arg.required ?? true)
      if (option === null) {
        result[key] = null
        continue
      }

      const val = Dispatcher.getCommandInteractionOptionValue(option)
      if (typeof val !== 'string') {
        result[key] = val
        continue
      }

      let argumentType
      if (typeof arg.type !== 'undefined') {
        argumentType = this.argumentTypeFactory(arg.type)
        if (typeof argumentType === 'undefined' &&
          (typeof arg.validate === 'undefined' || typeof arg.parse === 'undefined')) {
          throw new Error(`Argument type "${arg.type}" does not exist.`)
        }
      }

      if (typeof arg.validate !== 'undefined' || typeof argumentType !== 'undefined') {
        const valid = await (arg.validate?.(val, interaction) ?? argumentType?.validate(val, interaction, arg))
        if (valid === false) {
          throw new Error(`Invalid ${arg.key}`)
        } else if (typeof valid === 'string') {
          throw new Error(valid)
        }
      }

      if (typeof arg.parse !== 'undefined' || typeof argumentType !== 'undefined') {
        const parse = arg.parse ?? argumentType?.parse
        result[key] = await parse?.(val, interaction, arg)
      }

      result[key] = val
    }
    return result
  }

  private static getCommandInteractionOptionValue (
    option: CommandInteractionOption
  ): string | number | boolean | User | GuildMember | APIInteractionDataResolvedGuildMember | GuildChannel |
    ThreadChannel | APIInteractionDataResolvedChannel | Role | APIRole | Message | APIMessage | null {
    switch (option.type) {
      case 'SUB_COMMAND':
      case 'SUB_COMMAND_GROUP':
      case 'STRING':
      case 'INTEGER':
      case 'BOOLEAN': return option.value ?? null
      case 'USER': return option.user ?? null
      case 'CHANNEL': return option.channel ?? null
      case 'ROLE': return option.role ?? null
      case 'MENTIONABLE': return option.member ?? option.user ?? option.role ?? null
      default: return null
    }
  }
}
