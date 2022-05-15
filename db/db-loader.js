global.mongoose = require('mongoose')
global.mongoosePaginate = require('mongoose-paginate-v2')
global.mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')
mongoosePaginate.paginate.options = {
	lean: true,
	limit: 10
}
global.ObjectId = mongoose.Types.ObjectId

global.userDbHelper = require('./userDbHelper')

global.dberr = (err, cb) => {
	if(!err) {
		return true
	} else {
		if(!cb) {
			throw err
			return false
		} else {
			cb(err)
			return false
		}
	}
}

global.dbnull = (doc, cb, msg = 'Kayıt bulunamadı') => {
	if(doc != null) {
		return true
	} else {
		let err = { code: 'RECORD_NOT_FOUND', message: msg }
		if(!cb) {
			throw err
			return false
		} else {
			cb(err)
			return false
		}
	}
}

global.sendToTrash = (conn, collectionName, member, filter, cb) => {
	conn.model(collectionName).findOne(filter, (err, doc) => {
		if(!err) {
			function silelim(cb1) {
				conn.model('recycle').insertMany([{ collectionName: collectionName, documentId: doc._id, document: doc, deletedBy: member.username, deletedById: member._id }], (err) => {
					if(!err) {
						conn.model(collectionName).deleteOne(filter, (err, doc) => {
							cb1(err, doc)
						})
					} else {
						cb1(err)
					}
				})
			}

			if(conn.model(collectionName).relations) {
				let relations = conn.model(collectionName).relations
				let keys = Object.keys(relations)
				let index = 0
				let errorList = []

				function kontrolEt(cb2) {
					if(index >= keys.length) {
						cb2(null)
					} else {
						repoDbModel(dbModel._id, (err, mdl) => {
							if(!err) {
								let k = keys[index]
								let relationFilter
								let errMessage = `Bu kayit <b>${k}</b> tablosuna baglidir.`
								if(Array.isArray(relations[k])) {
									if(relations[k].length > 0)
										if(typeof relations[k][0] == 'string') {
											relationFilter = {}
											relationFilter[relations[k][0]] = doc._id
											if(relations[k].length > 1)
												if(typeof relations[k][1] == 'string') errMessage = relations[k][1]
										}
								} else if(typeof relations[k] == 'object') {
									if(relations[k].field) {
										relationFilter = {}
										relationFilter[relations[k].field] = doc._id
										if(relations[k].filter) Object.assign(relationFilter, relations[k].filter)
										if(relations[k].message) errMessage = relations[k].message
									}
								}

								if(!relationFilter) {
									relationFilter = {}
									relationFilter[relations[k]] = doc._id
								}

								mdl[k].countDocuments(relationFilter, (err, c) => {
									if(!err) {
										if(c > 0) errorList.push(`${errMessage} ${c} Kayıt`)
										index++
										setTimeout(kontrolEt, 0, cb2)
									} else {
										cb2(err)
									}
								})
							} else {
								cb2(err)
							}
						})
					}
				}

				kontrolEt((err) => {
					if(!err && errorList.length == 0) {
						silelim(cb)
					} else {
						errorList.unshift('<b>Bağlı kayıt(lar) var. Silemezsiniz!</b>')
						if(err) errorList.push(err.message)
						cb({ name: 'RELATION_ERROR', message: errorList.join('\n') })
					}
				})
			} else {
				silelim(cb)
			}

		} else {
			cb(err)
		}
	})
}

global.epValidateSync = (doc, cb) => {
	let err = doc.validateSync()
	if(err) {
		let keys = Object.keys(err.errors)
		let returnError = { code: 'HATALI_VERI', message: '' }
		keys.forEach((e, index) => {
			returnError.message += `#${(index+1).toString()} : ${err.errors[e].message}`
			if(index < keys.length - 1)
				returnError.message += '  |  '
		})

		if(cb) {
			cb(returnError)
			return false
		} else {
			throw returnError
		}
	} else {
		return true
	}
}

mongoose.set('debug', false)

process.on('SIGINT', function() {
	mongoose.connection.close(function() {
		eventLog('Mongoose default connection disconnected through app termination')
		process.exit(0)
	})
})

global.db = {
	get nameLog() {
		return `[MongoDB]`.cyan
	}
}

module.exports = () => new Promise((resolve, reject) => {
	connectMongoDatabase('master', config.mongodb.master, db)
		.then(()=>{
			initRepoDb()
			resolve()
		})
		.catch(reject)
})


global.repoHolder = {}

var serverConn1, serverConn2, serverConn3

