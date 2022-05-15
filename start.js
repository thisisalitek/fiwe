global.__root = __dirname // application root folder

require('./initialize')() // initializing some require global variables and include some nodejs modules
	.then(() => {
		let dbLoader = require(path.join(__root, 'db/db-loader')) // loading database models and functions
		let restApi = require(path.join(__root, 'rest-api/rest-api')) // loading rest api controllers and url path routes
		let httpServer = require(path.join(__root, 'lib/http-server')) // starting http server
		// let ratesEngine = require(path.join(__root, 'rates-engine/rates-engine')) // rates engine
		// let websocketApi = require(path.join(__root, 'websocket-api/websocket-api')) // rates engine

		dbLoader()
			.then(() => testKod(455)
				.then(() => restApi()
					.then(app => httpServer(config.httpserver.port, app)
						// .then(server => ratesEngine(server)
						// 	.then(() => websocketApi(server)
								.then(() => eventLog(`Application was started properly :-)`.yellow))
								.catch(showError)
						// 	).catch(showError)
						// ).catch(showError)
					)
					.catch(showError)
				)
				.catch(showError)
			)
			.catch(showError)
	})
	.catch(showError)

function showError(err) {
	errorLog('initialize error:', err)
}

function testKod(a) {
	return new Promise((resolve, reject) => {

		// setInterval(()=>{
		// 	a+=12
		// 	console.log(`testKod a:`, a)
		// },2000)

		resolve('fitifiti')
	})

}

// /* Catch Global Crashing */
// if the program is running 'release' mode, this code prevents to crash the program
process.on('uncaughtException', function(err) {
	errorLog('Caught exception: ', err)
	// here we can add a sending error mail to system admin
})

process.on('unhandledRejection', (reason, promise) => {
	errorLog('Caught Rejection: ', reason)
})
// end /* Catch Global Crashing */