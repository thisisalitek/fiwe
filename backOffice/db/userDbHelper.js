exports.getOne = (dbId, memberId) => new Promise((resolve, reject) => {
	let filter = { deleted: false }
	filter._id = dbId
	if(memberId) {
		filter.owner = memberId
	}
	db.dbDefines.findOne(filter, function(err, doc) {
		if(dberr(err, reject)) {
			if(dbnull(doc, reject)) {
				resolve(doc)
			}
		}
	})
})

exports.newUserDb = (member, dbName) => new Promise((resolve, reject) => {
	if(!dbName)
		dbName = `DB ${member.username.split('@')[0]}`
	let userDbSyntax = config.mongodb.newUserDbSyntax || 'fx${_id}'
	db.dbDefines.findOne({ dbName: dbName, deleted: false, owner: member._id }, (err, foundDoc) => {
		if(dberr(err, reject))
			if(foundDoc != null) {
				return reject({ code: `DB_ALREADY_EXISTS`, message: `Database '${dbName}' zaten var.` })
			} else {
				let dbDefinesId = new ObjectId()
				let newDoc = new db.dbDefines({
					_id: dbDefinesId,
					owner: member._id,
					dbName: dbName,
					userDb: htmlEval(userDbSyntax, { _id: dbDefinesId, username: member.username, role: member.role }),
					userDbHost: userMongoServerAddress(),
				})
				newDoc.save((err, newDoc2) => {
					if(dberr(err, reject)) {
						resolve(newDoc2)
					}
				})
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



function deleteItem(member, req, res, next, cb) {
	if(req.params.param1 == undefined)
		error.param1(req)

	let data = req.body || {}
	data._id = req.params.param1

	db.dbDefines.findOne({ _id: data._id, deleted: false }, (err, doc) => {
		if(dberr(err, next))
			if(dbnull(doc, next)) {
				doc.deleted = true
				doc.modifiedDate = new Date()
				doc.save(function(err, newDoc2) {
					if(dberr(err, next)) {
						cb({ success: true })
					}
				})
			}
	})
}