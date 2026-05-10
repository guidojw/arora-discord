import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const infractionsCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'infractions',
  description: 'Get a user\'s infraction logs',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'user',
    description: 'The user to get the infraction logs of',
    type: ApplicationCommandOptionType.User,
    required: true
  }]
}

export default infractionsCommand
