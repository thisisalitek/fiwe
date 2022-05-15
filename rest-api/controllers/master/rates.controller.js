module.exports = (member,  req, res, next, cb) => {
	switch (req.method) {
		case 'GET':
			getLatestRates(next,cb)
			break

		default:
			restError.method(req, next)
			break
	}

}

function getLatestRates(next,cb){
	if(global.latestRates){
		cb(global.latestRates)
	}else{
		next({code:'SERVICE_ERROR',message:'Price provider service is not working'})
	}
}