import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

const statusCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'status',
  description: 'Posts the bot\'s system statuses',
  default_member_permissions: null
}

export default statusCommand
