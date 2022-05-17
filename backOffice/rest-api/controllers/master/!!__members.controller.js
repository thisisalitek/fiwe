module.exports = (member, req, res, next, cb) => {
	if(member.role != 'admin')
		return error.auth(req, next)

	switch (req.method) {
		case 'GET':
			if(req.params.param1 != undefined) {
				getOne(member, req, res, next, cb)
			} else {
				getList(member, req, res, next, cb)
			}
			break
		case 'POST':
			if(req.params.param1 == 'copy') {
				copy(member, req, res, next, cb)
			} else {
				post(member, req, res, next, cb)
			}
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
	db.members.findOne(filter, function(err, doc) {
		if(dberr(err, next)) {
			if(dbnull(doc, next)) {
				cb(doc)
			}
		}
	})
}


function getList(member, req, res, next, cb) {
	let options = { page: (req.query.page || 1) }

	if((req.query.pageSize || req.query.limit))
		options['limit'] = req.query.pageSize || req.query.limit

	let filter = {}
	options.sort = {
		createdDate: -1
	}

	if((req.query.role || '') != '')
		filter['role'] = req.query.role

	filter['approved'] = true

	console.log(`req.query.approved:`,req.query.approved)
	if(req.query.approved==='false') {
		filter['approved'] = false
		filter['role'] = 'user'
		options.sort = {
			createdDate: 1
		}
	}

	if((req.query.passive || '') != '')
		filter['passive'] = req.query.passive

	if((req.query.verified || '') != '')
		filter['verified'] = req.query.verified




	if((req.query.name || req.query.username || '') != '') {
		filter['$or'] = [
			{ 'username': { $regex: '.*' + (req.query.name || req.query.username) + '.*', $options: 'i' } },
			{ 'name': { $regex: '.*' + (req.query.name || req.query.username) + '.*', $options: 'i' } },
			{ 'lastName': { $regex: '.*' + (req.query.name || req.query.username) + '.*', $options: 'i' } }
		]
	}

	if((req.query.integrationCode || '') != '')
		filter['db.integrationCode'] = { $regex: '' + req.query.integrationCode + '.*', $options: 'i' }

	if((req.query.partyName || '') != '')
		filter['db.partyName'] = { $regex: '.*' + req.query.partyName + '.*', $options: 'i' }


	console.log(`filter:`, filter)
	db.members.paginate(filter, options, (err, resp) => {
		if(dberr(err, next)) {
			cb(resp)
		}
	})
}

function copy(member, req, res, next, cb) {
	let id = req.params.param2 || req.body['id'] || req.query.id || ''
	let newName = req.body['newName'] || req.body['username'] || ''

	if(id == '')
		error.param2(req, next)

	db.members.findOne({ _id: id }, (err, doc) => {
		if(dberr(err, next)) {
			if(dbnull(doc, next)) {
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

				let newDoc = new db.members(data)
				if(!epValidateSync(newDoc, next))
					return
				newDoc.save((err, newDoc2) => {
					if(dberr(err, next)) {
						let obj = newDoc2.toJSON()
						obj['newName'] = newDoc2.username
						cb(obj)
					}
				})
			}
		}
	})
}

function post(member, req, res, next, cb) {
	let data = req.body || {}
	if(!data.hasOwnProperty("username"))
		return next({ code: "ERROR", message: "username gereklidir." })

	if(data.username.trim() == "")
		return next({ code: "ERROR", message: "username boş olamaz." })

	db.members.findOne({ username: data.username }, function(err, foundDoc) {
		if(dberr(err, next))
			if(foundDoc != null) {
				return next({ code: `ALREADY_EXISTS`, message: `Member '${data.username}' zaten var.` })
			} else {
				delete data.createdDate
				delete data.lastOnline
				delete data.modifiedDate

				let newDoc = new db.members(data)

				newDoc.save(function(err, newDoc2) {
					if(dberr(err, next)) {
						cb(newDoc2)
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
		error.param1(req)

	let data = req.body || {}
	data._id = req.params.param1

	data.modifiedDate = new Date()
	db.members.findOne({ _id: data._id }, (err, doc) => {
		if(dberr(err, next))
			if(dbnull(doc, next)) {
				delete data.createdDate
				delete data.lastOnline
				delete data.modifiedDate
				if(member.role == 'admin' && doc._id == member._id) {
					delete data.role
					delete data.passive
				}
				let doc2 = Object.assign(doc, data)
				let newDoc = new db.members(doc2)
				newDoc.modifiedDate = new Date()
				newDoc.save((err, newDoc2) => {
					if(dberr(err, next))
						cb(newDoc2)
				})
			}
	})
}

function deleteItem(member, req, res, next, cb) {
	if(req.params.param1 == undefined)
		return error.param1(req, next)
	let data = req.body || {}
	data._id = req.params.param1
	if(member._id == data._id) {
		return next({ code: 'AUTH_ERROR', message: 'Kendi kendinizi silemezsiniz!' })
	}
	db.members.removeOne(member, { _id: data._id }, (err, doc) => {
		if(dberr(err, next)) {
			cb(null)
		}
	})
}