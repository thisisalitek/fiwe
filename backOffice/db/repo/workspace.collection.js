module.exports=function(dbModel){
	let collectionName=path.basename(__filename,'.collection.js')
	let schema = mongoose.Schema({
		name:{ type: String, trim:true,required:[true,'name required'], unique:true},
		importer: {type: mongoose.Schema.Types.ObjectId, ref:'importers', mdl:dbModel.importers,  index:true},
		allowSameData: {type: Boolean, default: false, index:true},
		importLogs:[],
		data:[],
		createdDate: { type: Date,default: Date.now, index:true},
		modifiedDate:{ type: Date,default: Date.now}
	}, { versionKey: false })

	schema.pre('save', (next)=>next())
	schema.pre('remove', (next)=>next())
	schema.pre('remove', true, (next, done)=>next())
	schema.on('init', (model)=>{})
	schema.plugin(mongoosePaginate)
	schema.plugin(mongooseAggregatePaginate)


	let model=dbModel.conn.model(collectionName, schema,collectionName)

	model.removeOne=(member, filter)=>sendToTrash(dbModel,collectionName,member,filter)
	
	return model
}