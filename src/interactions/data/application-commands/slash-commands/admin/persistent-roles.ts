import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const persistentRolesCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'persistentroles',
  description: 'Persist or unpersist roles on a member',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'persist',
    description: 'Persist a role on a member',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'member',
      description: 'The member to persist a role on',
      type: ApplicationCommandOptionType.User,
      required: true
    }, {
      name: 'role',
      description: 'The role to persist on this member',
      type: ApplicationCommandOptionType.Role,
      required: true
    }]
  }, {
    name: 'unpersist',
    description: 'Unpersist a role on a member',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'member',
      description: 'The member to remove a persistent role from',
      type: ApplicationCommandOptionType.User,
      required: true
    }, {
      name: 'role',
      description: 'The persistent role to remove from this member',
      type: ApplicationCommandOptionType.Role,
      required: true
    }]
  }, {
    name: 'list',
    description: 'List a member\'s persistent roles',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'member',
      description: 'The member to list the persistent roles of',
      type: ApplicationCommandOptionType.User,
      required: true
    }]
  }]
}

export default persistentRolesCommand
