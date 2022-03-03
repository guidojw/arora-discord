import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'

const boostInfoCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'boostinfo',
  description: 'Get a member\'s boost information',
  default_permission: false,
  options: [{
    name: 'member',
    description: 'The member to get the boost information of',
    type: ApplicationCommandOptionType.User
  }]
}

export default boostInfoCommand
