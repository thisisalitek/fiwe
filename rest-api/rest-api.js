var createError = require('http-errors')
var express = require('express')
var bodyParser = require('body-parser')
var logger = require('morgan')
var favicon = require('serve-favicon')
var methodOverride = require('method-override')
var cookieParser = require('cookie-parser')
var app = express()
var cors = require('cors')

module.exports = () => new Promise((resolve, reject) => {
	app.use(cors())
	app.use(favicon(path.join(__root, '/resources/web-icon.png')))

	if(config.status == 'development')
		app.use(logger('dev'))
	app.use(bodyParser.json({ limit: "500mb" }))
	app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit: 50000 }))

	app.use(cookieParser())
	app.use(methodOverride())

	app.set('port', config.httpserver.port)

	app.use('/', express.static(path.join(__root, 'public')))

	testControllers(true)
		.then(() => {
			require('./routes')(app)
			require('./pages/index')()
				.then(() => {
					eventLog(`[RestAPI]`.cyan, 'started')
					resolve(app)
				})
				.catch(reject)
		})
		.catch(reject)

})



/*
	REST-API CONTROLLER TEST
	Checking all controllers folders.
*/
function testControllers(log) {
	return moduleLoader(path.join(__dirname, '/controllers/auth'), '.controller.js', (log ? `[RestAPI]`.cyan + ` auth controllers` : ''))
		.then(() => {
			return moduleLoader(path.join(__dirname, '/controllers/master'), '.controller.js', (log ? `[RestAPI]`.cyan + ` master controllers` : ''))
		})
		.then(() => {
			return moduleLoader(path.join(__dirname, '/controllers/repo'), '.controller.js', (log ? `[RestAPI]`.cyan + ` repo controllers` : ''))
		})


}