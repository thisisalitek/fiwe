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
			switch (req.params.param1) {
				case 'copy':
					copy(dbModel, member, req).then(resolve).catch(reject)
					break
				case 'uploadTest':
					uploadTest(dbModel, member, req).then(resolve).catch(reject)
					break
				case 'uploadFile':
					uploadFile(dbModel, member, req).then(resolve).catch(reject)
					break
				default:
					post(dbModel, member, req).then(resolve).catch(reject)
					break
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


function uploadFile(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let data = req.body || {}
		if (!data.repositoryId)
			return reject('repositoryId required')
		if (!data.newData)
			return reject('Please upload a file')
		dbModel.workspace.findOne({ _id: data.repositoryId })
			.then(repoDoc => {
				dbModel.importers.findOne({ _id: repoDoc.importer })
					.then(importerDoc => {
						if (dbnull(importerDoc, reject)) {
							switch (importerDoc.type) {
								case 'fileUpload':
									switch (importerDoc.fileUpload.type) {
										case 'excel':
											excelImport(importerDoc, data.newData)
												.then(result => {
													// let newId=new ObjectId()
													let obj = {
														importerType:importerDoc.type,
														fileName:data.newData.fileName,
														sourceType:importerDoc.fileUpload.type,
														contentType:data.newData.type,
														createdDate:new Date(),
														createdBy: member.username,
														data: result
													}
													repoDoc.data.push(obj)
													repoDoc.save()
														.then(() => resolve('OK'))
														.catch(reject)
												})
												.catch(reject)
											break
										default:
											reject(`${importerDoc.type} / ${importerDoc.fileUpload.type} module is not ready yet`)
											break
									}
									break
								default:
									reject(`${importerDoc.type} module is not ready yet`)
									break
							}
						}
					})
					.catch(reject)
			})
			.catch(reject)


	})
}

function uploadTest(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let data = req.body || {}
		data._id = undefined
		if (!data.testFileUpload.data)
			return reject('Please upload a file')
		let newDoc = new dbModel.importers(data)
		if (!epValidateSync(newDoc, reject))
			return
		switch (newDoc.type) {
			case 'fileUpload':
				switch (newDoc.fileUpload.type) {
					case 'excel':
						excelImport(newDoc, data.testFileUpload).then(resolve).catch(reject)
						break
					default:
						reject(`${newDoc.type} / ${newDoc.fileUpload.type} module is not ready yet`)
						break
				}
				break
			default:
				reject(`${newDoc.type} module is not ready yet`)
				break
		}

	})
}



function excelImport(importerDoc, dosya) {

	return new Promise((resolve, reject) => {

		util.saveTempFolderBase64(dosya.fileName, dosya.data)
			.then(tempFileName => {
				let options = {
					sheetName: (s) => s,
					rows: (rows, sheetName) => rows
				}
				if (importerDoc.fileUpload.excel.sheetNameFunc) {
					try {
						options.sheetName = eval(importerDoc.fileUpload.excel.sheetNameFunc)
					} catch (err) {
						return reject(`(fileUpload.excel.sheetNameFunc) ${err.message}`)
					}
				}
				if (importerDoc.fileUpload.excel.rowsFunc) {
					try {
						options.rows = eval(importerDoc.fileUpload.excel.rowsFunc)
					} catch (err) {
						return reject(`(fileUpload.excel.rowsFunc) ${err.message}`)
					}
				}
				excelHelper.convertXlsxToJSON(tempFileName, options)
					.then(resolve)
					.catch(reject)
			})
			.catch(reject)
	})

}

function copy(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let id = req.params.param2 || req.body['id'] || req.query.id || ''
		let newName = req.body['newName'] || req.body['name'] || ''

		if (id == '')
			restError.param2(req, reject)

		dbModel.importers.findOne({ _id: id }).then(doc => {
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

				let newDoc = new dbModel.importers(data)
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

		dbModel.importers.paginate(filter, options).then(resolve).catch(reject)
	})
}

function getIdList(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let filter = {}
		let idList = req.params.param1.replaceAll(';', ',').split(',')

		filter['_id'] = { $in: idList }

		dbModel.importers.find(filter)
			.then(resolve)
			.catch(reject)
	})
}


function getOne(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		dbModel.importers.findOne({ _id: req.params.param1 })
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
		let newDoc = new dbModel.importers(data)
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

		dbModel.importers.findOne({ _id: data._id })
			.then(doc => {
				if (dbnull(doc, reject)) {
					let doc2 = Object.assign(doc, data)
					let newDoc = new dbModel.importers(doc2)
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
		dbModel.importers.removeOne(member, { _id: data._id }).then(resolve).catch(reject)
	})
}