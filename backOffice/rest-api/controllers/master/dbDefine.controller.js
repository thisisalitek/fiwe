module.exports = (member, req, res, next, cb) => {
	if(member.role!='admin'){
		return restError.auth(req,next)
	}
	switch (req.method) {
		case 'GET':
			if(req.params.param1 != undefined) {
				getOne(member, req, res, next, cb)
			} else {
				getList(member, req, res, next, cb)
			}
			break
		case 'POST':
			post(member, req, res, next, cb)
			break
		case 'PUT':
			put(member, req, res, next, cb)
			break
		case 'DELETE':
			deleteItem(member, req, res, next, cb)
			break
		default:
			restError.method(req, next)
			break
	}
}


function getOne(member, req, res, next, cb) {

	let filter = { deleted: false }
	filter._id = req.params.param1
	db.dbDefines.findOne(filter, function(err, doc) {
		if(dberr(err, next)) {
			if(dbnull(doc, next)) {
				cb(doc)
			}
		}
	})
}


function getList(member, req, res, next, cb) {
	
	let options = { page: (req.query.page || 1) }
	if((req.query.pageSize || req.query.limit)) {
		options.limit = req.query.pageSize || req.query.limit
	}

	let filter = {
		deleted: false
	}

	db.dbDefines.paginate(filter, options, (err, resp) => {
		if(dberr(err, next)) {
			cb(resp)
		}
	})
}

function post(member, req, res, next, cb) {
	let data = req.body || {}
	if(!data.hasOwnProperty("dbName"))
		return next({ code: "ERROR", message: "dbName gereklidir." })

	if(data.dbName.trim() == "")
		return next({ code: "ERROR", message: "dbName boş olamaz." })

	db.dbDefines.findOne({ dbName: data.dbName, deleted: false }, function(err, foundDoc) {
		if(dberr(err, next))
			if(foundDoc != null) {
				return next({ code: `DB_ALREADY_EXISTS`, message: `Database '${data.dbName}' zaten var.` })
			} else {
				delete data.userDb
				delete data.userDbHost
				let newDoc = new db.dbDefines(data)
				newDoc.save(function(err, newDoc2) {
					if(!err) {
						newDoc2.userDb = htmlEval(config.mongodb.newUserDbSyntax || '${_id}',newDoc2.toJSON())
						newDoc2.userDbHost = userMongoServerAddress()
						newDoc2.save((err, newDoc3) => {
							if(dberr(err, next)) {
								cb(newDoc3)
							}
						})
					} else {
						next({ code: err.name, message: err.message })
					}
				})
			}

	})
}

function userMongoServerAddress() {
	if((config.mongodb.server1 || '') != '') {
		return config.mongodb.server1
	} else if((config.mongodb.server2 || '') != '') {
		return config.mongodb.server2
	} else if((config.mongodb.server3 || '') != '') {
		return config.mongodb.server3
	} else {
		return config.mongodb.master || ''
	}
}

function put(member, req, res, next, cb) {
	if(req.params.param1 == undefined)
		restError.param1(req)

	let data = req.body || {}
	data._id = req.params.param1

	data.modifiedDate = new Date()
	db.dbDefines.findOne({ _id: data._id}, (err, doc) => {
		if(dberr(err, next))
			if(dbnull(doc, next)) {
				delete data.userDb
				delete data.userDbHost

				let doc2 = Object.assign(doc, data)
				let newDoc = new db.dbDefines(doc2)
				newDoc.save((err, newDoc2) => {
					if(dberr(err, next))
						cb(newDoc2)
				})
			}
	})
}

function deleteItem(member, req, res, next, cb) {
	if(req.params.param1 == undefined)
		restError.param1(req)

	let data = req.body || {}
	data._id = req.params.param1

	db.dbDefines.findOne({ _id: data._id, deleted: false }, (err, doc) => {
		if(dberr(err, next))
			if(dbnull(doc, next)) {
				doc.deleted = true
				doc.modifiedDate = new Date()
				doc.save(function(err, newDoc2) {
					if(dberr(err, next)) {
						cb({ success: true })
					}
				})
			}
	})
}