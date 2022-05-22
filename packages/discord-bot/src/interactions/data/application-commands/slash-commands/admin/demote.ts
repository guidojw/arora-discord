import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

const demoteCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'demote',
  description: 'Demote a Roblox user in the group',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'username',
    description: 'Username of the user to demote',
    type: ApplicationCommandOptionType.String,
    required: true
  }]
}

export default demoteCommand
