'use strict'

const { expect } = require('chai')
const {
  sequelize,
  dataTypes,
  // checkHookDefined,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers')

const RoleBindingModel = require('../../../src/models/role-binding')
const GuildModel = require('../../../src/models/guild')
const RoleModel = require('../../../src/models/role')

describe('src/models/role-binding', () => {
  const RoleBinding = RoleBindingModel(sequelize, dataTypes)
  const roleBinding = new RoleBinding()

  checkModelName(RoleBinding)('RoleBinding')

  context('properties', () => {
    ['max', 'min', 'robloxGroupId'].forEach(checkPropertyExists(roleBinding))
  })

  // context('hooks', () => {
  //   ['beforeCreate'].forEach(checkHookDefined(roleBinding))
  // })

  context('associations', () => {
    const Guild = GuildModel(sequelize, dataTypes)
    const Role = RoleModel(sequelize, dataTypes)

    before(() => {
      RoleBinding.associate({ Guild, Role })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(RoleBinding.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a belongsTo association with Role', () => {
      expect(RoleBinding.belongsTo).to.have.been.calledWith(Role, {
        foreignKey: {
          name: 'roleId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })
  })
})
