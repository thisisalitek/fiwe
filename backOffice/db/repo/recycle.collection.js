module.exports=function(dbModel){
	let collectionName=path.basename(__filename,'.collection.js')
	let schema = mongoose.Schema({
		collectionName: {type: String, default: '',index:true},
		documentId: {type: mongoose.Schema.Types.ObjectId, default: null, index:true},
		document: {type: Object, default: null},
		deletedBy: {type: String, required: true, default: '', index:true},
		deletedById: {type: mongoose.Schema.Types.ObjectId, default: null, index:true},
		deletedDate: { type: Date,required: true, default: Date.now, index:true}
	})

	schema.pre('save', (next)=>next())
	schema.pre('remove', (next)=>next())
	schema.pre('remove', true, (next, done)=>next())
	schema.on('init', (model)=>{})
	schema.plugin(mongoosePaginate)
	
	let model=dbModel.conn.model(collectionName, schema)
	return model
}