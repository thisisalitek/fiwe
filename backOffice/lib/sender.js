let senderTemplates = {
	sendAuthCode: {
		mail: {
			subject: "TR216 Onay Kodu",
			body: "TR216 Onay Kodunuz : <b>${authCode}</b><br><br><small>Kullanıcı: ${username}</small>"
		},
		sms: {
			body: "${authCode} TR216 B2B Onay Kodunuz. Kullanıcı: ${username}   "
		}
	},
	sendForgotPassword: {
		mail: {
			subject: "Parola Sıfırla",
			body: "Parola Sıfırlama Linkiniz : ${base_uri}/login/reset?resetCode=${resetPassCode} <br><br><small>Kullanıcı: ${username}</small>"
		},
		sms: {
			body: "TR216 Sifreniz: ${password}     "
		}
	}
}


if(config.senderTemplates) {
	senderTemplates = Object.assign({}, senderTemplates, config.senderTemplates)
}

exports.sendAuthCode = (username, authCode) => new Promise((resolve, reject) => {
	let data = { username: username, authCode: authCode }
	if(util.validEmail(username)) {
		sendMail(username, htmlEval(senderTemplates.sendAuthCode.mail.subject, data), htmlEval(senderTemplates.sendAuthCode.mail.body, data), reject, resolve)
	} else if(util.validTelephone(username)) {
		sendSms(username, htmlEval(senderTemplates.sendAuthCode.sms.body, data), reject, resolve)
	} else {
		return reject({ code: 'USERNAME_WRONG', message: 'Kullanici adi hatali.' })
	}
})

exports.sendForgotPassword = (username, password, resetPassCode) => new Promise((resolve, reject) => {
	let data = { username: username, password: password, resetPassCode: resetPassCode, base_uri: config.base_uri }
	if(util.validEmail(username)) {
		let subject = htmlEval(senderTemplates.sendForgotPassword.mail.subject, data)
		let body = htmlEval(senderTemplates.sendForgotPassword.mail.body, data)
		sendMail(username, subject, body, reject, resolve)
	} else if(util.validTelephone(username)) {
		sendSms(username, htmlEval(senderTemplates.sendForgotPassword.sms.body, data), reject, resolve)
	} else {
		return reject({ code: 'USERNAME_WRONG', message: 'Kullanici adi hatali.' })
	}
})

function sendSms(phonenumber, message, next, callback) {
	var options = {
		method: config.smsSender.method,
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		},
		rejectUnauthorized: false,
		data: {
			username: config.smsSender.user,
			password: config.smsSender.pass,
			messages: [{
				msg: message,
				dest: phonenumber
			}]
		},
		timeout: 50000
	}

	urllib.request(config.smsSender.url, options, function(error, data, response) {
		if(!error && response.statusCode == 200) {
			if(typeof data == 'string') {
				try {
					var resp = JSON.parse(data)
					return callback(resp)

				} catch (e) {
					if(!e.hasOwnProperty('message')) {
						next({ code: 'TR216PASS_ERROR', message: e.message })
					} else {
						next({ code: 'TR216PASS_ERROR', message: e })
					}
				}
			} else {
				callback(data)
			}

		} else {
			if(error) {
				next(error)
			} else if(data) {
				if(data.error) {
					next(data.error)
				} else {
					if(typeof data == 'string') {
						if(data.indexOf('zinsiz IP') > 0) {
							console.log(`mail.sendErrorMail buraya geldi:`, )
							mail.sendErrorMail('SMS servisinde sikinti', data)
						}
					}
					next(data)
				}
			}
		}
	})
}

function sendMail(email, subject, body, next, callback) {


	mail.sendMail(email, subject, body, (err, data) => {
		if(!err) {
			callback(data)
		} else {

			next(err)
		}
	})
}