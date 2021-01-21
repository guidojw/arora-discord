'use strict'
module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tickets'
  })

  Ticket.associate = models => {
    Ticket.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Ticket.belongsToMany(models.Member, {
      through: 'tickets_moderators',
      sourceKey: 'id',
      targetKey: 'id',
      as: 'moderators'
    })
    Ticket.belongsTo(models.Member, {
      foreignKey: {
        name: 'authorId',
        allowNull: false
      }
    })
    Ticket.belongsTo(models.Channel, {
      foreignKey: {
        name: 'channelId'
      },
      onDelete: 'CASCADE'
    })
    Ticket.belongsTo(models.TicketType, {
      foreignKey: {
        name: 'typeId',
        allowNull: false
      }
    })
  }

  Ticket.loadScopes = models => {
    Ticket.addScope('defaultScope', {
      include: [{
        model: models.TicketModerator,
        as: 'moderators'
      }],
      subQuery: false
    })
  }

  return Ticket
}
