module.exports = function(req, res, next, cb) {
	if(req.method == 'GET' || req.method == 'POST') {

		let username = req.body.username || req.query.username || ''

		if(username.trim() == '')
			return next({ code: 'USERNAME_EMPTY', message: 'Kullanıcı bilgisi(email,username,telefon) boş olamaz.' })

		memberLogin(req, res, next, cb)
	} else {
		restError.method(req, next)
	}

}

function memberLogin(req, res, next, cb) {
	let username = req.body.username || req.query.username || ''
	let password = req.body.password || req.query.password || ''
	//let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

	db.members.findOne({ username: username, password: password }, (err, doc) => {
		if(dberr(err, next)) {

			if(doc == null)
				return next({ code: 'LOGIN_FAILED', message: 'Login failed' })
			if(doc.passive)
				return next({ code: 'USER_PASSIVE', message: 'User has been passive' })
			if(!doc.verified){
				doc.authCode = util.randomNumber(1200, 9980).toString()
					spamCheck(doc, next, (doc) => {
						doc.save()
					sender.sendAuthCode(doc.username, doc.authCode, next, ()=>{
						return next({ code: 'USER_NOT_VERIFIED', message: 'User is not verified. New Auth Code has been sent. Check your sms or email.' })
					})
				})
				
			}

			spamCheck(doc, next, (doc) => {
				doc.save()
				let userInfo = {
					_id: doc._id,
					username: doc.username,
					role: doc.role
				}

				let token = auth.sign(userInfo)
				cb({ username: doc.username, role: doc.role, token: token })
			})
		}
	})
}