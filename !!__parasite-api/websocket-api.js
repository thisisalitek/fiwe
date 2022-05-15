module.exports = function(httpServer) {
	return new Promise((resolve, reject) => {
		if(!httpServer)
			return reject('httpServer not defined')

		let pingInterval=config.websocketApi.pingInterval || 18000

		let moduleHolder = socketModuleLoader(path.join(__dirname,'sockets'),'.socket.js')

		let socketCorsDomainList = config.websocketApi.socketCorsDomainList || []

		global.io = require('socket.io')(httpServer, {
			rejectUnauthorized: false,
			cors: {
				origin: function(origin, callback) {
					return callback(null, true)
					//console.log(`origin:`, origin)
					// if(socketCorsDomainList.includes(origin) || origin.indexOf('http://localhost') > -1) {
					// 	callback(null, true)
					// } else {
					// 	callback(new Error('Hatali domain erisimi'))
					// }
				}
			}
		})

		global.socketClients = {}
		global.socketTotalConnected=0

		io.on('connection', socket => {
			let newUuid=uuid.v4()
			socket.id =newUuid
			socket.userId =`qwerty${util.randomNumber(1500,94545)}`
			socket.ipAddress =socket.conn.remoteAddress
			socket.startTime=new Date()
			socket.lastPong=new Date()
			socket.ping=()=>{
				setInterval(()=>{
					let fark=(new Date()).getTime() - socket.lastPong.getTime()

					socket.emit('ping')
				},pingInterval)
			}
			socketClients[newUuid]=socket
			
			socket.ping()

  		
			
			global.socketTotalConnected++
			logTotalClients()

			setInterval(() => {
				if(socket) {
					let t = new Date()
					socket.emit('time', {
						utcNow: t.toISOString().replace('Z', '+00:00'),
						time: t.getTime(),
						server: t.yyyymmddhhmmss(),
						timeOffset: t.getTimezoneOffset() * -1
					})
				}
			}, 1000)

			socket.on('disconnect', () => {
				socketClients[socket.id]=undefined
				delete socketClients[socket.id]
				global.socketTotalConnected--
				logTotalClients()
			})
			Object.keys(moduleHolder).forEach((key) => {
				socket.on(key, (...placeholders) => {
					try{
						console.log(`socket.id:`,socket.id)
						moduleHolder[key](socket,...placeholders)
					}catch(err){
						errorLog('[WebsocketAPI]'.cyan,key.green,err.name,err.message)
					}
				})
			})
		})

		eventLog(`[WebsocketAPI]`.cyan,'started')
		resolve()
	})
}




function socketModuleLoader(folder, suffix) {
	let holder = {}
	try {

		let files = fs.readdirSync(folder)
		files.forEach((e) => {
			let f = path.join(folder, e)
			if(!fs.statSync(f).isDirectory()) {
				let fileName = path.basename(f)
				let apiName = fileName.substr(0, fileName.length - suffix.length)
				if(apiName != '' && (apiName + suffix) == fileName) {
					holder[apiName] = require(f)
				}
			}
		})

	} catch (err) {
		errorLog(`[WebsocketAPI]`.cyan, 'socketModuleLoader'.green, err)
		process.exit(1)
	}
	return holder
}

function logTotalClients() {
	eventLog(`Total connected socket clients:`, socketTotalConnected)
}