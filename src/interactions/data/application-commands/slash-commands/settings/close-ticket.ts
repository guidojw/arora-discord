import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

const closeTicketCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'closeticket',
  description: 'Close this ticket',
  default_permission: false
}

export default closeTicketCommand