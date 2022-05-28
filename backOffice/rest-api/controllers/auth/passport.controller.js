module.exports = (req) => new Promise((resolve, reject) => {
	let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['token']
	if(token) {
		auth.verify(token)
			.then(decoded => {
				db.members.findOne({ _id: decoded._id })
					.then(doc => {
						if(doc == null)
							return reject({ code: 'LOGIN_FAILED', message: 'Login failed' })
						if(doc.passive)
							return reject({ code: 'USER_PASSIVE', message: 'User has been passive' })
						if(!doc.verified)
							return reject({ code: 'USER_NOT_VERIFIED', message: 'User was not verified' })

						spamCheck(doc)
							.then(doc => {
								doc.save()
									.then(doc2 => {
										let obj = doc2.toJSON()
										obj.token = token
										resolve(obj)
									})
									.catch(reject)
							})
							.catch(reject)
					})
					.catch(reject)
			})
			.catch(reject)

	} else {
		restError.auth(req, reject)
	}
})