'use strict'

module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {})
  Tag.loadScopes = models => {
    Tag.addScope('defaultScope', {
      include: [{
        model: models.TagName,
        as: 'names'
      }]
    })
  }

  return Tag
}
