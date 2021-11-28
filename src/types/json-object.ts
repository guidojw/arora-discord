import { ArgumentType, type Argument, type CommandoClient, type CommandoMessage } from 'discord.js-commando'

export default class JsonObjectArgumentType extends ArgumentType {
  public constructor (client: CommandoClient) {
    super(client, 'json-object')
  }

  public validate (val: string, _msg: CommandoMessage, arg: Argument): boolean | string {
    try {
      JSON.parse(val)
    } catch (err) {
      return false
    }
    if (arg.min != null && val.length < arg.min) {
      return `Please keep the ${arg.label} above or exactly ${arg.min} characters.`
    }
    if (arg.max != null && val.length > arg.max) {
      return `Please keep the ${arg.label} below or exactly ${arg.max} characters.`
    }
    return true
  }

  public parse (val: string): any {
    return JSON.parse(val)
  }
}
