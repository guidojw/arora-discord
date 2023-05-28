import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const httpCatCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'httpcat',
  description: 'Posts a picture of a random HTTP cat',
  default_member_permissions: null
}

export default httpCatCommand
