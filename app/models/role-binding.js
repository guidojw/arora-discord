'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleBinding = sequelize.define('RoleBinding', {
    roleId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'role_id'
    },
    min: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max: DataTypes.INTEGER
  }, {
    tableName: 'role_bindings'
  })

  RoleBinding.associate = models => {
    RoleBinding.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
  }

  return RoleBinding
}
