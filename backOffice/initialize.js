module.exports = () => new Promise((resolve, reject) => {
	try {
		require('use-strict')
		require('colors')

		global.fs = require('fs')
		global.path = require('path')
		global.uuid = require('uuid')
		global.atob = require('atob')
		global.btoa = require('btoa')
		global.sizeOf = require('object-sizeof')
		global.urllib = require('urllib')
		global.os = require('os')
		
		global.moment = require(path.join(__root, 'lib/moment'))
		global.moment.updateLocale('tr')

		global.config = {}

		if(fs.existsSync(path.join(__root, 'config.json')))
			config = require(path.join(__root, 'config.json'))
		else
			return reject(`config.json couldn't be found`)

		if(process.argv[2] == 'localhost' || process.argv[2] == '-l' || process.argv[2] == '-dev' || process.argv[2] == '-development') {
			global.config.status = 'development'
		} else {
			global.config.status = global.config.status || 'release'
		}


		global.util = require(path.join(__root, 'lib/util'))
		global.auth = require(path.join(__root, 'lib/auth'))
		global.mail = require(path.join(__root, 'lib/mail'))
		global.sender = require(path.join(__root, 'lib/sender'))
		global.spamCheck = require(path.join(__root, 'lib/spam-check'))
		global.excelHelper = require(path.join(__root, 'lib/excel-helper'))

		// Application info
		console.log('-'.repeat(70))
		console.log('Application Name:'.padding(25), config.name.brightYellow)
		console.log('Version:'.padding(25), config.version.yellow)
		console.log('Redis:'.padding(25), config.redis.url.yellow)
		console.log('Http Port:'.padding(25), config.httpserver.port.toString().yellow)
		console.log('MongoDB:'.padding(25), config.mongodb.master.brightYellow)
		console.log('Temp Folder:'.padding(25), config.tmpDir.yellow)
		console.log('Status:'.padding(25), config.status.toUpperCase().cyan)
		console.log('Uptime Started:'.padding(25), timeStamp().yellow)
		console.log('-'.repeat(70))

		// ./Application info
		
		require(path.join(__root, 'lib/redis'))()
			.then(redis => {
				global.redis = redis
				resolve()
			})
			.catch(reject)
	} catch (err) {
		reject(err)
	}
})