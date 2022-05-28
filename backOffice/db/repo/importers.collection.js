module.exports=function(dbModel){
	let collectionName=path.basename(__filename,'.collection.js')
	let schema = mongoose.Schema({
		name:{ type: String, trim:true,default:'',required:[true,'name required'], unique:true},
		type: {type: String, required: [true,'Importer Type required'],
			enum:['fileUpload','fileSystem','mongoDb','msSql','mySql','postgreSQL','wcf','restApi']
			, index:true},
		fileUpload:{
			type:{type :String, default: ''},
			csv:{
				separator:{type :String, default: ';'},
				decimalPointer:{type :String, default: ','},
				dateFormat:{type :String, default: 'dd/mm/yyyy'},
				timeFormat:{type :String, default: 'hh:mm:ss'}
			},
			excel:{
				sheetNameFunc:{type :String, default: ''},
				rowsFunc:{type :String, default: ''}
			}
		},
		fileSystem:{
			path:{type:String,default:''},
			afterImport:{type:String,default:''},
			type:{type :String, default: ''},
			csv:{
				separator:{type :String, default: ';'},
				decimalPointer:{type :String, default: ','},
				dateFormat:{type :String, default: 'dd/mm/yyyy'},
				timeFormat:{type :String, default: 'hh:mm:ss'}
			},
			excel:{
				sheetNameFunc:{type :String, default: ''},
				rowsFunc:{type :String, default: ''}
			}
		},
		mongoDb:{
			uri:{type:String,default:''},
			script:{type:String,default:''}
		},
		sqlServer:{
			connectionType:{type :String, default: ''},
			connectionString:{type :String, default: ''},
			configObject:{type :Object, default: null},
			query:{type:String,default:''}
		},
		mySql:{
			configObject:{type :Object, default: null},
			query:{type:String,default:''}
		},
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
