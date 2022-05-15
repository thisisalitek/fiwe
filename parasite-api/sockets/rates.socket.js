module.exports = (socket, currency) => {
	//delete socket.sendRate
	if(socket.token) {
		if(global.latestRates) {
			global.latestRates.cleanParasite(socket.id)
			if(global.latestRates[currency]) {
				global.latestRates[currency].parasites[socket.id]=socket
				global.latestRates[currency].parasites[socket.id].onRates=(rates)=>{
					socket.emit('rates', rates)
				}
			} else {
				socket.emit('error', `${currency} was not found`)
			}

		} else {
			socket.emit('error', 'RatesEngine is not working')
		}
	} else {
		socket.emit('error', 'Authentication failed')
	}
}