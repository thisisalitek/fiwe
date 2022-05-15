module.exports = function(req, res, next, cb) {
	if(req.method == 'POST') {
		// let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

		let username = req.body.username || req.query.username || ''
		let authCode = req.body.authCode || req.query.authCode || ''
		authCode = authCode.replaceAll(' ', '')
		
		if(username.trim() == '')
			return next({ code: 'USERNAME_EMPTY', message: 'Telefon numarasi veya email bos olamaz.' })

		db.members.findOne({ username: username }, function(err, doc) {
			if(dberr(err, next))
				if(dbnull(doc, next)) {
					if(doc.authCode == authCode) {
						doc.verified = true
						spamCheck(doc, next, (doc) => {
							doc.save((err, newDoc) => {
								if(dberr(err, next)) {
									let userInfo = {
										_id: doc._id,
										username: doc.username,
										role: doc.role
									}

									let token=auth.sign(userInfo)

									cb({ username: doc.username, role: doc.role, token: token })
								}
							})
						})
					} else {
						
						return next({ code: 'AUTH_CODE_ERROR', message: 'Incorrect auth code' })
					}
				}
		})

	} else {
		restError.method(req, next)
	}
}