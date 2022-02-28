import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'

const tagCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'tag',
  description: 'Post a tag',
  default_permission: false,
  options: [{
    name: 'query',
    description: 'The tag to post',
    type: ApplicationCommandOptionType.String
  }, {
    name: 'who',
    description: 'The member to post this tag for',
    type: ApplicationCommandOptionType.User
  }]
}

export default tagCommand