module.exports = (member,  req, res, next, cb) => {
	switch (req.method) {
		case 'GET':
			cb(getTime())
			break

		default:
			restError.method(req, next)
			break
	}

}


function getTime(){
	let t=new Date()
	return {
		utcNow: t.toISOString().replace('Z', '+00:00'),
		time:t.getTime(),
		server:t.yyyymmddhhmmss(),
		timeOffset:t.getTimezoneOffset() * -1,
	}
}