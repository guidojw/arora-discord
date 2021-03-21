'use strict'
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id'
    }
  }, {
    indexes: [{
      unique: true,
      fields: ['user_id', 'guild_id']
    }],
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
      through: 'members_roles',
      sourceKey: 'id',
      targetKey: 'id',
      as: 'roles'
    })

    Member.loadScopes = models => {
      Member.addScope('withRoles', {
        include: [{
          model: models.Role,
          as: 'roles'
        }]
      })
    }
  }

  return Member
}
