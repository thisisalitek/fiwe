module.exports = (member, req) => new Promise((resolve, reject) => {
	switch (req.method) {
		case 'PUT':
		case 'POST':
			if(req.params.param1 == undefined) {
				newSession(member, req).then(resolve).catch(reject)
			} else if(req.params.param1.toLowerCase() == 'changedb') {
				changeDb(member, req).then(resolve).catch(reject)
			} else {
				restError.param1(req, reject)
			}
			break

		default:
			restError.method(req, reject)
			break
	}
})


function newSession(member, req) {
	return new Promise((resolve, reject) => {
		checkIsThereAnyMemberDb(member)
			.then(() => {
				let newSession = db.sessions({
					memberId: member._id,
					username: member.username,
					role: member.role,
					userAgent: req.headers['user-agent'] || '',
					ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || '',
					token: (req.body || {}).token || (req.query || {}).token || (req.headers || {})['x-access-token'] || (req.headers || {})['token'] || '',
					dbId: (req.body || {}).db || (req.query || {}).db || '',
					dbName: '',
					mId: ''
				})

				let lastLoginDbId = ''
				db.sessions.find({ memberId: member._id, passive: false }).sort({ _id: -1 }).limit(1).exec().then(sonGiris => {
						if(sonGiris.length > 0)
							lastLoginDbId = sonGiris[0].dbId

						db.dbDefines.find({ deleted: false, passive: false })
							.then(databases => {
								let dbObj = null

								if(lastLoginDbId != '') {
									databases.forEach((e) => {
										if(e._id == lastLoginDbId) {
											dbObj = e
											return
										}
									})
								}
								if(!dbObj && databases.length > 0)
									dbObj = databases[databases.length - 1]

								if(dbObj) {
									newSession.dbId = dbObj._id
									newSession.dbName = dbObj.dbName
								}


								newSession.save()
									.then(newSession2 => {

										let sessionData = newSession2.toJSON()
										sessionData.version = portalConstants.version
										sessionData.staticValues = portalConstants.staticValues
										sessionData.pages = {}

										sessionData.widgets = portalConstants.widgets
										sessionData.javascripts = portalConstants.javascripts
										sessionData.databases = {}

										databases.forEach((e) => {
											sessionData.databases[e._id.toString()] = e
										})

										sessionData.menu = {}
										sessionData.settings = {}
										sessionData.sessionId = newSession2._id

										if(member.role == 'user') {
											sessionData.menu = portalConstants.clientMenu
											sessionData.pages = portalConstants.pages
										} else if(member.role == 'admin') {
											sessionData.menu = portalConstants.adminMenu
											sessionData.pages = portalConstants.pages
										}
										resolve(sessionData)


									})
									.catch(reject)
							})
							.catch(reject)
					})
					.catch(reject)
			})
			.catch(reject)
	})
}

function checkIsThereAnyMemberDb(member) {
	let syntax = config.mongodb.newUserDbSyntax || 'fx${_id}'
	return new Promise((resolve, reject) => {
		db.dbDefines.findOne({ owner: member._id, deleted: false }).then(doc => {
				if(doc == null) {
					userDbHelper.newUserDb(member)
						.then(resolve)
						.catch(reject)

				} else {
					resolve(doc)
				}

			})
			.catch(reject)
	})
}

function changeDb(member, req) {
	return new Promise((resolve, reject) => {
		let dbId = (req.body || {}).db || (req.query || {}).db || ''
		let sessionId = (req.body || {}).sid || (req.query || {}).sid || ''

		if(dbId == '')
			return reject({ code: 'WRONG_PARAMETER', message: 'db parameter is required' })

		if(sessionId == '')
			return reject({ code: 'WRONG_PARAMETER', message: 'sid parametresi gereklidir' })
		db.sessions.findOne({ memberId: member._id, _id: sessionId }).then(sessionDoc => {
			if(sessionDoc == null)
				return reject({ code: 'SESSION_NOT_FOUND', message: 'The session has been terminated. Please login.' })
			db.dbDefines.find({ deleted: false, passive: false }).then(databases => {

				let dbObj = databases.find(e => e._id == dbId)
				if(!dbObj)
					return reject({ code: 'DATABASE_NOT_FOUND', message: `${dbId} Database was not found` })
				sessionDoc.dbId = dbObj._id
				sessionDoc.dbName = dbObj.dbName

				sessionDoc.lastOnline = new Date()

				sessionDoc.save().then(sessionDoc2 => {
					let sessionData = sessionDoc2.toJSON()
					sessionData.version = portalConstants.version
					sessionData.staticValues = portalConstants.staticValues
					sessionData.pages = {}

					sessionData.widgets = portalConstants.widgets
					sessionData.javascripts = portalConstants.javascripts
					sessionData.databases = databases || []
					sessionData.menu = {}
					sessionData.settings = {}
					sessionData.sessionId = sessionDoc2._id

					if(member.role == 'user') {
						sessionData.menu = portalConstants.clientMenu
						sessionData.pages = portalConstants.clientPages
					} else if(member.role == 'admin') {
						sessionData.menu = portalConstants.adminMenu
						sessionData.pages = portalConstants.adminPages
					}
					resolve(sessionData)
				}).catch(reject)

			}).catch(reject)
		}).catch(reject)
	})
}