const fs = require('fs')

exports.readJson = (path, entry = '') => {
    const json = require(path)
    return json[entry] != null ? json[entry] : json
}

exports.toStringArray = array => {
    let res = ''
    array.forEach(line => {

    })
    return res
}

exports.convertTimezones = () => {
    fs.readFile('/home/pi/timezones.txt', (err, data) => {
        let timezones = {}
        let count = 0
        let currentPlace
        data.toString().split('\n').forEach(line => {
            if (count % 4 === 0) {
                if (currentPlace) {
                    timezones[currentPlace] = Array.from(new Set(timezones[currentPlace]))
                }
                currentPlace = line.substring(line.indexOf('/usr/share/zoneinfo/') + 20, line.length)
                timezones[currentPlace] = []
            } else if ((count - 1) % 4 === 0 || (count - 2) % 4 === 0) {
                let abbreviation = line.substring(line.lastIndexOf(' ') + 2, line.length - 1)
                timezones[currentPlace].push(abbreviation)
            }
            count += 1
        })
        fs.writeFile('/home/pi/convertedTimezones.txt', JSON.stringify(timezones), err => {
            if (err) throw err
            console.log('Successfully written to file!')
        })
    })
}
