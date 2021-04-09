'use strict'

const { expect } = require('chai')
const {
  sequelize,
  dataTypes,
  // checkHookDefined,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers')

const PanelModel = require('../../../src/models/panel')
const GuildModel = require('../../../src/models/guild')
const MessageModel = require('../../../src/models/message')

describe('src/models/panel', () => {
  const Panel = PanelModel(sequelize, dataTypes)
  const panel = new Panel()

  checkModelName(Panel)('Panel')

  context('properties', () => {
    ['content', 'name'].forEach(checkPropertyExists(panel))
  })

  // context('hooks', () => {
  //   ['beforeUpdate'].forEach(checkHookDefined(panel))
  // })

  context('associations', () => {
    const Guild = GuildModel(sequelize, dataTypes)
    const Message = MessageModel(sequelize, dataTypes)

    before(() => {
      Panel.associate({ Guild, Message })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(Panel.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Message', () => {
      expect(Panel.belongsTo).to.have.been.calledWith(Message, {
        foreignKey: 'messageId',
        unique: true,
        as: 'message'
      })
    })
  })
})
