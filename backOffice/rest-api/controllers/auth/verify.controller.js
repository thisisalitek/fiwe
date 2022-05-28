module.exports = (req) => new Promise((resolve, reject) => {
	if(req.method == 'POST') {
		// let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

		let username = req.body.username || req.query.username || ''
		let authCode = req.body.authCode || req.query.authCode || ''
		authCode = authCode.replaceAll(' ', '')

		if(username.trim() == '')
			return reject({ code: 'USERNAME_EMPTY', message: 'Telefon numarasi veya email bos olamaz.' })

		db.members.findOne({ username: username })
			.then(doc => {
				if(dbnull(doc, reject)) {
					if(doc.authCode == authCode) {
						doc.verified = true
						spamCheck(doc)
							.then(doc => {
								doc.save()
								.then(newDoc => {
										let userInfo = {
											_id: doc._id,
											username: doc.username,
											role: doc.role
										}

										let token = auth.sign(userInfo)

										resolve({ username: doc.username, role: doc.role, token: token })
								})
								.catch(reject)
							})
							.catch(reject)
					} else {
						reject({ code: 'AUTH_CODE_ERROR', message: 'Incorrect auth code' })
					}
				}
			})
			.catch(reject)

	} else {
		restError.method(req, reject)
	}
})