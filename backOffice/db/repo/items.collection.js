module.exports=function(dbModel){
	let collectionName=path.basename(__filename,'.collection.js')
	let schema = mongoose.Schema({
		name:{ type: String, trim:true,default:'', unique:true},
		description:{ type: String, trim:true,default:''},
		thisIsSet: {type: Boolean, default: false},
		ubb: {type: String, default: ''},
		sut: {type: String, default: ''},
		localDocumentId: {type: String, default: ''},
		createdDate: { type: Date,default: Date.now},
		modifiedDate:{ type: Date,default: Date.now},
		passive: {type: Boolean, default: false}
	})

	schema.pre('save', (next)=>next())
	schema.pre('remove', (next)=>next())
	schema.pre('remove', true, (next, done)=>next())
	schema.on('init', (model)=>{})
	schema.plugin(mongoosePaginate)
	schema.plugin(mongooseAggregatePaginate)

	schema.index({ "description": 1 })
	schema.index({ "localDocumentId": 1 })
	schema.index({ "createdDate": 1 })

	let model=dbModel.conn.model(collectionName, schema)

	model.removeOne=(member, filter,cb)=>{ sendToTrash(dbModel,collectionName,member,filter,cb) }

	return model
}
