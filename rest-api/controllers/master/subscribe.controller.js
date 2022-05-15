module.exports = (member, req, res, next, cb) => {
	switch (req.method) {
		case 'GET':
		case 'POST':
			generateToken(member,  req, res, next, cb)
			break

		default:
			restError.method(req, next)
			break
	}

}

function generateToken(member,  req, res, next, cb) {
	let userInfo={
		username: req.query.username || req.body.username || ''
	}

	// qwerty  burayi veri tabanindan veya onayli kullanicilardan olabilir. simdilik bu sekilde test icin yapildi.
	if(userInfo.username=='pesa-test'){
		cb(auth.sign(userInfo))
	}else{
		next({code:'AUTH_ERROR',message:`username required`})
	}
}

