'use strict'

const { expect } = require('chai')
const {
  // checkHookDefined,
  checkModelName,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const TicketModel = require('../../../src/models/ticket')
const ChannelModel = require('../../../src/models/channel')
const GuildModel = require('../../../src/models/guild')
const MemberModel = require('../../../src/models/member')
const TicketTypeModel = require('../../../src/models/ticket-type')

describe('src/models/ticket', () => {
  const Ticket = TicketModel(sequelize, dataTypes)
  // const ticket = new Ticket()

  checkModelName(Ticket)('Ticket')

  // context('hooks', () => {
  //   ['beforeCreate'].forEach(checkHookDefined(ticket))
  // })

  context('associations', () => {
    const Channel = ChannelModel(sequelize, dataTypes)
    const Guild = GuildModel(sequelize, dataTypes)
    const Member = MemberModel(sequelize, dataTypes)
    const TicketType = TicketTypeModel(sequelize, dataTypes)

    before(() => {
      Ticket.associate({ Channel, Guild, Member, TicketType })
    })

    it('defined a belongsTo association with Channel', () => {
      expect(Ticket.belongsTo).to.have.been.calledWith(Channel, {
        foreignKey: 'channelId',
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(Ticket.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Member', () => {
      expect(Ticket.belongsTo).to.have.been.calledWith(Member, {
        foreignKey: {
          name: 'authorId',
          allowNull: false
        },
        as: 'author'
      })
    })

    it('defined a belongsToMany association with Member', () => {
      expect(Ticket.belongsToMany).to.have.been.calledWith(Member, {
        through: 'tickets_moderators',
        as: 'moderators'
      })
    })

    it('defined a belongsTo association with TicketType', () => {
      expect(Ticket.belongsTo).to.have.been.calledWith(TicketType, {
        foreignKey: {
          name: 'typeId',
          allowNull: false
        }
      })
    })
  })
})
