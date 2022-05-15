var ctlPassport = require('./passport.controller.js')

module.exports = (req, res, next, cb) => {
	switch (req.method) {
		case 'POST':
			resetPassword(req, res, next, cb)
			break
		default:
			restError.method(req, next)
			break
	}
}

function resetPassword(req, res, next, cb) {
	let resetCode = req.body.resetCode || ''
	auth.verify(resetCode)
		.then(decoded => {
			db.members.findOne({ _id: decoded._id }, (err, doc) => {
				if(dberr(err, next)) {
					if(dbnull(doc, next)) {
						let data = req.body || {}
						var newPassword = data.newPassword || data.password || ''
						var rePassword = data.rePassword || ''
						if(newPassword.trim() == '')
							return next({ code: 'REQUIRE_FIELD', message: 'Yeni parola gereklidir.' })
					
						if(req.body.rePassword != undefined) {
							if(newPassword != rePassword)
								return next({ code: 'REQUIRE_FIELD', message: 'Yeni tekrar parola hatali.' })
						}
						doc.password = newPassword

						doc.modifiedDate = new Date()

						doc.save((err, newDoc) => {
							if(dberr(err, next)) {

								cb('OK')
							}
						})

					}
				}
			})
		})
		.catch(next)

}