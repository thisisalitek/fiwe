module.exports = (req) => new Promise((resolve, reject) => {
	if(req.method == 'GET' || req.method == 'POST') {
		let username = req.body.username || req.query.username || ''

		if(username.trim() == '')
			return reject({ code: 'USERNAME_EMPTY', message: 'Kullanıcı bilgisi(email,username,telefon) boş olamaz.' })

		db.members.findOne({ username: username })
			.then(doc => {
				if(doc != null) {
					spamCheck(doc)
						.then(doc => {
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
							} else {
								doc.save()
								resolve({ _id: doc._id, username: doc.username, passive: doc.passive, verified: doc.verified })
							}
						})
						.catch(reject)
				} else {
					reject({ code: 'USER_NOT_FOUND', message: 'User not found' })
				}
			})
			.catch(reject)
	} else {
		restError.method(req, reject)
	}

})