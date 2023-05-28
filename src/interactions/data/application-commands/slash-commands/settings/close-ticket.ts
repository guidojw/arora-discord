import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const closeTicketCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'closeticket',
  description: 'Close this ticket',
  default_member_permissions: '0',
  dm_permission: false
}

export default closeTicketCommand
