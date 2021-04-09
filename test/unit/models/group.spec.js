'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const GroupModel = require('../../../src/models/group')
const ChannelModel = require('../../../src/models/channel')
const GuildModel = require('../../../src/models/guild')
const PermissionModel = require('../../../src/models/permission')
const RoleModel = require('../../../src/models/role')

describe('src/models/group', () => {
  const Group = GroupModel(sequelize, dataTypes)
  const group = new Group()

  checkModelName(Group)('Group')

  context('properties', () => {
    ['guarded', 'name', 'type'].forEach(checkPropertyExists(group))
  })

  context('associations', () => {
    const Channel = ChannelModel(sequelize, dataTypes)
    const Guild = GuildModel(sequelize, dataTypes)
    const Permission = PermissionModel(sequelize, dataTypes)
    const Role = RoleModel(sequelize, dataTypes)

    before(() => {
      Group.associate({ Channel, Guild, Permission, Role })
    })

    it('defined a belongsToMany association with Channel', () => {
      expect(Group.belongsToMany).to.have.been.calledWith(Channel, {
        through: 'channels_groups',
        as: 'channels'
      })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(Group.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a hasMany association with Permission', () => {
      expect(Group.hasMany).to.have.been.calledWith(Permission, {
        foreignKey: 'groupId',
        as: 'permissions'
      })
    })

    it('defined a belongsToMany association with Role', () => {
      expect(Group.belongsToMany).to.have.been.calledWith(Role, {
        through: 'roles_groups',
        as: 'roles'
      })
    })
  })
})
