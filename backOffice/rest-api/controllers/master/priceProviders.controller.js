module.exports = (member,  req, res, next, cb) => {
	switch (req.method) {
		case 'GET':
			getProviderList( next, cb)
			break
		case 'POST':
			post(member,  req, res, next, cb)
		break
		default:
			restError.method(req, next)
			break
	}
}

function post(member,  req, res, next, cb){
	if(req.params.param1==undefined)
		return restError.param1(req, next)
	let provider=req.query.provider || req.body.provider || ''
	if(provider=='')
		return next({code:'WRONG_DATA',message:`provider is required`})

	if(!global.priceProviders)
		return next({code:'SERVICE_ERROR',message:'Price provider service is not working'})
	
	if(!global.priceProviders[provider])
		return next({code:'WRONG_DATA',message:`${provider} price provider not found`})

	
	switch(req.params.param1){
		case 'start':
		global.priceProviders[provider].start()
		.then((data)=>{
			cb(data)
		}).catch(next)
		break
		case 'stop':
		global.priceProviders[provider].stop()
		.then((data)=>{
			cb(data)
		}).catch(next)
		break
		case 'restart':
		global.priceProviders[provider].restart()
		.then((data)=>{
			cb(data)
		}).catch(next)
		break
		default:
		return next({code:'WRONG_DATA',message:`param1 must be in 'start','stop','restart'`})
		break
	}
}

function getProviderList(next, cb) {
	if(!global.priceProviders)
		return next({code:'SERVICE_ERROR',message:'Price provider service is not working'})

	let obj={}
	Object.keys(global.priceProviders).forEach((key)=>{
		obj[key]={
			name:key,
			status:global.priceProviders[key].status
		}
	})
	cb(obj)
}

