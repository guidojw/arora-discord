import {
  ApplicationCommandOptionType,
  ChannelType,
  type RESTPutAPIApplicationCommandsJSONBody
} from 'discord-api-types/v9'

const channelLinksCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'channellinks',
  description: 'Link or unlink a text channel from a voice channel',
  default_permission: false,
  options: [{
    name: 'link',
    description: 'Link a voice channel to a text channel',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'fromchannel',
      description: 'The voice channel to link a text channel to',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildVoice],
      required: true
    }, {
      name: 'tochannel',
      description: 'The text channel to link to this voice channel',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
      required: true
    }]
  }, {
    name: 'unlink',
    description: 'Unlink a text channel from a voice channel',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'fromchannel',
      description: 'The voice channel to unlink a text channel from',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildVoice],
      required: true
    }, {
      name: 'tochannel',
      description: 'The text channel to unlink from this voice channel',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
      required: true
    }]
  }, {
    name: 'list',
    description: 'List a voice channels links',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'channel',
      description: 'The voice channel to list the links of',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildVoice],
      required: true
    }]
  }]
}

export default channelLinksCommand
