module.exports = (req, res, next, cb) => {
	if(req.method == 'POST') {
		let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

		let formdata = {
			username: req.body.username || '',
			password: req.body.password || ''

		}
		
		if(formdata.username.trim() == '')
			return next({ code: 'USERNAME_EMPTY', message: 'Telefon numarasi veya email bos olamaz.' })

		db.members.findOne({ username: formdata.username }, (err, doc) => {
			if(dberr(err, next)) {
				if(doc != null) {
					if(doc.verified)
						return next({ code: 'USER_EXISTS', message: 'Kullanici zaten kayitli.' })

					doc.authCode = util.randomNumber(1200, 9980).toString()
					spamCheck(doc, next, (doc) => {
						doc.save()
						sender.sendAuthCode(doc.username, doc.authCode, next, cb)
					})
				} else {
					signup(formdata, next, (data) => {
						cb(data)
					})
				}
			}
		})
	} else {
		restError.method(req, next)
	}
}


function signup(formdata, next, cb) {
	let authCode = util.randomNumber(1200, 9980).toString()
	if(!(util.validEmail(formdata.username) || util.validTelephone(formdata.username))) {
		return next({ code: 'USERNAME_WRONG', message: 'Kullanici adi hatali. Email veya Telefon numarasi kullaniniz.' })
	}
	let newmember = new db.members({
		username: formdata.username,
		password: formdata.password,
		authCode: authCode
	})

	newmember.save((err, newDoc) => {
		if(dberr(err, next)) {
			sender.sendAuthCode(newDoc.username, newDoc.authCode, next, cb)

		}
	})

}