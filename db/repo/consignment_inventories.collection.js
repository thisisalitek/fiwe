module.exports=function(dbModel){
	let collectionName=path.basename(__filename,'.collection.js')
	let schema = mongoose.Schema({
		customerCode:{ type: String, trim:true,default:''},
		setCode:{ type: String, trim:true,default:''},
		setLot:{ type: Number, default:0},
		itemName:{ type: String, trim:true,default:''},
		itemDescription:{ type: String, trim:true,default:''},
		partyNo:{ type: String, trim:true,default:''},
		inputDate: { type: String,default: ''},
		ubb: {type: String, default: ''},
		sut: {type: String, default: ''},
		quantity: {type: Number, default: 0},
		createdDate: { type: Date,default: Date.now},
		modifiedDate:{ type: Date,default: Date.now}
	})

	schema.pre('save', (next)=>next())
	schema.pre('remove', (next)=>next())
	schema.pre('remove', true, (next, done)=>next())
	schema.on('init', (model)=>{})
	schema.plugin(mongoosePaginate)
	schema.plugin(mongooseAggregatePaginate)

	schema.index({ "customerCode": 1 })
	schema.index({ "setCode": 1 })
	schema.index({ "setLot": 1 })
	schema.index({ "itemName": 1 })
	schema.index({ "itemDescription": 1 })
	schema.index({ "partyNo": 1 })
	schema.index({ "inputDate": 1 })
	schema.index({ "ubb": 1 })
	schema.index({ "sut": 1 })
	schema.index({ "quantity": 1 })
	schema.index({ "createdDate": 1 })

	let model=dbModel.conn.model(collectionName, schema)

	model.removeOne=(member, filter,cb)=>{ sendToTrash(dbModel,collectionName,member,filter,cb) }

	return model
}