function initRepoDb() {
	moduleLoader(path.join(__dirname, 'repo'), '.collection.js', ``, (err, holder) => {
		repoHolder = holder

		if(!err) {
			if(config.mongodb.server1) {
				serverConn1 = mongoose.createConnection(config.mongodb.server1, { useNewUrlParser: true, useUnifiedTopology: true, autoIndex: true })
				serverConn1.on('connected', () => {
					eventLog(`${config.mongodb.server1.brightBlue} ${'connected'.brightGreen}`)
					
				})

				serverConn1.on('error', (err) => errorLog(`${config.mongodb.server1.brightBlue} Error:`, err))
				serverConn1.on('disconnected', () => eventLog(`${config.mongodb.server1.brightBlue} disconnected`))
			}
			if(config.mongodb.server2) {
				serverConn2 = mongoose.createConnection(config.mongodb.server2, { useNewUrlParser: true, useUnifiedTopology: true, autoIndex: true })
				serverConn2.on('connected', () => {
					eventLog(`${config.mongodb.server2.brightBlue} ${'connected'.brightGreen}`)
				})

				serverConn2.on('error', (err) => errorLog(`${config.mongodb.server2.brightBlue} Error:`, err))
				serverConn2.on('disconnected', () => eventLog(`${config.mongodb.server2.brightBlue} disconnected`))
			}

		} else {
			errorLog('refreshRepoDb:', err)
		}
	})
}

global.repoDbModel = function(_id, cb) {
	if(_id == '')
		return dbnull(null, cb)

	db.dbdefines.findOne({ _id: _id, deleted: false, passive: false }, (err, doc) => {
		if(dberr(err, cb)) {
			if(dbnull(doc, cb)) {
				let dbModel = { get nameLog() { return dbNameLog(doc.dbName) } }
				dbModel._id = doc._id
				dbModel.dbName = doc.dbName
				// dbModel.enabledServices = doc.services
				// dbModel.authorizedMembers = doc.authorizedMembers
				switch (doc.userDbHost) {
					case config.mongodb.server1:
						dbModel.conn = serverConn1.useDb(doc.userDb)
						break
					case config.mongodb.server2:
						dbModel.conn = serverConn2.useDb(doc.userDb)
						break
					case config.mongodb.server3:
						dbModel.conn = serverConn3.useDb(doc.userDb)
						break
					default:
						dbModel.conn = serverConn1.useDb(doc.userDb)
						break
				}

				dbModel.free = function() {
					Object.keys(dbModel.conn.models).forEach((key) => {
						delete dbModel.conn.models[key]
						if(dbModel.conn.collections[key] != undefined)
							delete dbModel.conn.collections[key]
						if(dbModel.conn.base != undefined) {
							if(dbModel.conn.base.modelSchemas != undefined)
								if(dbModel.conn.base.modelSchemas[key] != undefined)
									delete dbModel.conn.base.modelSchemas[key]
						}
					})
				}

				Object.keys(repoHolder).forEach((key) => {
					Object.defineProperty(dbModel, key, {
						get: function() {
							if(dbModel.conn.models[key]) {
								return dbModel.conn.models[key]
							} else {
								return repoHolder[key](dbModel)
							}
						}
					})
				})


				cb(null, dbModel)
			}
		}
	})
}


function connectMongoDatabase(collectionFolder, mongoAddress, dbObj) {
	return new Promise((resolve, reject) => {
		if(collectionFolder && mongoAddress && !dbObj.conn) {
			collectionLoader(path.join(__dirname, collectionFolder), '.collection.js', ``)
				.then((holder) => {
					dbObj.conn = mongoose.createConnection(mongoAddress, { useNewUrlParser: true, useUnifiedTopology: true, autoIndex: true })
					dbObj.conn.on('connected', () => {
						Object.keys(holder).forEach((key) => {
							dbObj[key] = holder[key](dbObj.conn)
						})
						if(dbObj.conn.active != undefined) {
							eventLog(dbObj.nameLog, 're-connected')
						} else {
							eventLog(dbObj.nameLog, 'connected')
						}
						dbObj.conn.active = true
						resolve(dbObj)
					})

					dbObj.conn.on('error', (err) => {
						dbObj.conn.active = false
						reject(err)
					})

					dbObj.conn.on('disconnected', () => {
						dbObj.conn.active = false
						eventLog(dbObj.nameLog, 'disconnected')

					})

				})
				.catch(err => {
					reject(err)
				})
		} else {
			resolve(dbObj)
		}
	})
}


function collectionLoader(folder, suffix, expression) {
	return new Promise((resolve, reject) => {
		try {
			let collectionHolder = {}
			let files = fs.readdirSync(folder)
			files.forEach((e) => {
				let f = path.join(folder, e)
				if(!fs.statSync(f).isDirectory()) {
					let fileName = path.basename(f)
					let apiName = fileName.substr(0, fileName.length - suffix.length)
					if(apiName != '' && (apiName + suffix) == fileName) {
						collectionHolder[apiName] = require(f)
					}
				}
			})
			resolve(collectionHolder)
		} catch (err) {
			reject(err)
		}
	})
}