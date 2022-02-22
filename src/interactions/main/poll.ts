import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const pollCommand = {
  name: 'poll',
  description: 'Create a poll',
  default_permission: false,
  options: [{
    name: 'choices',
    description: 'The amount of possible choices',
    type: ApplicationCommandOptionType.Integer,
    min_value: 1,
    max_value: 10
  }]
}

export default pollCommand
