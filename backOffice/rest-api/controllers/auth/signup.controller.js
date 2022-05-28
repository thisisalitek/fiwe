module.exports = (req) => new Promise((resolve, reject) => {
	if(req.method == 'POST') {
		let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

		let formdata = {
			username: req.body.username || '',
			password: req.body.password || ''

		}

		if(formdata.username.trim() == '')
			return reject({ code: 'USERNAME_EMPTY', message: 'Telefon numarasi veya email bos olamaz.' })

		db.members.findOne({ username: formdata.username })
			.then(doc => {
				if(doc != null) {
					if(doc.verified)
						return reject({ code: 'USER_EXISTS', message: 'Kullanici zaten kayitli.' })

					doc.authCode = util.randomNumber(1200, 9980).toString()
					spamCheck(doc)
						.then(doc => {
							doc.save()
							sender.sendAuthCode(doc.username, doc.authCode)
								.then(resolve)
								.catch(reject)
						})
						.catch(reject)
				} else {
					signup(formdata)
						.then(resolve)
						.catch(reject)
				}
			})
	} else {
		restError.method(req, reject)
	}
})


function signup(formdata) {
	return new Promise((resolve, reject) => {
		let authCode = util.randomNumber(1200, 9980).toString()
		if(!(util.validEmail(formdata.username) || util.validTelephone(formdata.username))) {
			return reject({ code: 'USERNAME_WRONG', message: 'Kullanici adi hatali. Email veya Telefon numarasi kullaniniz.' })
		}
		let newmember = new db.members({
			username: formdata.username,
			password: formdata.password,
			authCode: authCode
		})

		newmember.save()
			.then(newDoc => {
				sender.sendAuthCode(newDoc.username, newDoc.authCode)
					.then(resolve)
					.catch(reject)
			})
			.catch(reject)

	})
}