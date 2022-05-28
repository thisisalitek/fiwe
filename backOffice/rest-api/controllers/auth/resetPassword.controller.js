var ctlPassport = require('./passport.controller.js')
module.exports = (req) => new Promise((resolve, reject) => {
	switch (req.method) {
		case 'POST':
			resetPassword(req).then(resolve).catch(reject)
			break
		default:
			restError.method(req, reject)
			break
	}
})

function resetPassword(req) {
	return new Promise((resolve, reject) => {
		let resetCode = req.body.resetCode || ''
		auth.verify(resetCode)
			.then(decoded => {
				db.members.findOne({ _id: decoded._id })
					.then(doc => {
						if(dbnull(doc, reject)) {
							let data = req.body || {}
							let newPassword = data.newPassword || data.password || ''
							let rePassword = data.rePassword || ''
							if(newPassword.trim() == '')
								return reject({ code: 'REQUIRE_FIELD', message: 'Yeni parola gereklidir.' })

							if(req.body.rePassword != undefined) {
								if(newPassword != rePassword)
									return reject({ code: 'REQUIRE_FIELD', message: 'Yeni tekrar parola hatali.' })
							}
							doc.password = newPassword

							doc.modifiedDate = new Date()

							doc.save()
								.then(newDoc => resolve('OK'))
								.catch(reject)
						}
					})
					.catch(reject)
			})
			.catch(reject)
	})
}