'use strict'
exports.extractText = (str, delimiter) => {
    if (str && delimiter) {
        if (str.indexOf(delimiter) !== str.lastIndexOf(delimiter)) {
            const firstIndex = str.indexOf(delimiter) + 1
            const lastIndex = str.lastIndexOf(delimiter)
            return str.substring(firstIndex, lastIndex)
        }
    }
}