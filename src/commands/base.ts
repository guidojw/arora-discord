import type { ArgumentCollectorResult, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando'
import { Command } from 'discord.js-commando'
import type { Message } from 'discord.js'

interface AroraCommandInfo extends CommandInfo {
  requiresApi?: boolean
  requiresRobloxGroup?: boolean
  requiresSingleGuild?: boolean
}

export default abstract class BaseCommand extends Command {
  public requiresApi: boolean
  public requiresRobloxGroup: boolean
  public requiresSingleGuild: boolean

  protected constructor (client: CommandoClient, info: AroraCommandInfo) {
    info.memberName = info.name
    info.argsPromptLimit = info.argsPromptLimit ?? ((info.group === 'admin' || info.group === 'settings') ? 3 : 1)
    info.guildOnly = typeof info.guildOnly !== 'undefined' ? info.guildOnly : true
    super(client, info)

    this.requiresApi = Boolean(info.requiresApi)
    this.requiresRobloxGroup = Boolean(info.requiresRobloxGroup)
    this.requiresSingleGuild = Boolean(info.requiresSingleGuild)
  }

  public override hasPermission (message: CommandoMessage, ownerOverride = true): boolean | string {
    if (ownerOverride && this.client.isOwner(message.author)) {
      return true
    }

    const result = super.hasPermission(message, ownerOverride)
    if (result !== true || this.guarded || this.group.guarded) {
      return result
    }

    return message.member?.canRunCommand(this) ?? false
  }

  public override async onError (
    _err: Error,
    _message: CommandoMessage,
    _args: object | string | string[],
    _fromPattern: boolean,
    _result: ArgumentCollectorResult
    // @ts-expect-error
  ): Promise<Message | Message[]> {
    // The commandError event handler takes care of this.
  }
}
