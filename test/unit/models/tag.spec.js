'use strict'

const { expect } = require('chai')
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers')

const TagModel = require('../../../src/models/tag')
const GuildModel = require('../../../src/models/guild')
const TagNameModel = require('../../../src/models/tag-name')

describe('src/models/tag', () => {
  const Tag = TagModel(sequelize, dataTypes)
  const tag = new Tag()

  checkModelName(Tag)('Tag')

  context('properties', () => {
    ['content'].forEach(checkPropertyExists(tag))
  })

  context('associations', () => {
    const Guild = GuildModel(sequelize, dataTypes)
    const TagName = TagNameModel(sequelize, dataTypes)

    before(() => {
      Tag.associate({ Guild, TagName })
    })

    it('defined a belongsTo association with Guild', () => {
      expect(Tag.belongsTo).to.have.been.calledWith(Guild, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      })
    })

    it('defined a hasMany association with TagName', () => {
      expect(Tag.hasMany).to.have.been.calledWith(TagName, {
        foreignKey: {
          name: 'tagId',
          primaryKey: true
        },
        as: 'names'
      })
    })
  })
})
