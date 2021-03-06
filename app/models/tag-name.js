'use strict'
module.exports = (sequelize, DataTypes) => {
  const TagName = sequelize.define('TagName', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      validate: {
        isLowerCase: true
      }
    }
  }, {
    tableName: 'tag_names'
  })

  TagName.associate = models => {
    TagName.belongsTo(models.Tag, {
      foreignKey: {
        name: 'tagId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return TagName
}
