import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const shoutCommand = {
  name: 'shout',
  description: 'Post a message to the group shout',
  default_permission: false,
  options: [{
    name: 'message',
    description: 'The message to shout',
    type: ApplicationCommandOptionType.String
  }]
}

export default shoutCommand
