'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const EmojiModel = require('../../../src/models/emoji')
const GuildModel = require('../../../src/models/guild')
const RoleMessageModel = require('../../../src/models/role-message')
const TicketTypeModel = require('../../../src/models/ticket-type')

describe('src/models/emoji', () => {
  const Emoji = EmojiModel(sequelize, dataTypes)
  const emoji = new Emoji()

  checkModelName(Emoji)('Emoji')

  context('properties', () => {
    ['id'].forEach(checkPropertyExists(emoji))
  })

  context('associations', () => {
    const Guild = GuildModel(sequelize, dataTypes)
    const RoleMessage = RoleMessageModel(sequelize, dataTypes)
    const TicketType = TicketTypeModel(sequelize, dataTypes)

    before(() => {
      Emoji.associate({ Guild, RoleMessage, TicketType })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(Emoji.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a hasMany association with RoleMessage', () => {
      expect(Emoji.hasMany).to.have.been.calledWith(RoleMessage, {
        foreignKey: 'emojiId'
      })
    })

    it('defined a hasMany association with TicketType', () => {
      expect(Emoji.hasMany).to.have.been.calledWith(TicketType, {
        foreignKey: 'emojiId'
      })
    })
  })
})
