import { ApplicationCommandOptionType } from 'discord-api-types'

const demoteCommand = {
  name: 'demote',
  description: 'Demote a Roblox user in the group',
  defaultPermission: false,
  options: [{
    name: 'username',
    description: 'Username of the user to demote',
    type: ApplicationCommandOptionType.String,
    required: true
  }]
}

export default demoteCommand
