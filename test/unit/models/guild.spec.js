'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const GuildModel = require('../../../src/models/guild')
const ChannelModel = require('../../../src/models/channel')
const CommandModel = require('../../../src/models/command')
const EmojiModel = require('../../../src/models/emoji')
const GroupModel = require('../../../src/models/group')
const GuildCommandModel = require('../../../src/models/guild-command')
const MemberModel = require('../../../src/models/member')
const MessageModel = require('../../../src/models/message')
const PanelModel = require('../../../src/models/panel')
const RoleModel = require('../../../src/models/role')
const RoleBindingModel = require('../../../src/models/role-binding')
const RoleMessageModel = require('../../../src/models/role-message')
const TagModel = require('../../../src/models/tag')
const TicketModel = require('../../../src/models/tag')
const TicketTypeModel = require('../../../src/models/ticket-type')

describe('src/models/guild', () => {
  const Guild = GuildModel(sequelize, dataTypes)
  const guild = new Guild()

  checkModelName(Guild)('Guild')

  context('properties', () => {
    [
      'id', 'commandPrefix', 'primaryColor', 'robloxGroupId', 'robloxUsernamesInNicknames', 'supportEnabled',
      'verificationPreference'
    ].forEach(checkPropertyExists(guild))
  })

  context('associations', () => {
    const Channel = ChannelModel(sequelize, dataTypes)
    const Command = CommandModel(sequelize, dataTypes)
    const Emoji = EmojiModel(sequelize, dataTypes)
    const Group = GroupModel(sequelize, dataTypes)
    const GuildCommand = GuildCommandModel(sequelize, dataTypes)
    const Member = MemberModel(sequelize, dataTypes)
    const Message = MessageModel(sequelize, dataTypes)
    const Panel = PanelModel(sequelize, dataTypes)
    const Role = RoleModel(sequelize, dataTypes)
    const RoleBinding = RoleBindingModel(sequelize, dataTypes)
    const RoleMessage = RoleMessageModel(sequelize, dataTypes)
    const Tag = TagModel(sequelize, dataTypes)
    const Ticket = TicketModel(sequelize, dataTypes)
    const TicketType = TicketTypeModel(sequelize, dataTypes)

    before(() => {
      Guild.associate({
        Channel, Command, Emoji, Group, GuildCommand, Member, Message, Panel, Role, RoleBinding, RoleMessage, Tag,
        Ticket, TicketType
      })
    })

    it('defined a hasMany association with Channel', () => {
      expect(Guild.hasMany).to.have.been.calledWith(Channel, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        as: 'channels'
      })
    })

    it('defined a belongsTo association with Channel', () => {
      expect(Guild.belongsTo).to.have.been.calledWith(Channel, {
        foreignKey: 'logsChannelId'
      })
    })

    it('defined a belongsTo association with Channel', () => {
      expect(Guild.belongsTo).to.have.been.calledWith(Channel, {
        foreignKey: 'ratingsChannelId'
      })
    })

    it('defined a belongsTo association with Channel', () => {
      expect(Guild.belongsTo).to.have.been.calledWith(Channel, {
        foreignKey: 'suggestionsChannelId'
      })
    })

    it('defined a belongsTo association with Channel', () => {
      expect(Guild.belongsTo).to.have.been.calledWith(Channel, {
        foreignKey: 'ticketArchivesChannelId',
        onDelete: 'SET NULL'
      })
    })

    it('defined a belongsTo association with Channel', () => {
      expect(Guild.belongsTo).to.have.been.calledWith(Channel, {
        foreignKey: 'ticketsCategoryId'
      })
    })

    it('defined a belongsToMany association with Command', () => {
      expect(Guild.belongsToMany).to.have.been.calledWith(Command, {
        through: GuildCommand,
        foreignKey: 'guildId',
        otherKey: 'commandId'
      })
    })

    it('defined a hasMany association with Emoji', () => {
      expect(Guild.hasMany).to.have.been.calledWith(Emoji)
    })

    it('defined a hasMany association with Group', () => {
      expect(Guild.hasMany).to.have.been.calledWith(Group, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        as: 'groups'
      })
    })

    it('defined a hasMany association with Member', () => {
      expect(Guild.hasMany).to.have.been.calledWith(Member, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        }
      })
    })

    it('defined a hasMany association with Message', () => {
      expect(Guild.hasMany).to.have.been.calledWith(Message, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        }
      })
    })

    it('defined a hasMany association with Panel', () => {
      expect(Guild.hasMany).to.have.been.calledWith(Panel, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        as: 'panels'
      })
    })

    it('defined a hasMany association with Role', () => {
      expect(Guild.hasMany).to.have.been.calledWith(Role, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        as: 'roles'
      })
    })

    it('defined a hasMany association with RoleBinding', () => {
      expect(Guild.hasMany).to.have.been.calledWith(RoleBinding, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        as: 'roleBindings'
      })
    })

    it('defined a hasMany association with RoleMessage', () => {
      expect(Guild.hasMany).to.have.been.calledWith(RoleMessage, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        as: 'roleMessages'
      })
    })

    it('defined a hasMany association with Tag', () => {
      expect(Guild.hasMany).to.have.been.calledWith(Tag, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        as: 'tags'
      })
    })

    it('defined a hasMany association with Ticket', () => {
      expect(Guild.hasMany).to.have.been.calledWith(Ticket, {
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        as: 'tickets'
      })
    })

    it('defined a hasMany association with TicketType', () => {
      expect(Guild.hasMany).to.have.been.calledWith(TicketType,{
        foreignKey: {
          name: 'guildId',
          allowNull: false
        },
        as: 'ticketTypes'
      })
    })
  })
})
