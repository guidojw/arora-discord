import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const tagCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'tag',
  description: 'Post a tag',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'query',
    description: 'The tag to post',
    type: ApplicationCommandOptionType.String,
    autocomplete: true
  }, {
    name: 'who',
    description: 'The member to post this tag for',
    type: ApplicationCommandOptionType.User
  }]
}

export default tagCommand
