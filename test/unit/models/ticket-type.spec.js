'use strict'

const { expect } = require('chai')
const {
  sequelize,
  dataTypes,
  // checkHookDefined,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers')

const sinon = require('sinon')
const TicketTypeModel = require('../../../src/models/ticket-type')
const EmojiModel = require('../../../src/models/emoji')
const GuildModel = require('../../../src/models/guild')
const MessageModel = require('../../../src/models/message')
const TicketModel = require('../../../src/models/ticket')

describe('src/models/ticket-type', () => {
  const TicketType = TicketTypeModel(sequelize, dataTypes)
  const ticketType = new TicketType()

  checkModelName(TicketType)('TicketType')

  context('properties', () => {
    ['emoji', 'name'].forEach(checkPropertyExists(ticketType))
  })

  // context('hooks', () => {
  //   ['beforeUpdate'].forEach(checkHookDefined(roleMessage))
  // })

  context('associations', () => {
    const Emoji = EmojiModel(sequelize, dataTypes)
    const Guild = GuildModel(sequelize, dataTypes)
    const Message = MessageModel(sequelize, dataTypes)
    const Ticket = TicketModel(sequelize, dataTypes)

    before(() => {
      TicketType.associate({ Emoji, Guild, Message, Ticket })
    })

    it('defined a belongsTo association with Emoji', () => {
      expect(TicketType.belongsTo).to.have.been.calledWith(Emoji, {
        foreignKey: {
          name: 'emojiId',
          defaultValue: null,
          validate: { emojiNandEmojiId: sinon.match.instanceOf(Function) }
        }
      })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(TicketType.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Message', () => {
      expect(TicketType.belongsTo).to.have.been.calledWith(Message, {
        foreignKey: 'messageId',
        as: 'message'
      })
    })

    it('defined a hasMany association with Role', () => {
      expect(TicketType.hasMany).to.have.been.calledWith(Ticket, {
        foreignKey: {
          name: 'typeId',
          allowNull: false
        }
      })
    })
  })
})
