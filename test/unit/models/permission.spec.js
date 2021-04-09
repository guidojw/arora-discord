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
const PermissionModel = require('../../../src/models/permission')
const CommandModel = require('../../../src/models/command')
const GroupModel = require('../../../src/models/group')
const RoleModel = require('../../../src/models/role')

describe('src/models/permission', () => {
  const Permission = PermissionModel(sequelize, dataTypes)
  const permission = new Permission()

  checkModelName(Permission)('Permission')

  context('properties', () => {
    ['allow'].forEach(checkPropertyExists(permission))
  })

  // context('hooks', () => {
  //   ['beforeCreate'].forEach(checkHookDefined(permission))
  // })

  context('associations', () => {
    const Command = CommandModel(sequelize, dataTypes)
    const Group = GroupModel(sequelize, dataTypes)
    const Role = RoleModel(sequelize, dataTypes)

    before(() => {
      Permission.associate({ Command, Group, Role })
    })

    it('defined a belongsTo association with Command', () => {
      expect(Permission.belongsTo).to.have.been.calledWith(Command, {
        foreignKey: {
          name: 'commandId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Group', () => {
      expect(Permission.belongsTo).to.have.been.calledWith(Group, {
        foreignKey: {
          name: 'groupId',
          validate: { roleXorGroup: sinon.match.instanceOf(Function) }
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Role', () => {
      expect(Permission.belongsTo).to.have.been.calledWith(Role, {
        foreignKey: {
          name: 'roleId',
          validate: { roleXorGroup: sinon.match.instanceOf(Function) }
        },
        onDelete: 'CASCADE'
      })
    })
  })
})
