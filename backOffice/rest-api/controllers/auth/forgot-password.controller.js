module.exports = (req, res, next, cb) => {
	if(req.method == 'POST' || req.method == 'PUT') {
		var formdata = {
			username: req.body.username || req.query.username || ''
		}
		if(formdata.username.trim() == "")
			return next({ code: 'USERNAME_EMPTY', message: 'Telefon numarasi veya email bos olamaz.' })

		db.members.findOne({ username: formdata.username }, function(err, doc) {
			if(dberr(err, next))
				if(dbnull(doc, next)) {
					if(doc.verified == false)
						return next({ code: 'USER_NOT_VERIFIED', message: 'Kullanici onay kodu girilmemis. Uye olunuz.' })
					spamCheck(doc, next, (doc) => {
						let userInfo = {
							_id: doc._id,
							username: doc.username
						}

						let resetPassCode= auth.sign(userInfo,1*60*60)
							doc.save()
							sender.sendForgotPassword(doc.username, doc.password, resetPassCode, next, cb)
						
					})
				}
		})
	} else {
		restError.method(req, next)
	}
}