'use strict'
module.exports = {
	'env': {
		'commonjs': true,
		'es6': true,
		'node': true
	},
	'extends': 'eslint:recommended',
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2018
	},
	'rules': {
		'indent': [
			'error',
			4,
			{
				'SwitchCase': 1
			}
		],
		'linebreak-style': [
			'error',
			'windows'
		],
		'quotes': [
			'error',
			'single',
			{
				'allowTemplateLiterals': true
			}
		],
		'semi': [
			'error',
			'never'
		]
	},
	'parser': 'babel-eslint'
}
