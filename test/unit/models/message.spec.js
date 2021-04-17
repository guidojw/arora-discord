'use strict'

const { expect } = require('chai')
const {
  // checkHookDefined,
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const MessageModel = require('../../../src/models/message')
const ChannelModel = require('../../../src/models/channel')
const GuildModel = require('../../../src/models/guild')
const PanelModel = require('../../../src/models/panel')
const TicketTypeModel = require('../../../src/models/ticket-type')

describe('src/models/message', () => {
  const Message = MessageModel(sequelize, dataTypes)
  const message = new Message()

  checkModelName(Message)('Message')

  context('properties', () => {
    ['id'].forEach(checkPropertyExists(message))
  })

  // context('hooks', () => {
  //   ['beforeCreate'].forEach(checkHookDefined(message))
  // })

  context('associations', () => {
    const Channel = ChannelModel(sequelize, dataTypes)
    const Guild = GuildModel(sequelize, dataTypes)
    const Panel = PanelModel(sequelize, dataTypes)
    const TicketType = TicketTypeModel(sequelize, dataTypes)

    before(() => {
      Message.associate({ Channel, Guild, Panel, TicketType })
    })

    it('defined a belongsTo association with Channel', () => {
      expect(Message.belongsTo).to.have.been.calledWith(Channel, {
        foreignKey: 'channelId',
        allowNull: false,
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(Message.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a hasMany association with Panel', () => {
      expect(Message.hasMany).to.have.been.calledWith(Panel, {
        foreignKey: 'messageId'
      })
    })

    it('defined a hasMany association with TicketType', () => {
      expect(Message.hasMany).to.have.been.calledWith(TicketType, {
        foreignKey: 'messageId'
      })
    })
  })
})
