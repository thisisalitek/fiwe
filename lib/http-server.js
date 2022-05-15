module.exports =(port,app)=>new Promise((resolve,reject)=>{
	var http = require('http')
	var server = http.createServer(app)

	server.listen(port)

	server.on('error', (err)=>{
		if (err.syscall !== 'listen') 
			return reject(err)

		reject(err)
		// switch (err.code) {
		// 	case 'EACCES':
		// 	console.error(`Port: ${port} requires elevated privileges`)
			
		// 	break
		// 	case 'EADDRINUSE':
		// 	console.error(`Port: ${port}is already in use`)
			
		// 	break
		// 	default:
		// 	console.error(`http-server.js error:`,err)
			
		// 	break
		// }

	})

	server.on('listening', ()=>{
		eventLog('[httpServer]'.cyan,'listening on port',port)
		resolve(server)
	})

})


