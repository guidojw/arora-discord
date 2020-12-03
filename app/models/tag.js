'use strict'
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    content: {
      type: DataTypes.STRING(7000), // 6000 for embed character limit + 1000 margin for JSON characters
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
