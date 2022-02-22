import { type Argument, type BaseCommand, Command, SubCommandCommand } from '../commands'
import type { CommandInteraction, CommandInteractionOption, Interaction } from 'discord.js'
import type Client from './client'
import applicationConfig from '../configs/application'
import { constants } from '../utils'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class Dispatcher {
  @lazyInject(TYPES.CommandFactory)
  public readonly commandFactory!: (commandName: string) => (client: Client) => BaseCommand | undefined

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
    const command = this.commandFactory(interaction.commandName)(this.client)
    if (typeof command === 'undefined') {
      throw new Error(`Unknown command "${interaction.commandName}".`)
    }

    let error
    if (command.options.requiresApi === true && applicationConfig.apiEnabled !== true) {
      error = 'This command requires that the bot has an API connected.'
    }
    if (command.options.requiresRobloxGroup === true && (interaction.guildId === null ||
      this.client.guildContexts.resolve(interaction.guildId)?.robloxGroupId === null)) {
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

    let subCommandGroupName, subCommandName, subCommandArgs
    if (command instanceof SubCommandCommand) {
      subCommandGroupName = interaction.options.getSubcommandGroup(false)
      subCommandName = interaction.options.getSubcommand(false)
      if (subCommandName !== null) {
        subCommandArgs = subCommandGroupName !== null
          ? command.args[subCommandGroupName]?.[subCommandName]
          : command.args[subCommandName]
      } else {
        throw new Error(`Unknown subcommand "${subCommandName ?? 'unknown'}".`)
      }
    } else if (command instanceof Command) {
      subCommandName = interaction.commandName
      subCommandArgs = command.args
    } else {
      throw new Error('Invalid command.')
    }

    const args = typeof subCommandArgs !== 'undefined'
      ? await Dispatcher.parseArgs(interaction, subCommandArgs as Record<string, Argument<any>>)
      : {}

    if (command instanceof Command) {
      return await command.execute(interaction, args)
    } else {
      return subCommandGroupName != null
        ? await command.execute(interaction, subCommandGroupName, subCommandName, args)
        : await command.execute(interaction, subCommandName, args)
    }
  }

  private static async parseArgs (
    interaction: CommandInteraction,
    args: Record<string, Argument<any>>
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {}
    for (const [key, arg] of Object.entries(args)) {
      const option = interaction.options.get(arg.key, arg.required ?? true)
      if (option === null && typeof arg.default === 'undefined') {
        result[key] = null
        continue
      }

      const val = option !== null
        ? Dispatcher.getCommandInteractionOptionValue(option)
        : typeof arg.default === 'string' ? arg.default : (arg.default as Function)(interaction)
      if (typeof val !== 'string') {
        result[key] = val
        continue
      }

      if (arg.validate !== null) {
        const valid = await arg.validate(val, interaction, arg)
        if (valid === false) {
          throw new Error(`Invalid ${arg.key}`)
        } else if (typeof valid === 'string') {
          throw new Error(valid)
        }
      }

      if (arg.parse !== null) {
        result[key] = await arg.parse(val, interaction, arg)
        continue
      }

      result[key] = val
    }
    return result
  }

  private static getCommandInteractionOptionValue (
    option: CommandInteractionOption
  ): Exclude<
    | CommandInteractionOption['value']
    | CommandInteractionOption['user']
    | CommandInteractionOption['member']
    | CommandInteractionOption['channel']
    | CommandInteractionOption['role'],
    undefined
    > {
    switch (option.type) {
      case 'SUB_COMMAND':
      case 'SUB_COMMAND_GROUP':
      case 'STRING':
      case 'INTEGER':
      case 'BOOLEAN': return option.value ?? null
      // Discord.js resolves the user to a member too. The dispatcher will
      // always send the member as option value to the commands since most
      // commands require the member anyway, and it's easier to get the user
      // from a member than vice versa.
      case 'USER': return option.member ?? null
      case 'CHANNEL': return option.channel ?? null
      case 'ROLE': return option.role ?? null
      case 'MENTIONABLE': return option.member ?? option.user ?? option.role ?? null
      case 'NUMBER': return option.value ?? null
      default: return null
    }
  }
}
