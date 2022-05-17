module.exports = (dbModel, member, req, res, next, cb) => {
	if((member.db.integrationCode || '') == '' && member.role == 'user')
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

	let filter = {}
	if(member.role == 'user') {
		filter.customerCode = member.db.integrationCode
	}
	options.sort = {
		'_id': -1
	}



	if((req.query.orderType || '') != '')
		filter['orderType'] = req.query.orderType


	if((req.query.customerCode || '') != '')
		filter['customerCode'] = { $regex: '.*' + req.query.customerCode + '.*', $options: 'i' }

	if((req.query.customerName || '') != '')
		filter['customerName'] = { $regex: '.*' + req.query.customerName + '.*', $options: 'i' }

	if((req.query.username || '') != '')
		filter['username'] = { $regex: '.*' + req.query.username + '.*', $options: 'i' }

	if((req.query.orderKey || '') != '')
		filter['orderKey'] = { $regex: '.*' + req.query.orderKey + '.*', $options: 'i' }

	if((req.query.localDocumentId || '') != '')
		filter['localDocumentId'] = { $regex: '.*' + req.query.localDocumentId + '.*', $options: 'i' }
	
	if((req.query.date1 || '')!='')
		filter['orderDate']={$gte:req.query.date1}
	

	if((req.query.date2 || '')!=''){
		if(filter['orderDate']){
			filter['orderDate']['$lte']=req.query.date2
		}else{
			filter['orderDate']={$lte:req.query.date2}
		}
	}

	

	dbModel.orders.paginate(filter, options, (err, resp) => {
		if(dberr(err, next)) {
			cb(resp)
		}
	})
}

function getIdList(dbModel, member, req, res, next, cb) {
	let filter = {

	}
	if(member.role == 'user') {
		filter.customerCode = member.db.integrationCode
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
	if(member.role == 'user') {
		newDoc.customerCode = member.db.integrationCode
		newDoc.customerName = member.db.partyName
		newDoc.username = member.username
	}
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
	let filter = { _id: data._id }
	if(member.role == 'user') {
		filter.customerCode = member.db.integrationCode
	}
	dbModel.orders.findOne(filter, (err, doc) => {
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
	let filter = { _id: data._id }
	if(member.role == 'user') {
		filter.customerCode = member.db.integrationCode
	}
	dbModel.orders.removeOne(member, filter, (err, doc) => {
		if(dberr(err, next)) {
			cb(null)
		}
	})
}