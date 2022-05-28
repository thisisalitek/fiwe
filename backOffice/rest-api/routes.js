let protectedFields = require('./protected-fields.json')

module.exports = (app) => {
	// app.all('/', (req, res, next) => {
	// 	res.status(200).json({ success: true, data: { name: config.name || '', description: config.description || '', version: config.version || '', status: config.status } })
	// })

	let apiWelcomeMessage = { message: `Welcome to ${config.name} API V1. Usage: /api/v1/:func/[:param1]/[:param2]/[:param3] . Methods: GET, POST, PUT, DELETE `, status: config.status }
	app.all('/api', function (req, res) {
		res.status(200).json({ success: true, data: apiWelcomeMessage })
	})

	app.all('/api/v1', function (req, res) {
		res.status(200).json({ success: true, data: apiWelcomeMessage })
	})

	authControllers(app, '/api/v1/auth/:func/:param1/:param2/:param3', 'auth')
	repoControllers(app, '/api/v1/db/:func/:param1/:param2/:param3', 'repo')
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
	setRoutes(app, route, (req, res, next) => {
		let ctl = getController('repo', req.params.func)
		if (!ctl)
			return next()
		passport(req)
			.then(member => {
				getSessionDbId(member, req)
					.then(dbModel => {
						ctl(dbModel, member, req)
							.then(data => {
								if (data == undefined)
									res.json({ success: true })
								else if (data == null)
									res.json({ success: true })
								else {
									res.status(200).json({ success: true, data: clearProtectedFields(req.params.func, data) })
								}
							})
							.catch(next)
					})
					.catch(next)
			})
			.catch(next)
	})
}

function getSessionDbId(member, req) {
	return new Promise((resolve, reject) => {
		let sessionId = req.body.sessionId || req.query.sessionId || req.headers.sessionId || req.body.sid || req.query.sid || req.headers.sid || ''
		if (sessionId == '')
			return reject({ code: 'SESSION_NOT_FOUND', message: 'The session has been terminated. Please login.' })
		db.sessions.findOne({ _id: sessionId })
			.then(doc => {
				if (dbnull(doc, reject)) {
					if (doc.passive)
						return reject({ code: 'SESSION_NOT_FOUND', message: 'The session has been set passive. Please login.' })

					if (doc.memberId != member._id)
						return reject({ code: 'INCORRECT_DATA', message: 'Incorrect sessionId ' })

					if (doc.dbId == '')
						return reject({ code: 'SESSION_ERROR', message: 'Session does not have databaseId' })
					getRepoDbModel(doc.dbId).then(resolve).catch(reject)
				}
			})
			.catch(reject)
	})
}




function masterControllers(app, route, folder) {
	setRoutes(app, route, (req, res, next) => {
		let ctl = getController('master', req.params.func)
		if (!ctl)
			return next()
		passport(req)
			.then(member => {
				ctl(member, req)
					.then(data => {
						if (data == undefined)
							res.json({ success: true })
						else if (data == null)
							res.json({ success: true })
						else {
							res.status(200).json({ success: true, data: clearProtectedFields(req.params.func, data) })
						}
					})
					.catch(next)

			})
			.catch(next)
	})

}

function authControllers(app, route, folder) {
	setRoutes(app, route, (req, res, next) => {
		let ctl = getController('auth', req.params.func)
		if (!ctl)
			return next()
		ctl(req)
			.then(data => {
				if (data == undefined)
					res.json({ success: true })
				else if (data == null)
					res.json({ success: true })
				else {
					res.status(200).json({ success: true, data: clearProtectedFields(req.params.func, data) })
				}
			})
			.catch(next)
	})
}

function getController(folder, funcName) {
	let controllerName = path.join(__dirname, '/controllers', folder, `${funcName}.controller.js`)
	if (fs.existsSync(controllerName) == false) {
		return null
	} else {
		return require(controllerName)
	}
}

function clearProtectedFields(funcName, data, cb) {
	if (protectedFields != undefined) {
		if (protectedFields[funcName] == undefined)
			protectedFields[funcName] = protectedFields['standart']

		if (data != undefined) {
			if (Array.isArray(data)) {
				data.forEach((e) => {
					e = temizle(e, protectedFields[funcName].outputFields)
				})

			} else {
				if (data.hasOwnProperty('docs')) {
					data.docs.forEach((e) => {
						e = temizle(e, protectedFields[funcName].outputFields)
					})
				}
				data = temizle(data, protectedFields[funcName].outputFields)
			}
			return data
		} else {
			return data
		}
	} else {
		return data
	}

	function temizle(obj, fieldList) {
		if (obj != undefined) {
			if (typeof obj['limit'] != 'undefined' && typeof obj['totalDocs'] != 'undefined' && typeof obj['totalPages'] != 'undefined' && typeof obj['page'] != 'undefined') {
				obj['pageSize'] = obj.limit
				obj.limit = undefined
				delete obj.limit

				obj['recordCount'] = obj.totalDocs
				obj.totalDocs = undefined
				delete obj.totalDocs

				obj['pageCount'] = obj.totalPages
				obj.totalPages = undefined
				delete obj.totalPages

			}
		}
		if (obj == undefined || fieldList == undefined) return obj
		if (obj == null || fieldList == null) return obj

		if (!Array.isArray(fieldList)) {
			if (obj[fieldList] != undefined) {
				obj[fieldList] = undefined
				delete obj[fieldList]
			}
		} else {
			fieldList.forEach((key) => {
				if (obj[key] != undefined) {
					obj[key] = undefined
					delete obj[key]
				}
			})
		}

		return obj
	}

}

function sendError(err, res) {

	let error = { code: '403', message: '' }
	if (typeof err == 'string') {
		error.message = err
	} else {
		error.code = err.code || err.name || 'ERROR'
		if (err.message)
			error.message = err.message
		else
			error.message = err.name || ''
	}

	res.status(401).json({ success: false, error: error })
}

function setRoutes(app, route, cb1, cb2) {
	let dizi = route.split('/:')
	let yol = ''
	dizi.forEach((e, index) => {
		if (index > 0) {
			yol += `/:${e}`
			if (cb1 != undefined && cb2 == undefined) {
				app.all(yol, cb1)
			} else if (cb1 != undefined && cb2 != undefined) {
				app.all(yol, cb1, cb2)
			}
		} else {
			yol += e
		}
	})
}


function passport(req) {
	return new Promise((resolve, reject) => {
		let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''
		let exceptedFunctions = ['subscribe', 'signup', 'verify']
		if (exceptedFunctions.includes(req.params.func)) {
			resolve()
		} else {
			let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['token']
			auth.verify(token)
				.then(userInfo => resolve(userInfo))
				.catch(reject)
		}
	})
}



global.restError = {
	param1: function (req, next) {
		next({ code: 'INCORRECT_PARAMETER', message: `function:[/${req.params.func}] [/:param1] is required` })
	},
	param2: function (req, next) {
		next({ code: 'INCORRECT_PARAMETER', message: `function:[/${req.params.func}/${req.params.param1}] [/:param2] is required` })
	},
	method: function (req, next) {
		next({ code: 'INCORRECT_METHOD', message: `function:${req.params.func} WRONG METHOD: ${req.method}` })
	},
	auth: function (req, next) {
		next({ code: 'AUTH_FAILED', message: `Authentication failed` })
	},
	data: function (req, next, field) {
		if (field) {
			next({ code: 'INCORRECT_DATA', message: `"${field}" Incorrect or missing data` })

		} else {
			next({ code: 'INCORRECT_DATA', message: `Incorrect or missing data` })

		}
	}
}