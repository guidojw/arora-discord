import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const warnCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'warn',
  description: 'Warn a user',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'user',
    description: 'The user to warn',
    type: ApplicationCommandOptionType.User
  }, {
    name: 'reason',
    description: 'The warning',
    type: ApplicationCommandOptionType.String
  }]
}

export default warnCommand
