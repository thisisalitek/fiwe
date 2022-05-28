module.exports = (req) => new Promise((resolve, reject) => {
	if(req.method == 'GET' || req.method == 'POST') {

		let username = req.body.username || req.query.username || ''

		if(username.trim() == '')
			return reject({ code: 'USERNAME_EMPTY', message: 'Kullanıcı bilgisi(email,username,telefon) boş olamaz.' })

		memberLogin(req).then(resolve).catch(reject)
	} else {
		restError.method(req, reject)
	}

})

function memberLogin(req) {
	return new Promise((resolve, reject) => {
		let username = req.body.username || req.query.username || ''
		let password = req.body.password || req.query.password || ''
		//let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

		db.members.findOne({ username: username, password: password })
			.then(doc => {
				if(doc == null)
					return reject({ code: 'LOGIN_FAILED', message: 'Login failed' })
				if(doc.passive)
					return reject({ code: 'USER_PASSIVE', message: 'User has been passive' })
				if(!doc.verified) {
					doc.authCode = util.randomNumber(1200, 9980).toString()
					spamCheck(doc)
						.then(doc => {
							doc.save()
							sender.sendAuthCode(doc.username, doc.authCode)
								.then(() => {
									reject({ code: 'USER_NOT_VERIFIED', message: 'User is not verified. New Auth Code has been sent. Check your sms or email.' })
								})
								.catch(reject)
						})
						.catch(reject)

				}

				spamCheck(doc)
					.then(doc => {
						doc.save()
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
	})
}