'use strict'
module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'user_id'
    },
    roleId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'role_id'
    }
  }, {
    tableName: 'users_roles'
  })

  UserRole.associate = models => {
    UserRole.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return UserRole
}
