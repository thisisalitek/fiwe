module.exports = (dbModel, member, req, res, next, cb)=>{
	switch(req.method){
		case 'GET':
		if(req.params.param1!=undefined){
			getOne(dbModel, member, req, res, next, cb)
		}else{
			getList(dbModel, member, req, res, next, cb)
		}
		break
		
		default:
		restError.method(req, next)
		break
	}
}

function getList(dbModel, member, req, res, next, cb){
	let options={page: (req.query.page || 1)
	}

	options.sort={_id:-1}
	if((req.query.pageSize || req.query.limit))
		options['limit']=req.query.pageSize || req.query.limit


	let filter = {memberId:member._id,dbId:dbModel._id,createdDate:{$gte:(new Date()).addDays(-90)}}

	if((req.query.isRead || '')!='')
		filter['isRead']=req.query.isRead

	db.notifications.paginate(filter,options,(err, resp)=>{
		if(dberr(err,next)){
			cb(resp)
		}
	})
}

function getOne(dbModel, member, req, res, next, cb){
	let filter={_id:req.params.param1, memberId:member._id, dbId:dbModel._id}
	
	db.notifications.findOne(filter,(err,doc)=>{
		if(dberr(err,next)){
			if(dbnull(doc,next)){
				cb(doc)
			}
		}
	})
}


