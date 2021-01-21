'use strict'
module.exports = sequelize => {
  const MemberRole = sequelize.define('MemberRole', {}, {
    tableName: 'members_roles'
  })

  MemberRole.associate = models => {
    MemberRole.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return MemberRole
}
