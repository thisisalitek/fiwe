module.exports = (socket) => {
	socket.lastPong=new Date()
	socket.emit('pong')
	eventLog(`pong:`,socket.id)
}
