'use strict'
// eslint-disable-next-line max-len
const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi

exports.getChannels = string => {
  return string.match(/<#([0-9]+)>/)
}

exports.getTags = string => {
  return string.match(/<@([0-9]+)>/)
}

exports.getUrls = string => {
  return string.match(urlRegex)
}

exports.getAbbreviation = string => {
  return string
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
}
