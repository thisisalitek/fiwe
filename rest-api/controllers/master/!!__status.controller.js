module.exports = (member, req, res, next, cb)=>{
	restServices.eDespatch.get(null,'/',{},(err,data)=>{
		if(dberr(err,next)){
			cb({
				workingMode: config.status,
				eDespatchService:'working',
				repostoryCount:Object.keys(repoDb).length
			})
		}
	})
}


