module.exports=function(dbModel){
	let collectionName=path.basename(__filename,'.collection.js')
	let schema = mongoose.Schema({
		taskType: {type: String, index:true, required: true, enum:['connector_transfer_zreport','send_email','send_sms',
		'connector_import_einvoice','connector_export_einvoice','connector_import_eledger','einvoice_send_to_gib',
		'einvoice_approve','einvoice_decline','edespatch_send_to_gib','edespatch_send_receipt_advice']},
		collectionName:{type: String, default:'', index:true},
		documentId: {type: mongoose.Schema.Types.ObjectId, default: null, index:true},
		document:{type: Object, default:null},
		startDate: { type: Date,default: Date.now, index:true},
		endDate:{ type: Date,default: Date.now, index:true},
		status:{type: String, required: true, default:'pending', enum:['running','pending','completed','cancelled','error'], index:true},
		attemptCount:{type:Number,default:1, index:true},
		error:[]
	})

	schema.pre('save', (next)=>next())
	schema.pre('remove', (next)=>next())
	schema.pre('remove', true, (next, done)=>next())
	schema.on('init', (model)=>{})
	schema.plugin(mongoosePaginate)
	schema.plugin(mongooseAggregatePaginate)

	let model=dbModel.conn.model(collectionName, schema)
	model.removeOne=(member, filter,cb)=>{ sendToTrash(dbModel,collectionName,member,filter,cb) }

	return model
}
