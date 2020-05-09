'use strict'
const urlExpression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
const urlRegex = new RegExp(urlExpression)

exports.convertBinding = binding => {
    if (binding.indexOf('-') !== -1) {
        const [min, max] = binding.split('-').map(value => parseInt(value))
        const values = []
        for (let value = min; value <= max; value++) {
            values.push(value)
        }
        return values
    } else if (binding.indexOf(',') !== -1) {
        return binding.split(',').map(value => parseInt(value))
    } else {
        return [parseInt(binding)]
    }
}

exports.getChannels = string => {
    return string.match(/<#([0-9]+)>/)
}

exports.getTags = string => {
    return string.match(/<@([0-9]+)>/)
}

exports.getUrls = string => {
    return string.match(urlRegex)
}
