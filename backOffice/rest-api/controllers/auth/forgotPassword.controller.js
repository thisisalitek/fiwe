module.exports = (req) => new Promise((resolve, reject) => {
	if(req.method == 'POST' || req.method == 'PUT') {
		let formdata = {
			username: req.body.username || req.query.username || ''
		}
		if(formdata.username.trim() == "")
			return reject({ code: 'USERNAME_EMPTY', message: 'Telefon numarasi veya email bos olamaz.' })

		db.members.findOne({ username: formdata.username })
			.then(doc => {
				if(dbnull(doc, reject)) {
					if(doc.verified == false)
						return reject({ code: 'USER_NOT_VERIFIED', message: 'Kullanici onay kodu girilmemis. Uye olunuz.' })

					spamCheck(doc)
						.then(doc => {
							let userInfo = {
								_id: doc._id,
								username: doc.username
							}

							let resetPassCode = auth.sign(userInfo, 1 * 60 * 60)
							doc.save()
							sender.sendForgotPassword(doc.username, doc.password, resetPassCode)
								.then(resolve)
								.catch(reject)
						})
						.catch(reject)
				}
			})
	} else {
		restError.method(req, reject)
	}
})