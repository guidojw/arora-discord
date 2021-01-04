'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleMessage = sequelize.define('RoleMessage', {
    emojiId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'emoji_id'
    },
    roleId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'role_id'
    },
    messageId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'message_id'
    }
  }, {
    tableName: 'role_messages'
  })

  RoleMessage.associate = models => {
    RoleMessage.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
  }

  return RoleMessage
}
