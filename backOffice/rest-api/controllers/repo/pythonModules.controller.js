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
				case 'run':
					runCode(dbModel, member, req).then(resolve).catch(reject)
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
var cmd = require('node-cmd')
function runCode(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let data = req.body || {}
		data._id = undefined
		if (!data._codeFiles)
			return reject('_codeFiles required')
		if (Object.keys(data[data._codeFiles] || {}).length == 0)
			return reject('_codeFiles is empty')
		let fileList = data[data._codeFiles]
		util.makeTempDir()
			.then(folder => {
				saveFileList(folder,fileList)
				.then(startFile=>{
					if(startFile){
						cmd.run(`python ${startFile}`, function (err, data, stderr) {
							if (stderr != '') {
								resolve(stderr)
							} else {3333
								resolve(data)
							}
						})
					}else{
						reject('Startup file required. Use one of them start.py, main.py, index.py, __init__.py')
					}
				})
			})
			.catch(reject)

	})
}

function saveFileList(folder, fileList) {
	return new Promise((resolve, reject) => {
		let startFile=''
		Object.keys(fileList).forEach(key => {
			let file = fileList[key]
			if (typeof file == 'object') {
				let yeniFolder=path.join(folder, key)
				if (!fs.existsSync(yeniFolder)) {
					fs.mkdirSync(yeniFolder)
				}
				saveFileList(yeniFolder,fileList[key])
				.then(resolve)
				.catch(reject)
			} else {

				let fileName = path.join(folder, key)
				fs.writeFileSync(fileName, file, 'utf8')
				if(['start.py','main.py','index.py','__init__.py'].includes(key)){
					startFile=path.join(folder,key)
				}
			}
		})
		resolve(startFile)
	})
}

function copy(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let id = req.params.param2 || req.body['id'] || req.query.id || ''
		let newName = req.body['newName'] || req.body['name'] || ''

		if (id == '')
			restError.param2(req, reject)

		dbModel.pythonModules.findOne({ _id: id }).then(doc => {
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

				let newDoc = new dbModel.pythonModules(data)
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

		dbModel.pythonModules.paginate(filter, options).then(resolve).catch(reject)
	})
}

function getIdList(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let filter = {}
		let idList = req.params.param1.replaceAll(';', ',').split(',')

		filter['_id'] = { $in: idList }

		dbModel.pythonModules.find(filter)
			.then(resolve)
			.catch(reject)
	})
}


function getOne(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		dbModel.pythonModules.findOne({ _id: req.params.param1 })
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
		let newDoc = new dbModel.pythonModules(data)
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

		dbModel.pythonModules.findOne({ _id: data._id })
			.then(doc => {
				if (dbnull(doc, reject)) {
					let doc2 = Object.assign(doc, data)
					let newDoc = new dbModel.pythonModules(doc2)
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
		dbModel.pythonModules.removeOne(member, { _id: data._id }).then(resolve).catch(reject)
	})
}