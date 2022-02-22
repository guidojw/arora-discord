import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const promoteCommand = {
  name: 'promote',
  description: 'Promote a Roblox user in the group',
  default_permission: false,
  options: [{
    name: 'username',
    description: 'Username of the user to promote',
    type: ApplicationCommandOptionType.String,
    required: true
  }]
}

export default promoteCommand
