const moment = require('moment')
const Calendar = require('./Calendar')
const assert = require('assert')

describe('getAvailableSpot', function () {
	it('Should get 2 available spots of calendar 1', function () {
		let result = Calendar.getAvailableSpots(1, "10-04-2023", 15)
		assert.ok(result)
		assert.equal(result.length, 4)
		assert.equal(result[0].startHour.valueOf(), moment.utc('2023-04-10T16:00:00.000Z').valueOf())
		assert.equal(result[0].endHour.valueOf(), moment.utc('2023-04-10T16:15:00.000Z').valueOf())
		assert.equal(result[1].startHour.valueOf(), moment.utc('2023-04-10T16:30:00.000Z').valueOf())
		assert.equal(result[1].endHour.valueOf(), moment.utc('2023-04-10T16:45:00.000Z').valueOf())
	})
})

describe('getAvailableSpot', function () {
	it('Should get 1 available spots of calendar 2', function () {
		let result = Calendar.getAvailableSpots(2, "13-04-2023", 25)
		assert.ok(result)
		assert.equal(result.length, 3)
		assert.equal(result[0].startHour.valueOf(), moment.utc('2023-04-13T16:55:00.000Z').valueOf())
		assert.equal(result[0].endHour.valueOf(), moment.utc('2023-04-13T17:20:00.000Z').valueOf())
	})
})

describe('getAvailableSpot', function () {
	it('Should get no available spots of calendar 2', function () {
		let result = Calendar.getAvailableSpots(3, "10-04-2023", 25)
		assert.ok(result)
		assert.equal(result.length, 1)
		assert.equal(result[0].startHour.valueOf(), moment.utc('2023-04-10T22:00:00.000Z').valueOf())
	})
})
