import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const tagCommand = {
  name: 'tag',
  description: 'Post a tag',
  defaultPermission: false,
  options: [{
    name: 'query',
    description: 'The tag to post',
    type: ApplicationCommandOptionType.String
  }]
}

export default tagCommand
