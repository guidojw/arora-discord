'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const RoleModel = require('../../../src/models/role')
const GroupModel = require('../../../src/models/group')
const GuildModel = require('../../../src/models/guild')
const MemberModel = require('../../../src/models/member')
const PermissionModel = require('../../../src/models/permission')
const RoleBindingModel = require('../../../src/models/role-binding')
const RoleMessageModel = require('../../../src/models/role-message')

describe('src/models/role', () => {
  const Role = RoleModel(sequelize, dataTypes)
  const role = new Role()

  checkModelName(Role)('Role')

  context('properties', () => {
    ['id'].forEach(checkPropertyExists(role))
  })

  context('associations', () => {
    const Group = GroupModel(sequelize, dataTypes)
    const Guild = GuildModel(sequelize, dataTypes)
    const Member = MemberModel(sequelize, dataTypes)
    const Permission = PermissionModel(sequelize, dataTypes)
    const RoleBinding = RoleBindingModel(sequelize, dataTypes)
    const RoleMessage = RoleMessageModel(sequelize, dataTypes)

    before(() => {
      Role.associate({ Group, Guild, Member, Permission, RoleBinding, RoleMessage })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(Role.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsToMany association with Group', () => {
      expect(Role.belongsToMany).to.have.been.calledWith(Group, {
        through: 'roles_groups'
      })
    })

    it('defined a belongsToMany association with Member', () => {
      expect(Role.belongsToMany).to.have.been.calledWith(Member, {
        through: 'members_roles'
      })
    })

    it('defined a hasMany association with Permission', () => {
      expect(Role.hasMany).to.have.been.calledWith(Permission, {
        foreignKey: 'roleId',
        as: 'permissions'
      })
    })

    it('defined a hasMany association with RoleBinding', () => {
      expect(Role.hasMany).to.have.been.calledWith(RoleBinding, {
        foreignKey: {
          name: 'roleId',
          allowNull: false
        }
      })
    })

    it('defined a hasMany association with RoleMessage', () => {
      expect(Role.hasMany).to.have.been.calledWith(RoleMessage, {
        foreignKey: {
          name: 'roleId',
          allowNull: false
        }
      })
    })
  })
})
