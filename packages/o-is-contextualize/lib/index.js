'use strict'

const assign = require('lodash.assign')
const get = require('lodash.get')

const fail = () => {
	return {
		type: 'fail'
	}
}

const pass = () => {
	return {
		type: 'pass'
	}
}

const builtinRunners = {
	equal(tests, runners, key, value) {
		const regContains = new RegExp('^' + key + '.')
		return tests.map((test) => {
			if(test.type === 'equal' && regContains.test(test.key)) {
				const part = test.key.split(regContains)[1]
				if(get(value, part) === test.value) {
					return pass()
				} else {
					return fail()
				}
			}
			return test
		})
	}//,
	//propsEqual(tests, runners, key, value) {
	//	const regContains = new RegExp('^' + key + '.')
	//	return tests
	//	return tests.map((test) => {
	//		if(test.type === 'equal') {
	//			if(regContains.test(test.keys[0])) {
	//				if(regContains.test(test.keys[1])) {
	//					const part1 = test.keys[0].split(regContains)[1]
	//					const part2 = test.keys[1].split(regContains)[1]
	//					if(get(value, part1) === get(value, part2)) {
	//						return pass()
	//					} else {
	//						return fail()
	//					}
	//				}
	//				const part = test.keys[0].split(regContains)[1]
	//				const val = get(value, part)
	//				return {
	//					type: 'equal',
	//					key: test.keys[1],
	//					value: val
	//				}
	//			}
	//			if(regContains.test(test.key[1])) {
	//				const part = test.keys[1].split(regContains)[1]
	//				const val = get(value, part)
	//				return {
	//					type: 'equal',
	//					key: test.keys[0],
	//					value: val
	//				}
	//			}
	//			return test
	//		}
	//	})
	//}
}

const contextualize = (self, runners, key, value) => {
	console.log('contextualize')
	let tests = self.tests
	console.log(tests)
	for(var k in runners) {
		tests = runners[k](tests, runners, key, value)
	}
	console.log('tests:', tests)
	return self._create(tests, self._boundKeys)
}

const createContextualize = (runners) => {
	return function(key, value) {
		return contextualize(this, runners, key, value)
	}
}

module.exports = createContextualize(builtinRunners)

module.exports.extend = (extension) => {
	const runners = assign({}, builtinRunners, extension)
	createContextualize(runners)
}
