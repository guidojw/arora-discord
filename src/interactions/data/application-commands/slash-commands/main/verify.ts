import { type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const verifyCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'verify',
  description: 'Verify your Discord user with Roblox',
  default_member_permissions: '0',
  dm_permission: false
}

export default verifyCommand
