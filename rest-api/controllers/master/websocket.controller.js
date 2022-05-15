module.exports = (member,  req, res, next, cb) => {
	switch (req.method) {
		case 'GET':
			getWebSocketInfo(next, cb)
			break
		default:
			restError.method(req, next)
			break
	}
}


function getWebSocketInfo(next, cb) {
	if(!global.socketClients)
		return next({code:'SERVICE_ERROR',message:'Websocket API service is not working'})
	let obj={
		totalConnected:0,
		clients:{}
	}
	let dizi=Object.keys(global.socketClients)
	obj.totalConnected=dizi.length
	dizi.forEach((key)=>{
		obj.clients[key]={
			userId:global.socketClients[key].userId,
			ip:global.socketClients[key].ipAddress,
			startTime:global.socketClients[key].startTime,
			lastPong:global.socketClients[key].lastPong,
		}
		
	})
	
	cb(obj)
}

