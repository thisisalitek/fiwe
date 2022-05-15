module.exports = (dbModel, member, req, res, next, cb) => {
	if(req.method != 'GET' && member.role != 'admin')
		return error.auth(req, next)

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
			// if(req.params.param1 == 'copy') {
			// 	copy(dbModel, member, req, res, next, cb)
			// } else {
			post(dbModel, member, req, res, next, cb)
			// }

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

function getList(dbModel, member, req, res, next, cb) {
	let options = {
		page: (req.query.page || 1)

	}

	if((req.query.pageSize || req.query.limit))
		options['limit'] = req.query.pageSize || req.query.limit

	let filter = {
		customerCode:member.db.integrationCode || 'xxxxxxxxxxxxxxxxxxxxxx11125'
	}
	options.sort = {
		'setCode': 1,
		'setLot': 1,
		'itemName': 1
	}


	if((req.query.setCode || '') != '')
		filter['setCode'] = { $regex: '.*' + req.query.setCode + '.*', $options: 'i' }

	if((req.query.setLot || '') != '')
		filter['setLot'] = req.query.setLot

	if((req.query.setLot || '') != '')
		filter['setLot'] = req.query.setLot

	if((req.query.itemName || '') != '')
		filter['itemName'] = { $regex: '.*' + req.query.itemName + '.*', $options: 'i' }

	if((req.query.itemDescription || '') != '')
		filter['itemDescription'] = { $regex: '.*' + req.query.itemDescription + '.*', $options: 'i' }

	if((req.query.partyNo || '') != '')
		filter['partyNo'] = { $regex: '.*' + req.query.partyNo + '.*', $options: 'i' }

	if((req.query.ubb || '') != '')
		filter['ubb'] = { $regex: '.*' + req.query.ubb + '.*', $options: 'i' }

	if((req.query.sut || '') != '')
		filter['sut'] = { $regex: '.*' + req.query.sut + '.*', $options: 'i' }

	if((req.query.quantity || '') != '')
		filter['quantity'] = req.query.quantity


	dbModel.consignment_inventories.paginate(filter, options, (err, resp) => {
		if(dberr(err, next)) {
			cb(resp)
		}
	})
}

function getIdList(dbModel, member, req, res, next, cb) {
	let filter = {}
	let idList = req.params.param1.replaceAll(';', ',').split(',')

	filter['_id'] = { $in: idList }

	dbModel.consignment_inventories.find(filter, (err, docs) => {
		if(dberr(err, next)) {
			cb(docs)
		}
	})
}


function getOne(dbModel, member, req, res, next, cb) {
	let populate = []
	dbModel.consignment_inventories.findOne({ _id: req.params.param1 }).populate(populate).exec((err, doc) => {
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
	let newDoc = new dbModel.consignment_inventories(data)
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

	dbModel.consignment_inventories.findOne({ _id: data._id }, (err, doc) => {
		if(dberr(err, next)) {
			if(dbnull(doc, next)) {
				let doc2 = Object.assign(doc, data)
				let newDoc = new dbModel.consignment_inventories(doc2)
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
	dbModel.consignment_inventories.removeOne(member, { _id: data._id }, (err, doc) => {
		if(dberr(err, next)) {
			cb(null)
		}
	})
}