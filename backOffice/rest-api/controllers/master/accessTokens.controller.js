module.exports = (member, req) => new Promise((resolve, reject) => {
	switch (req.method) {
		case 'GET':
			if(req.params.param1 != undefined) {
				getOne(member, req).then(resolve).catch(reject)
			} else {
				getList(member, req).then(resolve).catch(reject)
			}
			break
		case 'POST':
			if(req.params.param1 == 'copy') {
				copy(member, req).then(resolve).catch(reject)
			} else {
				post(member, req).then(resolve).catch(reject)
			}
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
		db.accessTokens.findOne(filter)
			.then(resolve)
			.catch(reject)
	})
}


function getList(member, req) {
	return new Promise((resolve, reject) => {
		let options = {
			page: (req.query.page || 1),
			populate: [
				{ path: 'members', select: '_id username name lastName' }
			]
		}

		if((req.query.pageSize || req.query.limit))
			options['limit'] = req.query.pageSize || req.query.limit

		let filter = {}
		options.sort = {
			createdDate: -1
		}


		if((req.query.passive || '') != '')
			filter['passive'] = req.query.passive


		if((req.query.name || req.query.username || '') != '') {
			filter['$or'] = [
				{ 'username': { $regex: '.*' + (req.query.name || req.query.username) + '.*', $options: 'i' } },
				{ 'name': { $regex: '.*' + (req.query.name || req.query.username) + '.*', $options: 'i' } },
				{ 'lastName': { $regex: '.*' + (req.query.name || req.query.username) + '.*', $options: 'i' } }
			]
		}

		db.accessTokens.paginate(filter, options).then(resolve).catch(reject)
	})
}

function copy(member, req) {
	return new Promise((resolve, reject) => {
		let id = req.params.param2 || req.body['id'] || req.query.id || ''
		let newName = req.body['newName'] || req.body['username'] || ''

		if(id == '')
			return restError.param2(req, reject)

		db.accessTokens.findOne({ _id: id })
			.then(doc => {
				if(dbnull(doc, reject)) {
					let data = doc.toJSON()
					data._id = undefined
					delete data._id
					if(newName != '') {
						data.username = newName
					} else {
						data.username += ' copy'
					}
					data.createdDate = new Date()
					data.modifiedDate = new Date()

					let newDoc = new db.accessTokens(data)
					if(!epValidateSync(newDoc, reject))
						return
					newDoc.save()
						.then(newDoc2 => {
							let obj = newDoc2.toJSON()
							obj['newName'] = newDoc2.username
							resolve(obj)
						})
						.catch(reject)
				}
			})
			.catch(reject)
	})
}

function post(member, req) {
	return new Promise((resolve, reject) => {
		let data = req.body || {}


		db.accessTokens.findOne({ username: data.username })
			.then(foundDoc => {
				if(foundDoc != null) {
					reject({ code: `ALREADY_EXISTS`, message: `Member '${data.username}' already exists` })
				} else {
					delete data.createdDate
					delete data.lastUsage
					delete data.expireDate

					let newDoc = new db.accessTokens(data)

					newDoc.save()
						.then(resolve)
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
			restError.param1(req, reject)

		let data = req.body || {}
		data._id = req.params.param1

		data.modifiedDate = new Date()
		db.accessTokens.findOne({ _id: data._id })
			.then(doc => {
				if(dbnull(doc, reject)) {
					delete data.createdDate
					delete data.lastUsage
					delete data.expireDate

					let doc2 = Object.assign(doc, data)
					let newDoc = new db.accessTokens(doc2)
					newDoc.modifiedDate = new Date()
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
			return restError.param1(req, reject)
		let data = req.body || {}
		data._id = req.params.param1
		if(member._id == data._id) {
			return reject({ code: 'AUTH_ERROR', message: 'Kendi kendinizi silemezsiniz!' })
		}
		db.accessTokens.removeOne(member, { _id: data._id })
			.then(resolve)
			.catch(reject)
	})
}