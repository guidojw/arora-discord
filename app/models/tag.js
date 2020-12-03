'use strict'
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    authorId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'author_id'
    }
  }, {
    tableName: 'tags'
  })

  Tag.associate = models => {
    Tag.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Tag.hasMany(models.TagName, {
      foreignKey: {
        name: 'tagId',
        primaryKey: true
      }
    })
  }

  return Tag
}
