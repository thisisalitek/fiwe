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
						.then(() => {
							eventLog(`Application was started properly :-)`.yellow)
						})
						.catch(showError)
					)
					.catch(showError)
				)
				.catch(showError)
			)
			.catch(showError)

		if (config.status != 'development') {
			process.on('uncaughtException', err => { errorLog('Caught exception: ', err) })
			process.on('unhandledRejection', err => { errorLog('Caught rejection: ', err) })
		}

	})
	.catch(showError)
	
function showError(err) {
	console.log('initialize error:', err)
}

var xls = require('./lib/excel-helper')
function testKod(a) {
	return new Promise((resolve, reject) => {
		return resolve()
		let options = {
			sheetName: (s) => s.toUpperCase(),
			rows: (rows) => {
				rows.forEach(e => {
					e[0]=(e[0] || '').toUpperCase()
				})
				return rows
			}
		}
		xls.convertXlsxToJSON(path.join(__dirname, 'resources', 't1.xlsx'),options)
			.then(result => {
				tempLog('t1.json',JSON.stringify(result,null,2))
				resolve()
			})
			.catch(reject)

	})
}
