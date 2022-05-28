module.exports=(doc)=>new Promise((resolve, reject) => { 
	if(doc.suspended){
		if((new Date())<doc.suspended){
			return next( {code:'SUSPENDED',message:`Hesap geçici olarak askıya alınmıştır. ${moment(doc.suspended).fromNow(true)} sonra tekrar kullanabilirsiniz.`})
		}
	}
	doc.lastOnline=new Date()
	if(doc.spamCheck!=moment().format('YYYY-MM-DD HH:mm')){
		doc.spamCheck= moment().format('YYYY-MM-DD HH:mm')
		doc.spamCheckCount=1
	}else{
		doc.spamCheckCount=(doc.spamCheckCount || 0) + 1
	}
	if(doc.spamCheckCount>=120){
		doc.suspended=new Date()
		doc.suspended.setMinutes(doc.suspended.getMinutes()+20)
		doc.suspendedCount=(doc.suspendedCount || 0) + 1
	}
	resolve(doc)
})