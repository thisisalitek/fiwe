module.exports = (app) => {
	app.all('/', (req, res, next) => {
		res.status(200).json({ success: true, data: { name: config.name || '', description: config.description || '', version: config.version || '', status: config.status } })
	})

	let apiWelcomeMessage = { message: `Welcome to ${config.name} API V1. Usage: /api/v1/:func/[:param1]/[:param2]/[:param3] . Methods: GET, POST, PUT, DELETE `, status: config.status }
	app.all('/api', function(req, res) {
		res.status(200).json({ success: true, data: apiWelcomeMessage })
	})

	app.all('/api/v1', function(req, res) {
		res.status(200).json({ success: true, data: apiWelcomeMessage })
	})

	authControllers(app, '/api/v1/auth/:func/:param1/:param2/:param3', 'auth')
	repoControllers(app, '/api/v1/:dbId/:func/:param1/:param2/:param3', 'master')
	masterControllers(app, '/api/v1/:func/:param1/:param2/:param3', 'master')

	// catch 404 and forward to error handler
	app.use((req, res, next) => {
		res.status(404).json({ success: false, error: { code: '404', message: 'function not found' } })
	})

	app.use((err, req, res, next) => {
		sendError(err, res)
	})

}

function repoControllers(app, route, folder) {
	app.all('/api/:dbId/*', (req, res, next) => {
		next()
	})

	setRoutes(app, route, (req, res, next) => {
		let ctl = getController('master', req.params.func)
		if(!ctl) {
			return next()
		}
		passport(req, res, next, (member) => {
			repoDbModel(req.params.dbId, (err, dbModel) => {
				ctl(dbModel, member, req, res, next, (data) => {
					if(data == undefined)
						res.json({ success: true })
					else if(data == null)
						res.json({ success: true })
					else {
						res.status(200).json({ success: true, data: data })
					}
				})
			})
		})
	})

}

function masterControllers(app, route, folder) {
	setRoutes(app, route, (req, res, next) => {
		let ctl = getController('master', req.params.func)
		if(!ctl) {
			return next()
		}
		passport(req, res, next, (member) => {
			ctl(member, req, res, next, (data) => {
				if(data == undefined)
					res.json({ success: true })
				else if(data == null)
					res.json({ success: true })
				else {
					res.status(200).json({ success: true, data: data })
				}
			})
		})
	})

}

function authControllers(app, route, folder) {
	setRoutes(app, route, (req, res, next) => {
		let ctl = getController('auth', req.params.func)
		if(!ctl) {
			return next()
		}
		ctl(req, res, next, (data) => {
			if(data == undefined)
				res.json({ success: true })
			else if(data == null)
				res.json({ success: true })
			else {
				res.status(200).json({ success: true, data: data })
			}
		})
	})
}

function getController(folder, funcName) {
	let controllerName = path.join(__dirname, '/controllers', folder, `${funcName}.controller.js`)
	if(fs.existsSync(controllerName) == false) {
		return null
	} else {
		return require(controllerName)
	}
}

function sendError(err, res) {
	console.log(`err:`, err)
	let error = { code: '403', message: '' }
	if(typeof err == 'string') {
		error.message = err
	} else {
		error.code = err.code || err.name || 'ERROR'
		if(err.message)
			error.message = err.message
		else
			error.message = err.name || ''
	}
	console.log(`error:`, error)
	res.status(401).json({ success: false, error: error })
}

function setRoutes(app, route, cb1, cb2) {
	let dizi = route.split('/:')
	let yol = ''
	dizi.forEach((e, index) => {
		if(index > 0) {
			yol += `/:${e}`
			if(cb1 != undefined && cb2 == undefined) {
				app.all(yol, cb1)
			} else if(cb1 != undefined && cb2 != undefined) {
				app.all(yol, cb1, cb2)
			}
		} else {
			yol += e
		}
	})
}


function passport(req, res, next, cb) {
	let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''
	let exceptedFunctions = ['subscribe', 'signup', 'verify']
	if(exceptedFunctions.includes(req.params.func)) {
		cb(null)
	} else {
		let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['token']
		auth.verify(token)
			.then(userInfo => cb(userInfo))
			.catch(next)
	}
}

global.restError = {
	param1: function(req, next) {
		next({ code: 'INCORRECT_PARAMETER', message: `function:[/${req.params.func}] [/:param1] is required` })
	},
	param2: function(req, next) {
		next({ code: 'INCORRECT_PARAMETER', message: `function:[/${req.params.func}/${req.params.param1}] [/:param2] is required` })
	},
	method: function(req, next) {
		next({ code: 'INCORRECT_METHOD', message: `function:${req.params.func} WRONG METHOD: ${req.method}` })
	},
	auth: function(req, next) {
		next({ code: 'AUTH_FAILED', message: `Authentication failed` })
	},
	data: function(req, next, field) {
		if(field) {
			next({ code: 'INCORRECT_DATA', message: `"${field}" Incorrect or missing data` })

		} else {
			next({ code: 'INCORRECT_DATA', message: `Incorrect or missing data` })

		}
	}
}