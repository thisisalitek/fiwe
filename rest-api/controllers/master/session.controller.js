module.exports = (member,  req, res, next, cb) => {
	switch (req.method) {
		case 'PUT':
		case 'POST':
			if(req.params.param1 == undefined) {
				newSession(member, req, res, next, cb)
			} else if(req.params.param1.toLowerCase() == 'changedb') {
				changeDb(member, req, res, next, cb)
			} else {
				error.param1(req, next)
			}
			break

		default:
			restError.method(req, next)
			break
	}
}


function newSession(member, req, res, next, cb) {
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
	db.sessions.find({ memberId: member._id }).sort({ _id: -1 }).limit(1).exec((err, sonGiris) => {
		if(dberr(err, next)) {
			if(sonGiris.length > 0)
				lastLoginDbId = sonGiris[0].dbId

			db.dbDefines.find({ deleted: false, passive: false }, (err, databases) => {
				let dbObj = null
				if(!err) {
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
				}

				newSession.save((err, newSession2) => {
					if(dberr(err, next)) {
						let sessionData = newSession2.toJSON()
						sessionData.version = portalConstants.version
						sessionData.staticValues = portalConstants.staticValues
						sessionData.pages = {}

						sessionData.widgets = portalConstants.widgets
						sessionData.javascripts = portalConstants.javascripts
						sessionData.databases = databases || []
						sessionData.menu = {}
						sessionData.settings = {}
						sessionData.sessionId=newSession2._id

						if(member.role == 'user') {
							sessionData.menu = portalConstants.clientMenu
							sessionData.pages = portalConstants.clientPages
						} else if(member.role == 'admin') {
							sessionData.menu = portalConstants.adminMenu
							sessionData.pages = portalConstants.adminPages
						}
						cb(sessionData)

					}
				})
			})

		}
	})

}

function checkIsThereAnyMemberDb(member){
	let syntax=config.mongodb.newUserDbSyntax || 'fx${_id}'
	return new Promise((resolve, reject) => {
		db.dbDefines.findOne({owner:member._id,deleted:false},(err,doc)=>{
			if(dberr(err,reject)){
				if(doc==null){
					let dbDefinesId=new ObjectId()
					let newDoc=db.dbDefines({
						_id:dbDefinesId,
						owner:member._id,
						dbName:`DB ${member.username.split('@')[0]}`,
						userDb:htmlEval(syntax,{_id:dbDefinesId,username:member.username,role:member.role}),
						userDbHost:
					})
						
				}else{
					resolve(doc)
				}
				
			}
		})
	})
}

function changeDb(member, req, res, next, cb) {
	let dbId = (req.body || {}).db || (req.query || {}).db || ''
	let sessionId = (req.body || {}).sid || (req.query || {}).sid || ''

	if(dbId == '')
		return next({ code: 'WRONG_PARAMETER', message: 'db parametresi gereklidir' })

	if(sessionId == '')
		return next({ code: 'WRONG_PARAMETER', message: 'sid parametresi gereklidir' })
	db.sessions.findOne({ memberId: member._id, _id: sessionId }, (err, sessionDoc) => {
		if(dberr(err, next)) {
			if(sessionDoc == null)
				return next({ code: 'SESSION_NOT_FOUND', message: 'Oturum sonlandırılmış. Tekrar giriş yapınız.' })
			db.dbDefines.find({ deleted: false, passive: false }, (err, databases) => {
				if(!err) {
					let dbObj = databases.find(e => e._id == dbId)
					if(!dbObj)
						return next({ code: 'DATABASE_NOT_FOUND', message: `${dbId} Veri ambarı bulunamadı` })
					sessionDoc.dbId = dbObj._id
					sessionDoc.dbName = dbObj.dbName

					sessionDoc.lastOnline = new Date()

					sessionDoc.save((err, sessionDoc2) => {
						if(dberr(err, next)) {
							let sessionData = sessionDoc2.toJSON()
							sessionData.version = portalConstants.version
							sessionData.staticValues = portalConstants.staticValues
							sessionData.pages = {}

							sessionData.widgets = portalConstants.widgets
							sessionData.javascripts = portalConstants.javascripts
							sessionData.databases = databases || []
							sessionData.menu = {}
							sessionData.settings = {}
							sessionData.sessionId=sessionDoc2._id
							
							if(member.role == 'user') {
								sessionData.menu = portalConstants.clientMenu
								sessionData.pages = portalConstants.clientPages
							} else if(member.role == 'admin') {
								sessionData.menu = portalConstants.adminMenu
								sessionData.pages = portalConstants.adminPages
							}
							cb(sessionData)
						}
					})
				} else {
					next(err)
				}
			})
		}
	})
}