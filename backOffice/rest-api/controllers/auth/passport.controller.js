module.exports = function(req, res, next, cb) {
	let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['token']
	if(token) {
		auth.verify(token)
			.then(decoded => {
				db.members.findOne({ _id: decoded._id }, (err, doc) => {
					if(dberr(err, next)) {
						if(doc == null)
							return next({ code: 'LOGIN_FAILED', message: 'Login failed' })
						if(doc.passive)
							return next({ code: 'USER_PASSIVE', message: 'User has been passive' })
						if(!doc.verified)
							return next({ code: 'USER_NOT_VERIFIED', message: 'User was not verified' })

						spamCheck(doc, next, (doc) => {
							doc.save((err, doc2) => {
								if(dberr(err, next)) {
									let obj = doc2.toJSON()
									obj.token = token
									cb(obj)
								}
							})
						})
					}
				})
			})
			.catch(next)

	} else {
		restError.auth(req, next)
	}
}