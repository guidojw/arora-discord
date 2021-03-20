'use strict'
const voiceStateUpdateHandler = async (_client, oldState, newState) => {
  if (oldState.channelID !== newState.channelId) {
    if (oldState.channel) {
      const toLinks = await oldState.channel.fetchToLinks()
      toLinks.map(channel => channel.permissionOverwrites.get(newState.member.id)?.delete())
    }
    if (newState.channel) {
      const toLinks = await newState.channel.fetchToLinks()
      toLinks.map(channel => channel.updateOverwrite(newState.member, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: true
      }))
    }
  }
}

module.exports = voiceStateUpdateHandler
