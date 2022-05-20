import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

const shoutCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'shout',
  description: 'Post a message to the group shout',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'message',
    description: 'The message to shout',
    type: ApplicationCommandOptionType.String
  }]
}

export default shoutCommand
