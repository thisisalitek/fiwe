exports.getOne = (dbId, memberId) => new Promise((resolve, reject) => {
	let filter = { deleted: false }
	filter._id = dbId
	if(memberId) {
		filter.owner = memberId
	}
	db.dbDefines.findOne(filter)
		.then(doc => {
			if(dbnull(doc, reject)) {
				resolve(doc)
			}
		})
})

exports.newUserDb = (member, dbName) => new Promise((resolve, reject) => {
	if(!dbName)
		dbName = `DB ${member.username.split('@')[0]}`
	let userDbSyntax = config.mongodb.newUserDbSyntax || 'fx${_id}'
	db.dbDefines.findOne({ dbName: dbName, deleted: false, owner: member._id })
		.then(foundDoc => {
			if(foundDoc != null) {
				reject({ code: `DB_ALREADY_EXISTS`, message: `Database '${dbName}' already exist.` })
			} else {
				let dbDefinesId = new ObjectId()
				let newDoc = new db.dbDefines({
					_id: dbDefinesId,
					owner: member._id,
					dbName: dbName,
					userDb: htmlEval(userDbSyntax, { _id: dbDefinesId, username: member.username, role: member.role }),
					userDbHost: userMongoServerAddress(),
				})
				newDoc.save()
					.then(resolve)
					.catch(reject)
			}

		})

})

function userMongoServerAddress() {
	if((config.mongodb.server3 || '') != '') {
		return config.mongodb.server3
	} else if((config.mongodb.server2 || '') != '') {
		return config.mongodb.server2
	} else if((config.mongodb.server1 || '') != '') {
		return config.mongodb.server1
	} else {
		return config.mongodb.master || ''
	}
}

exports.editUserDb = (dbId) => new Promise((resolve, reject) => {


})



function deleteItem(member, req) {
	return new Promise((resolve, reject) => {
		if(req.params.param1 == undefined)
			error.param1(req)

		let data = req.body || {}
		data._id = req.params.param1

		db.dbDefines.findOne({ _id: data._id, deleted: false })
			.then(doc => {
				if(dbnull(doc, next)) {
					doc.deleted = true
					doc.modifiedDate = new Date()
					doc.save()
						.then(() => resolve({ success: true }))
						.catch(reject)
				}
			})
			.catch(reject)
	})
}