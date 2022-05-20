import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

const pollCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'poll',
  description: 'Create a poll',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'poll',
    description: 'The question to poll',
    type: ApplicationCommandOptionType.String,
    required: true
  }]
}

export default pollCommand
