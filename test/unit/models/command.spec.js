'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const CommandModel = require('../../../src/models/command')
const GuildModel = require('../../../src/models/guild')
const GuildCommandModel = require('../../../src/models/guild-command')
const PermissionModel = require('../../../src/models/permission')

describe('src/models/command', () => {
  const Command = CommandModel(sequelize, dataTypes)
  const command = new Command()

  checkModelName(Command)('Command')

  context('properties', () => {
    ['name', 'type'].forEach(checkPropertyExists(command))
  })

  context('associations', () => {
    const Guild = GuildModel(sequelize, dataTypes)
    const GuildCommand = GuildCommandModel(sequelize, dataTypes)
    const Permission = PermissionModel(sequelize, dataTypes)

    before(() => {
      Command.associate({ Guild, GuildCommand, Permission })
    })

    it('defined a belongsToMany association with Guild', () => {
      expect(Command.belongsToMany).to.have.been.calledWith(Guild, {
        through: GuildCommand,
        foreignKey: 'commandId',
        otherKey: 'guildId'
      })
    })

    it('defined a hasMany association with Permission', () => {
      expect(Command.hasMany).to.have.been.calledWith(Permission, {
        foreignKey: {
          name: 'commandId',
          allowNull: false
        }
      })
    })
  })
})
