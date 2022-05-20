var ctlPassport = require('./passport.controller.js')

module.exports = (req, res, next, cb) => {
	switch (req.method) {
		case 'POST':
		case 'PUT':
			changePassword(req, res, next, cb)
			break
		default:
			restError.method(req, next)
			break
	}
}

function changePassword(req, res, next, cb) {
	passport(req, res, next, (member) => {
		db.members.findOne({ _id: member._id }, (err, doc) => {
			if(dberr(err, next)) {
				if(dbnull(doc, next)) {
					let data = req.body || {}

					var oldPassword = data.oldPassword || ''
					var newPassword = data.newPassword || data.password || ''
					var rePassword = data.rePassword || ''
					if(newPassword.trim() == '')
						return next({ code: 'REQUIRE_FIELD', message: 'Yeni parola gereklidir.' })
					if(oldPassword != doc.password)
						return next({ code: 'PASSWORD_WRONG', message: 'Eski parola hatali.' })
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
}

function passport(req, res, next, cb) {
	let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['token'] || ''

	db.sessions.findOne({ token: token, passive: false }, (err, doc) => {

		if(!err && doc) {
			cb({ _id: doc.memberId, username: doc.username, role: doc.role })
		} else {
			ctlPassport(null, req, res, next, cb)
		}
	})
}