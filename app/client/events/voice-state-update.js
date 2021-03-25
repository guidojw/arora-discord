'use strict'
const voiceStateUpdateHandler = async (_client, oldState, newState) => {
  if (oldState.channelID !== newState.channelId) {
    if (oldState.channel) {
      const toLinks = await oldState.channel.fetchToLinks()
      toLinks.forEach(channel => {
        try {
          channel.permissionOverwrites.get(newState.member.id)?.delete()
        } catch {} // eslint-disable-line no-empty
      })
    }

    if (newState.channel) {
      const toLinks = await newState.channel.fetchToLinks()
      toLinks.forEach(channel => {
        try {
          channel.updateOverwrite(newState.member, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true
          })
        } catch {} // eslint-disable-line no-empty
      })
    }
  }
}

module.exports = voiceStateUpdateHandler
