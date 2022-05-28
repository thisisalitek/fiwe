module.exports = (member, req) => new Promise((resolve, reject) => {
	if(member.role != 'admin')
		return restError.auth(req, reject)

	switch (req.method) {
		case 'GET':
			if(req.params.param1 != undefined) {
				getOne(member, req).then(resolve).catch(reject)
			} else {
				getList(member, req).then(resolve).catch(reject)
			}
			break
		case 'POST':
			post(member, req).then(resolve).catch(reject)
			break
		case 'PUT':
			put(member, req).then(resolve).catch(reject)
			break
		case 'DELETE':
			deleteItem(member, req).then(resolve).catch(reject)
			break
		default:
			restError.method(req, reject)
			break
	}
})


function getOne(member, req) {
	return new Promise((resolve, reject) => {
		let filter = { deleted: false }
		filter._id = req.params.param1
		db.dbDefines.findOne(filter)
			.then(doc => {
				if(dbnull(doc, reject)) {
					resolve(doc)
				}
			})
			.catch(reject)
	})
}


function getList(member, req) {
	return new Promise((resolve, reject) => {

		let options = { page: (req.query.page || 1) }
		if((req.query.pageSize || req.query.limit)) {
			options.limit = req.query.pageSize || req.query.limit
		}

		let filter = { deleted: false }

		db.dbDefines.paginate(filter, options)
			.then(resolve)
			.catch(reject)
	})
}

function post(member, req) {
	return new Promise((resolve, reject) => {
		let data = req.body || {}
		if(!data.hasOwnProperty("dbName"))
			return reject({ code: "ERROR", message: "dbName required" })

		if(data.dbName.trim() == "")
			return reject({ code: "ERROR", message: "dbName required" })

		db.dbDefines.findOne({ dbName: data.dbName, deleted: false })
			.then(foundDoc => {
				if(foundDoc != null) {
					reject({ code: `DB_ALREADY_EXISTS`, message: `Database '${data.dbName}' zaten var.` })
				} else {
					delete data.userDb
					delete data.userDbHost
					let newDoc = new db.dbDefines(data)
					newDoc.save()
						.then(newDoc2 => {
							newDoc2.userDb = htmlEval(config.mongodb.newUserDbSyntax || '${_id}', newDoc2.toJSON())
							newDoc2.userDbHost = userMongoServerAddress()
							newDoc2.save()
								.then(newDoc3 => resolve(newDoc3))
								.catch(reject)
						})
						.catch(reject)
				}
			})
			.catch(reject)
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

function put(member, req) {
	return new Promise((resolve, reject) => {
		if(req.params.param1 == undefined)
			return restError.param1(req, reject)

		let data = req.body || {}
		data._id = req.params.param1

		data.modifiedDate = new Date()
		db.dbDefines.findOne({ _id: data._id }).then(doc => {
				if(dbnull(doc, reject)) {
					delete data.userDb
					delete data.userDbHost

					let doc2 = Object.assign(doc, data)
					let newDoc = new db.dbDefines(doc2)
					newDoc.save()
						.then(resolve)
						.catch(reject)
				}
			})
			.catch(reject)
	})
}

function deleteItem(member, req) {
	return new Promise((resolve, reject) => {
		if(req.params.param1 == undefined)
			restError.param1(req, reject)

		let data = req.body || {}
		data._id = req.params.param1

		db.dbDefines.findOne({ _id: data._id, deleted: false }).then(doc => {
			if(dbnull(doc, reject)) {
				doc.deleted = true
				doc.modifiedDate = new Date()
				doc.save()
				.then(resolve)
				.catch(reject)
			}
		}).catch(reject)
	})
}