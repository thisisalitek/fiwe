module.exports=function(dbModel){
	let collectionName=path.basename(__filename,'.collection.js')
	let schema = mongoose.Schema({
		projectId: {type: mongoose.Schema.Types.ObjectId, ref:'projects', mdl:dbModel.projects, required:[true,'Project required'], index:true},
		name:{ type: String, trim:true,required:[true,'name required'], unique:true},
		description:{ type: String, trim:true,default:'', index:true},
		createdDate: { type: Date,default: Date.now, index:true},
		modifiedDate:{ type: Date,default: Date.now},
		passive: {type: Boolean, default: false, index:true}
	})

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
