'use strict'

const { expect } = require('chai')
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers')

const ChannelModel = require('../../../src/models/channel')
const MessageModel = require('../../../src/models/message')
const GroupModel = require('../../../src/models/group')
const GuildModel = require('../../../src/models/guild')
const TicketModel = require('../../../src/models/ticket')

describe('src/models/channel', () => {
  const Channel = ChannelModel(sequelize, dataTypes)
  const channel = new Channel()

  checkModelName(Channel)('Channel')

  context('properties', () => {
    ['id'].forEach(checkPropertyExists(channel))
  })

  context('associations', () => {
    const Message = MessageModel(sequelize, dataTypes)
    const Group = GroupModel(sequelize, dataTypes)
    const Guild = GuildModel(sequelize, dataTypes)
    const Ticket = TicketModel(sequelize, dataTypes)

    before(() => {
      Channel.associate({ Channel, Message, Group, Guild, Ticket })
    })

    it('defined a belongsToMany association with Channel', () => {
      expect(Channel.belongsToMany).to.have.been.calledWith(Channel, {
        through: 'channels_channels',
        foreignKey: 'fromChannelId',
        otherKey: 'toChannelId',
        as: 'fromLinks'
      })
    })

    it('defined a belongsToMany association with Channel', () => {
      expect(Channel.belongsToMany).to.have.been.calledWith(Channel, {
        through: 'channels_channels',
        foreignKey: 'toChannelId',
        otherKey: 'fromChannelId',
        as: 'toLinks'
      })
    })

    it('defined a belongsToMany association with Group', () => {
      expect(Channel.belongsToMany).to.have.been.calledWith(Group, {
        through: 'channels_groups'})
    })

    it('defined a belongsTo association with Guild', () => {
      expect(Channel.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a hasOne association with Guild', () => {
      expect(Channel.hasOne).to.have.been.calledWith(Guild, {
        foreignKey: 'logsChannelId'
      })
    })

    it('defined a hasOne association with Guild', () => {
      expect(Channel.hasOne).to.have.been.calledWith(Guild, {
        foreignKey: 'ratingsChannelId'
      })
    })

    it('defined a hasOne association with Guild', () => {
      expect(Channel.hasOne).to.have.been.calledWith(Guild, {
        foreignKey: 'suggestionsChannelId'
      })
    })

    it('defined a hasOne association with Guild', () => {
      expect(Channel.hasOne).to.have.been.calledWith(Guild, {
        foreignKey: 'ticketArchivesChannelId'
      })
    })

    it('defined a hasOne association with Guild', () => {
      expect(Channel.hasOne).to.have.been.calledWith(Guild, {
        foreignKey: 'ticketsCategoryId'
      })
    })

    it('defined a hasMany association with Message', () => {
      expect(Channel.hasMany).to.have.been.calledWith(Message, {
        foreignKey: {
          name: 'channelId',
          allowNull: false
        }
      })
    })

    it('defined a hasMany association with Ticket', () => {
      expect(Channel.hasMany).to.have.been.calledWith(Ticket, {
        foreignKey: 'channelId'
      })
    })
  })
})
