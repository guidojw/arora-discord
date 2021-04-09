'use strict'

const { expect } = require('chai')
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers')

const TagNameModel = require('../../../src/models/tag-name')
const TagModel = require('../../../src/models/tag')

describe('src/models/tag-name', () => {
  const TagName = TagNameModel(sequelize, dataTypes)
  const tagName = new TagName()

  checkModelName(TagName)('TagName')

  context('properties', () => {
    ['name'].forEach(checkPropertyExists(tagName))
  })

  context('associations', () => {
    const Tag = TagModel(sequelize, dataTypes)

    before(() => {
      TagName.associate({ Tag })
    })

    it('defined a belongsTo association with Tag', () => {
      expect(TagName.belongsTo).to.have.been.calledWith(Tag, {
        foreignKey: {
          name: 'tagId',
          primaryKey: true
        },
        onDelete: 'CASCADE'
      })
    })
  })
})
