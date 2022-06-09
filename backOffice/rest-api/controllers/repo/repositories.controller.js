module.exports = (dbModel, member, req) => new Promise((resolve, reject) => {
	switch (req.method) {
		case 'GET':
			if (req.params.param1 != undefined) {
				if (req.params.param1.indexOf(',') > -1 || req.params.param1.indexOf(';') > -1) {
					getIdList(dbModel, member, req).then(resolve).catch(reject)
				} else {
					getOne(dbModel, member, req).then(resolve).catch(reject)
				}

			} else {
				getList(dbModel, member, req).then(resolve).catch(reject)
			}
			break
		case 'POST':
			if (req.params.param1 == 'copy') {
				copy(dbModel, member, req).then(resolve).catch(reject)
			} else {
				post(dbModel, member, req).then(resolve).catch(reject)
			}

			break
		case 'PUT':
			put(dbModel, member, req).then(resolve).catch(reject)
			break
		case 'DELETE':
			deleteItem(dbModel, member, req).then(resolve).catch(reject)
			break
		default:
			restError.method(req, reject)
			break
	}

})

function copy(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let id = req.params.param2 || req.body['id'] || req.query.id || ''
		let newName = req.body['newName'] || req.body['name'] || ''

		if (id == '')
			restError.param2(req, reject)

		dbModel.repositories.findOne({ _id: id }).then(doc => {
			if (dbnull(doc, reject)) {
				let data = doc.toJSON()
				data._id = undefined
				delete data._id
				if (newName != '') {
					data.name = newName
				} else {
					data.name += ' copy'
				}
				data.createdDate = new Date()
				data.modifiedDate = new Date()

				let newDoc = new dbModel.repositories(data)
				if (!epValidateSync(newDoc, reject))
					return
				newDoc.save()
					.then(newDoc2 => {
						let obj = newDoc2.toJSON()
						obj['newName'] = newDoc2.name
						resolve(obj)
					})
					.catch(reject)
			}
		})
			.catch(reject)
	})
}

function getList(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let options = {
			page: (req.query.page || 1)

		}

		if ((req.query.pageSize || req.query.limit))
			options['limit'] = req.query.pageSize || req.query.limit

		let filter = {}
		options.sort = {
			'name': 1
		}

		if ((req.query.importer || '') != '')
			filter['importer'] = req.query.importer

		if ((req.query.passive || '') != '')
			filter['passive'] = req.query.passive

		if ((req.query.name || '') != '')
			filter['name'] = { $regex: '.*' + req.query.name + '.*', $options: 'i' }

		if ((req.query.description || '') != '')
			filter['description'] = { $regex: '.*' + req.query.description + '.*', $options: 'i' }


		if ((req.query.search || '').trim() != '') {
			filter['$or'] = [
				{ 'name': { $regex: '.*' + req.query.search + '.*', $options: 'i' } },
				{ 'description': { $regex: '.*' + req.query.search + '.*', $options: 'i' } }
			]
		}

		dbModel.repositories.paginate(filter, options).then(resolve).catch(reject)
	})
}

function getIdList(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let filter = {}
		let idList = req.params.param1.replaceAll(';', ',').split(',')

		filter['_id'] = { $in: idList }

		dbModel.repositories.find(filter)
			.then(resolve)
			.catch(reject)
	})
}


function getOne(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		dbModel.repositories.findOne({ _id: req.params.param1 })
			.then(doc => {
				if (dbnull(doc, reject)) {
					resolve(doc)
				}
			})
			.catch(reject)
	})
}

function post(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let data = req.body || {}
		data._id = undefined
		let newDoc = new dbModel.repositories(data)
		if (!epValidateSync(newDoc, reject))
			return
		newDoc.save().then(resolve).catch(reject)
	})
}

function put(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		if (req.params.param1 == undefined)
			return restError.param1(req, reject)
		let data = req.body || {}
		data._id = req.params.param1
		data.modifiedDate = new Date()

		dbModel.repositories.findOne({ _id: data._id })
			.then(doc => {
				if (dbnull(doc, reject)) {
					let doc2 = Object.assign(doc, data)
					let newDoc = new dbModel.repositories(doc2)

					if (!epValidateSync(newDoc, reject))
						return
					newDoc.save().then(resolve).catch(reject)
				}
			})
			.catch(reject)
	})
}

function deleteItem(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		if (req.params.param1 == undefined)
			return restError.param1(req, next)
		let data = req.body || {}
		data._id = req.params.param1
		dbModel.repositories.removeOne(member, { _id: data._id }).then(resolve).catch(reject)
	})
}