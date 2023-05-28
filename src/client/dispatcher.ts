import {
  ApplicationCommandOptionType,
  type ChatInputCommandInteraction,
  type CommandInteractionOption,
  type Interaction,
  type MessageComponentInteraction
} from 'discord.js'
import {
  type Argument,
  type BaseCommand,
  Command,
  SubCommandCommand
} from '../interactions/application-commands'
import { inject, injectable, type interfaces, named } from 'inversify'
import type { GuildContext } from '../structures'
import { GuildContextManager } from '../managers'
import applicationConfig from '../configs/application'
import { constants } from '../utils'

const { TYPES } = constants

@injectable()
export default class Dispatcher {
  @inject(TYPES.CommandFactory)
  private readonly commandFactory!: interfaces.AutoNamedFactory<BaseCommand | undefined>

  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async handleInteraction (interaction: Interaction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      await this.handleCommandInteraction(interaction)
    } else if (interaction.isMessageComponent()) {
      await this.handleMessageComponentInteraction(interaction)
    }
  }

  private async handleCommandInteraction (interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this.commandFactory(interaction.commandName)
    if (typeof command === 'undefined') {
      throw new Error(`Unknown command "${interaction.commandName}".`)
    }

    let error
    if (command.options.requiresApi === true && applicationConfig.apiEnabled !== true) {
      error = 'This command requires that the bot has an API connected.'
    }
    if (
      command.options.requiresRobloxGroup === true && (interaction.guildId === null ||
        this.guildContexts.resolve(interaction.guildId)?.robloxGroupId === null)
    ) {
      error = 'This command requires that the server has its robloxGroup setting set.'
    }
    if (command.options.requiresSingleGuild === true && interaction.client.guilds.cache.size !== 1) {
      error = 'This command requires the bot to be in only one guild.'
    }
    if (command.options.ownerOwnly === true) {
      if (interaction.client.application?.owner === null) {
        await interaction.client.application?.fetch()
      }
      if (interaction.user.id !== interaction.client.application?.owner?.id) {
        error = 'This command can only be run by the application owner.'
      }
    }
    if (typeof error !== 'undefined') {
      await interaction.reply({ content: error, ephemeral: true })
      return
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
      ? await this.parseArgs(interaction, subCommandArgs as Record<string, Argument<any>>)
      : {}

    command instanceof Command
      ? await command.execute(interaction, args)
      : subCommandGroupName == null
        ? await command.execute(interaction, subCommandName, args)
        : await command.execute(interaction, subCommandGroupName, subCommandName, args)
  }

  private async handleMessageComponentInteraction (interaction: MessageComponentInteraction): Promise<void> {
    if (interaction.isButton()) {
      if (!interaction.inGuild() || interaction.customId.startsWith('prompt:')) {
        return
      }
      const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

      await context.tickets.onButtonInteraction(interaction)
    }
  }

  private async parseArgs (
    interaction: ChatInputCommandInteraction,
    args: Record<string, Argument<any>>
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {}
    for (const [key, arg] of Object.entries(args)) {
      const option = interaction.options.get(arg.key, arg.required ?? true)
      let val = null
      if (option === null) {
        if (typeof arg.default !== 'undefined') {
          val = typeof arg.default === 'string' ? arg.default : arg.default(interaction, this.guildContexts)
        }
      } else {
        val = Dispatcher.getCommandInteractionOptionValue(option)
      }
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
        val = await arg.parse(val, interaction, arg)
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
    | CommandInteractionOption['role']
    | CommandInteractionOption['attachment'],
    undefined
    > {
    switch (option.type) {
      case ApplicationCommandOptionType.Subcommand:
      case ApplicationCommandOptionType.SubcommandGroup:
      case ApplicationCommandOptionType.String:
      case ApplicationCommandOptionType.Integer:
      case ApplicationCommandOptionType.Boolean: return option.value ?? null
      // Discord.js resolves the user to a member too. The dispatcher will
      // always send the member as option value to the commands since most
      // commands require the member anyway, and it's easier to get the user
      // from a member than vice versa.
      case ApplicationCommandOptionType.User: return option.member ?? null
      case ApplicationCommandOptionType.Channel: return option.channel ?? null
      case ApplicationCommandOptionType.Role: return option.role ?? null
      case ApplicationCommandOptionType.Mentionable: return option.member ?? option.user ?? option.role ?? null
      case ApplicationCommandOptionType.Attachment: return option.attachment ?? null
      case ApplicationCommandOptionType.Number: return option.value ?? null
      default: return null
    }
  }
}
