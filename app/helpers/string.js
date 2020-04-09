'use strict'
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
