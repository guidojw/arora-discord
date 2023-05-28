import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const boostInfoCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'boostinfo',
  description: 'Get a member\'s boost information',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'member',
    description: 'The member to get the boost information of',
    type: ApplicationCommandOptionType.User
  }]
}

export default boostInfoCommand
