let redisStarted = false
module.exports = () => new Promise((resolve, reject) => {
	try {
		let redisConfig = {
			url: (config.redis || {}).url || 'redis://localhost:6379'
		}
		let redis = require('redis')
		let redisClient = redis.createClient(redisConfig)

		redisClient.on('connect', function() {
			eventLog('[REDIS]'.cyan, `connected`)
			redisStarted = true
			resolve(redisClient)
		})
		redisClient.on('error', function(err) {
			errorLog('[REDIS]'.cyan, err.message)
			if(redisStarted == false) {
				process.exit(1)
			}

		})

		redisClient.connect()
	} catch (e) {
		reject(e)
	}
})