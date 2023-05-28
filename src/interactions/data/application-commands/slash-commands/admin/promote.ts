import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const promoteCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'promote',
  description: 'Promote a Roblox user in the group',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'username',
    description: 'Username of the user to promote',
    type: ApplicationCommandOptionType.String,
    required: true
  }]
}

export default promoteCommand
