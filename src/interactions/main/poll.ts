import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const pollCommand = {
  name: 'poll',
  description: 'Create a poll',
  default_permission: false,
  options: [{
    name: 'poll',
    description: 'The question to poll',
    type: ApplicationCommandOptionType.String,
    required: true
  }]
}

export default pollCommand
