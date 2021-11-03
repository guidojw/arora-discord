import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const suggestCommand = {
  name: 'suggest',
  description: 'Make a suggestion',
  default_permission: false,
  options: [{
    name: 'suggestion',
    description: 'The suggestion to make',
    type: ApplicationCommandOptionType.String,
    required: true
  }]
}

export default suggestCommand
