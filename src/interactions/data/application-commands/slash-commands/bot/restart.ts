import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const restartCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'restart',
  description: 'Restarts the bot',
  default_member_permissions: '0'
}

export default restartCommand
