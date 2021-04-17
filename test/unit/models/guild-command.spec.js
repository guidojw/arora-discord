'use strict'

const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const GuildCommandModel = require('../../../src/models/guild-command')

describe('src/models/guild-command', () => {
  const GuildCommand = GuildCommandModel(sequelize, dataTypes)
  const guildCommand = new GuildCommand()

  checkModelName(GuildCommand)('GuildCommand')

  context('properties', () => {
    ['enabled'].forEach(checkPropertyExists(guildCommand))
  })
})
