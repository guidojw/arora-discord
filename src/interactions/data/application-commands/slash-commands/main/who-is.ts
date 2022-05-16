import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

const whoIsCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'whois',
  description: 'Get the Roblox information of a user',
  default_permission: false,
  options: [{
    name: 'username',
    description: 'The username of the user to get the information of',
    type: ApplicationCommandOptionType.String
  }]
}

export default whoIsCommand
