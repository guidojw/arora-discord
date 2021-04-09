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
const RoleMessageModel = require('../../../src/models/role-message')
const EmojiModel = require('../../../src/models/emoji')
const GuildModel = require('../../../src/models/guild')
const MessageModel = require('../../../src/models/message')
const RoleModel = require('../../../src/models/role')

describe('src/models/role-message', () => {
  const RoleMessage = RoleMessageModel(sequelize, dataTypes)
  const roleMessage = new RoleMessage()

  checkModelName(RoleMessage)('RoleMessage')

  context('properties', () => {
    ['emoji'].forEach(checkPropertyExists(roleMessage))
  })

  // context('hooks', () => {
  //   ['beforeCreate'].forEach(checkHookDefined(roleMessage))
  // })

  context('associations', () => {
    const Emoji = EmojiModel(sequelize, dataTypes)
    const Guild = GuildModel(sequelize, dataTypes)
    const Message = MessageModel(sequelize, dataTypes)
    const Role = RoleModel(sequelize, dataTypes)

    before(() => {
      RoleMessage.associate({ Emoji, Guild, Message, Role })
    })

    it('defined a belongsTo association with Emoji', () => {
      expect(RoleMessage.belongsTo).to.have.been.calledWith(Emoji, {
        foreignKey: {
          name: 'emojiId',
          validate: { emojiXorEmojiId: sinon.match.instanceOf(Function) }
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(RoleMessage.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Message', () => {
      expect(RoleMessage.belongsTo).to.have.been.calledWith(Message, {
        foreignKey: {
          name: 'messageId',
          allowNull: false
        },
        as: 'message',
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Role', () => {
      expect(RoleMessage.belongsTo).to.have.been.calledWith(Role, {
        foreignKey: {
          name: 'roleId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })
  })
})
