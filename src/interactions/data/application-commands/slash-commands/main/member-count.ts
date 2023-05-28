import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const memberCountCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'membercount',
  description: 'Fetch a group\'s member count',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'id',
    description: 'The ID of the group to fetch the member count of',
    type: ApplicationCommandOptionType.Number
  }]
}

export default memberCountCommand
