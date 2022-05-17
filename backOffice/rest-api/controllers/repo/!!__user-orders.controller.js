module.exports = (dbModel, member, req, res, next, cb) => {
	if(req.method!='GET' && (member.db.integrationCode || '')=='' && member.role=='user')
		return error.notApproved(req, next)

	switch (req.method) {
		case 'GET':
			if(req.params.param1 != undefined) {
				if(req.params.param1.indexOf(',') > -1 || req.params.param1.indexOf(';') > -1) {
					getIdList(dbModel, member, req, res, next, cb)
				} else {
					getOne(dbModel, member, req, res, next, cb)
				}

			} else {
				getList(dbModel, member, req, res, next, cb)
			}
			break
		case 'POST':
			if(req.params.param1 == 'copy') {
				copy(dbModel, member, req, res, next, cb)
			} else {
				post(dbModel, member, req, res, next, cb)
			}

			break
		case 'PUT':
			put(dbModel, member, req, res, next, cb)
			break
		case 'DELETE':
			deleteItem(dbModel, member, req, res, next, cb)
			break
		default:
			restError.method(req, next)
			break
	}

}

function copy(dbModel, member, req, res, next, cb) {
	let id = req.params.param2 || req.body['id'] || req.query.id || ''
	let newName = req.body['newName'] || req.body['name'] || ''

	if(id == '')
		error.param2(req, next)

	dbModel.orders.findOne({ _id: id }, (err, doc) => {
		if(dberr(err, next)) {
			if(dbnull(doc, next)) {
				let data = doc.toJSON()
				data._id = undefined
				delete data._id
				if(newName != '') {
					data.name = newName
				} else {
					data.name += ' copy'
				}
				data.createdDate = new Date()
				data.modifiedDate = new Date()

				let newDoc = new dbModel.orders(data)
				if(!epValidateSync(newDoc, next))
					return
				newDoc.save((err, newDoc2) => {
					if(dberr(err, next)) {
						let obj = newDoc2.toJSON()
						obj['newName'] = newDoc2.name
						cb(obj)
					}
				})
			}
		}
	})
}

function getList(dbModel, member, req, res, next, cb) {
	let options = {
		page: (req.query.page || 1)

	}

	if((req.query.pageSize || req.query.limit))
		options['limit'] = req.query.pageSize || req.query.limit

	let filter = {
		customerCode:member.db.integrationCode
	}
	options.sort = {
		'name': 1
	}

	if((req.query.thisIsSet || '') != '')
		filter['thisIsSet'] = req.query.thisIsSet


	if((req.query.passive || '') != '')
		filter['passive'] = req.query.passive


	if((req.query.name || '') != '')
		filter['name'] = { $regex: '.*' + req.query.name + '.*', $options: 'i' }

	if((req.query.description || '') != '')
		filter['description'] = { $regex: '.*' + req.query.description + '.*', $options: 'i' }

	if((req.query.search || '').trim() != '') {
		filter['$or'] = [
			{ 'name': { $regex: '.*' + req.query.search + '.*', $options: 'i' } },
			{ 'description': { $regex: '.*' + req.query.search + '.*', $options: 'i' } }
		]
	}

	dbModel.orders.paginate(filter, options, (err, resp) => {
		if(dberr(err, next)) {
			cb(resp)
		}
	})
}

function getIdList(dbModel, member, req, res, next, cb) {
	let filter = {
		customerCode:member.db.integrationCode
	}
	let idList = req.params.param1.replaceAll(';', ',').split(',')

	filter['_id'] = { $in: idList }

	dbModel.orders.find(filter, (err, docs) => {
		if(dberr(err, next)) {
			cb(docs)
		}
	})
}


function getOne(dbModel, member, req, res, next, cb) {
	let populate = []
	dbModel.orders.findOne({ _id: req.params.param1 }).populate(populate).exec((err, doc) => {
		if(dberr(err, next)) {
			if(dbnull(doc, next)) {
				cb(doc)
			}
		}
	})
}

function post(dbModel, member, req, res, next, cb) {
	let data = req.body || {}
	data._id = undefined

	let newDoc = new dbModel.orders(data)
	newDoc.customerCode=member.db.integrationCode
	if(!epValidateSync(newDoc, next))
		return
	newDoc.save((err, newDoc2) => {
		if(dberr(err, next)) {
			cb(newDoc2)
		}
	})
}

function put(dbModel, member, req, res, next, cb) {
	if(req.params.param1 == undefined)
		return error.param1(req, next)
	let data = req.body || {}
	data._id = req.params.param1
	data.modifiedDate = new Date()

	dbModel.orders.findOne({ _id: data._id, customerCode:member.db.integrationCode }, (err, doc) => {
		if(dberr(err, next)) {
			if(dbnull(doc, next)) {
				let doc2 = Object.assign(doc, data)
				let newDoc = new dbModel.orders(doc2)
				if(!epValidateSync(newDoc, next))
					return

				newDoc.save((err, newDoc2) => {
					if(dberr(err, next)) {
						cb(newDoc2)
					}
				})
			}
		}
	})
}

function deleteItem(dbModel, member, req, res, next, cb) {
	if(req.params.param1 == undefined)
		return error.param1(req, next)
	let data = req.body || {}
	data._id = req.params.param1
	dbModel.orders.removeOne(member, { _id: data._id, customerCode:member.db.integrationCode }, (err, doc) => {
		if(dberr(err, next)) {
			cb(null)
		}
	})
}