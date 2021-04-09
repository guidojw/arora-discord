'use strict'

const { expect } = require('chai')
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers')

const MemberModel = require('../../../src/models/member')
const GuildModel = require('../../../src/models/guild')
const RoleModel = require('../../../src/models/role')
const TicketModel = require('../../../src/models/ticket')

describe('src/models/member', () => {
  const Member = MemberModel(sequelize, dataTypes)
  const member = new Member()

  checkModelName(Member)('Member')

  context('properties', () => {
    ['userId'].forEach(checkPropertyExists(member))
  })

  context('associations', () => {
    const Guild = GuildModel(sequelize, dataTypes)
    const Role = RoleModel(sequelize, dataTypes)
    const Ticket = TicketModel(sequelize, dataTypes)

    before(() => {
      Member.associate({ Guild, Role, Ticket })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(Member.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsToMany association with Role', () => {
      expect(Member.belongsToMany).to.have.been.calledWith(Role, {
        through: 'members_roles',
        as: 'roles'
      })
    })

    it('defined a belongsToMany association with Ticket', () => {
      expect(Member.belongsToMany).to.have.been.calledWith(Ticket, {
        through: 'tickets_moderators',
        as: 'moderatingTickets'
      })
    })

    it('defined a hasMany association with Ticket', () => {
      expect(Member.hasMany).to.have.been.calledWith(Ticket, {
        foreignKey: {
          name: 'authorId',
          allowNull: false
        },
        as: 'tickets'
      })
    })
  })
})
