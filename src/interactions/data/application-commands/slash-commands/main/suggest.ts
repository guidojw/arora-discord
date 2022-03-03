import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'

const suggestCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'suggest',
  description: 'Make a suggestion',
  default_permission: false,
  options: [{
    name: 'suggestion',
    description: 'The suggestion to make',
    type: ApplicationCommandOptionType.String,
    required: true
  }, {
    name: 'attachment',
    description: 'Image to attach to the suggestion',
    type: ApplicationCommandOptionType.Attachment
  }]
}

export default suggestCommand
