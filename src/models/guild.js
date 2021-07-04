'use strict'

module.exports = (sequelize, DataTypes) => {
  const Guild = sequelize.define('Guild', {})

  Guild.loadScopes = models => {
    Guild.addScope('defaultScope', {
      include: [{
        model: models.Group,
        as: 'groups'
      }, {
        model: models.Panel,
        as: 'panels'
      }, {
        model: models.RoleMessage,
        as: 'roleMessages'
      }, {
        model: models.Tag,
        as: 'tags'
      }, {
        model: models.Ticket,
        as: 'tickets'
      }, {
        model: models.TicketType,
        as: 'ticketTypes'
      }]
    })
    Guild.addScope('withRoleBindings', {
      include: [{
        model: models.RoleBinding,
        as: 'roleBindings'
      }]
    })
  }

  return Guild
}
