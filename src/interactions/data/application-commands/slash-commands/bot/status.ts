import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const statusCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'status',
  description: 'Posts the bot\'s system statuses',
  default_member_permissions: null
}

export default statusCommand
