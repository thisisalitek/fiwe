module.exports = function(req, res, next, cb) {
	if(req.method == 'GET' || req.method == 'POST') {
		var username = req.body.username || req.query.username || ''

		if(username.trim() == '')
			return next({ code: 'USERNAME_EMPTY', message: 'Kullanıcı bilgisi(email,username,telefon) boş olamaz.' })

		db.members.findOne({ username: username }, (err, doc) => {
			if(dberr(err, next)) {
				if(doc != null) {
					spamCheck(doc, next, (doc) => {
						if(!doc.verified) {
							doc.authCode = util.randomNumber(1200, 9980).toString()
							spamCheck(doc, next, (doc) => {
								doc.save()
								sender.sendAuthCode(doc.username, doc.authCode, next, () => {
									return next({ code: 'USER_NOT_VERIFIED', message: 'User is not verified. New Auth Code has been sent. Check your sms or email.' })
								})
							})

						} else {
							doc.save()
							cb({ _id: doc._id, username: doc.username, passive: doc.passive, verified: doc.verified })
						}
					})
				} else {
					next({ code: 'USER_NOT_FOUND', message: 'User not found' })
				}
			}
		})
	} else {
		restError.method(req, next)
	}

}