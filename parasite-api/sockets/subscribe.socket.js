module.exports = (socket,apiKey) => {
	if(apiKey=='gobekliTepe'){
		let userInfo={
			userId:socket.userId,
			
		}
		socket.token=auth.sign(userInfo)
		socket.emit('subscribed','Authentication was successful')
	}else{
		// qwerty
		socket.emit('error','apiKey gobekliTepe')
	}
}
