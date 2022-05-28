var ctlPassport = require('./passport.controller.js')
module.exports = (req) => new Promise((resolve, reject) => {
	switch (req.method) {
		case 'POST':
		case 'PUT':
			changePassword(req).then(resolve).catch(reject)
			break
		default:
			restError.method(req, reject)
			break
	}
})

function changePassword(req) {
	return new Promise((resolve, reject) => {
		passport(req).then(member => {
			db.members.findOne({ _id: member._id })
				.then(doc => {
					if(dbnull(doc, reject)) {
						let data = req.body || {}

						var oldPassword = data.oldPassword || ''
						var newPassword = data.newPassword || data.password || ''
						var rePassword = data.rePassword || ''
						if(newPassword.trim() == '')
							return reject({ code: 'REQUIRE_FIELD', message: 'Yeni parola gereklidir.' })
						if(oldPassword != doc.password)
							return reject({ code: 'PASSWORD_WRONG', message: 'Eski parola hatali.' })
						if(req.body.rePassword != undefined) {
							if(newPassword != rePassword)
								return reject({ code: 'REQUIRE_FIELD', message: 'Yeni tekrar parola hatali.' })
						}
						doc.password = newPassword
						doc.modifiedDate = new Date()

						doc.save().then(() => resolve('OK')).catch(reject)

					}
				})
				.catch(reject)
		})
	})
}

function passport(req) {
	return new Promise((resolve, reject) => {
		let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['token'] || ''

		db.sessions.findOne({ token: token, passive: false })
			.then(doc => {
				if(doc!=null) {
					resolve({ _id: doc.memberId, username: doc.username, role: doc.role })
				} else {
					ctlPassport(null, req).then(resolve).catch(reject)
				}
			})
			.catch(reject)
	})
}