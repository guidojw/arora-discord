'use strict'
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    }
  }, {
    tableName: 'members'
  })

  Member.associate = models => {
    Member.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Member.hasMany(models.Ticket, {
      foreignKey: {
        name: 'authorId',
        allowNull: false
      },
      as: 'tickets'
    })
    Member.belongsToMany(models.Ticket, {
      through: 'tickets_moderators',
      sourceKey: 'id',
      targetKey: 'id',
      as: 'moderatingTickets'
    })
    Member.belongsToMany(models.Role, {
      through: models.MemberRole,
      sourceKey: 'id',
      targetKey: 'id'
    })
  }

  return Member
}
