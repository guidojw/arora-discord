import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'

const demoteCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'demote',
  description: 'Demote a Roblox user in the group',
  default_permission: false,
  options: [{
    name: 'username',
    description: 'Username of the user to demote',
    type: ApplicationCommandOptionType.String,
    required: true
  }]
}

export default demoteCommand
