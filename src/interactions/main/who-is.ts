import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const whoIsCommand = {
  name: 'whois',
  description: 'Get the Roblox information of a user',
  defaultPermission: false,
  options: [{
    name: 'username',
    description: 'The username of the user to get the information of',
    type: ApplicationCommandOptionType.String
  }]
}

export default whoIsCommand
