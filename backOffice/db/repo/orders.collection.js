module.exports=function(dbModel){
	let collectionName=path.basename(__filename,'.collection.js')
	let schema = mongoose.Schema({
		customerCode:{ type: String, trim:true,default:''},
		customerName:{ type: String, trim:true,default:''},
		username:{ type: String, trim:true,default:''},
		orderNo:{ type: String, trim:true,default:''},
		orderType: {type: String, required: [true,'Sipariş türü gereklidir.'],enum:['normal','from-consignment','additional-consignment']},
		orderKey:{ type: String, trim:true,default:''},
		orderDate: { type: String, default: (new Date()).yyyymmdd(), required:true},
		caseDate: { type: String, default: ''},
		orderLine:[{
			setCode:{ type: String, trim:true,default:''},
			setLot:{ type: Number, default:0},
			itemId: {type: mongoose.Schema.Types.ObjectId, ref:'items', default:null},
			itemName:{ type: String, trim:true,default:''},
			itemDescription:{ type: String, trim:true,default:''},
			partyNo:{ type: String, trim:true,default:''},
			inputDate: { type: String,default: ''},
			ubb: {type: String, default: ''},
			sut: {type: String, default: ''},
			quantity: {type: Number, default: 0},
			// price: {type: Number, default: 0},
			// total: {type: Number, default: 0},
			// taxPercent: {type: Number, default: 0},
			// taxAmount: {type: Number, default: 0},
			// withholdingTaxCode: {type: String, default: ''},
			// withholdingTaxPercent: {type: Number, default: 0},
			// withholdingTaxAmount: {type: Number, default: 0}
		}],
		localDocumentId: {type: String, default: ''},
		createdDate: { type: Date,default: Date.now},
		modifiedDate:{ type: Date,default: Date.now}
	})

	schema.pre('save', (next)=>next())
	schema.pre('remove', (next)=>next())
	schema.pre('remove', true, (next, done)=>next())
	schema.on('init', (model)=>{})
	schema.plugin(mongoosePaginate)
	schema.plugin(mongooseAggregatePaginate)

	schema.index({ "createdDate": 1 })

	let model=dbModel.conn.model(collectionName, schema, collectionName)

	model.removeOne=(member, filter,cb)=>{ sendToTrash(dbModel,collectionName,member,filter,cb) }

	return model
}
