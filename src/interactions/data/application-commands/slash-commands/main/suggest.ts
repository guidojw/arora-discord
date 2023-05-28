import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const suggestCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'suggest',
  description: 'Make a suggestion',
  default_member_permissions: '0',
  dm_permission: false,
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
