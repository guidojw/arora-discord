'use strict'
const timeHelper = require('../helpers/time')

module.exports = async guild => {
  const voteData = guild.getData('vote')
  const channel = guild.guild.channels.cache.get(voteData.channel)
  if (!channel) throw new Error('Cannot get channel.')
  const message = await channel.messages.fetch(voteData.timer.message)
  if (!message) throw new Error('Cannot fetch message.')
  const now = Date.now()
  if (voteData.timer.end > now) {
    message.edit(`🕰️️ *${timeHelper.getDurationString(voteData.timer.end - now)}* left to vote!`)
  } else {
    message.edit('🕰️️ **This vote has ended!**')
    guild.stopJob('updateTimerJob')
  }
}
