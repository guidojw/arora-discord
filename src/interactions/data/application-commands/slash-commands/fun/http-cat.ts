import {
  ApplicationCommandOptionType,
  type RESTPutAPIApplicationCommandsJSONBody
} from 'discord.js'

const httpCatCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'httpcat',
  description: 'Posts a picture of a HTTP cat',
  default_member_permissions: null,
  options: [{
    name: 'statuscode',
    description: 'Status code to post a HTTP cat picture of',
    type: ApplicationCommandOptionType.Integer,
    autocomplete: true
  }]
}

export default httpCatCommand
