'use strict'

const GroupTypes = {
  CHANNEL: 'channel',
  ROLE: 'role'
}

const VerificationProviders = {
  BLOXLINK: 'Bloxlink',
  ROVER: 'RoVer'
}

const WSEvents = {
  TRAIN_DEVELOPERS_PAYOUT: 'trainDevelopersPayout',
  RANK_CHANGE: 'rankChange'
}

module.exports = {
  GroupTypes,
  VerificationProviders,
  WSEvents
}
