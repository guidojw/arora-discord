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
      }
    })
    Member.belongsToMany(models.Ticket, {
      through: 'tickets_moderators',
      sourceKey: 'id',
      targetKey: 'id'
    })
    Member.belongsToMany(models.Role, {
      through: models.MemberRole,
      sourceKey: 'id',
      targetKey: 'id'
    })
  }

  Member.loadScopes = models => {
    Member.addScope('defaultScope', {
      include: [{
        model: models.Group,
        as: 'groups'
      }],
      subQuery: false
    })
  }

  return Member
}
