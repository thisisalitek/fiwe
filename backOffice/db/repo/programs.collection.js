module.exports=function(dbModel){
	let collectionName=path.basename(__filename,'.collection.js')
	let schema = mongoose.Schema({
		name: {type: String, required: [true,'Isim gereklidir.']},
		type: {type: String, required: [true,'Program türü gereklidir.'],enum:['collection-process','file-importer','file-exporter','connector-importer','connector-exporter','email','sms']},
		collections:[{
			name:{type :String, default:''},
			filter:{type :String, default:''},
			updateExpression:{type :String, default:''},
			updateErrorExpression:{type :String, default:''}
		}],
		files:[{
			fileName:{type :String, default:''},
			data:{type :String, default:''},
			randerEngine:{type :String, default:'ejs'}
		}],
		fileImporter:{
			accept:{type :String, default: ''}
		},
		fileExporter:{
			fileName:{type :String, default: ''}
		},
		emailSender:{
			host: {type :String, default: ''},
      port: {type :Number, default: 587},
      secure: {type :Boolean, default: false},
      auth: {
          user: {type :String, default: ''},
          pass: {type :String, default: ''}
      },
      from:{type :String, default: ''}
		},
		smsSender:{
			api: {type :String, default: ''},
			method: {type :String, default: 'GET', enum:['','GET','POST','PUT']}
		},
		connector:{
			connectorId: {type: String, default:''},
			connectorPass: {type: String, default:''},
			connectionType: {type: String, enum:['mssql','mysql','file','console','js','bat','bash','wscript','cscript'],default:'js'},
			connection:{
				server: {type :String, default: ''},
				port:{type :Number, default: 0},
				database:{type :String, default: ''},
				username: {type :String, default: ''},
				password: {type :String, default: ''}
			}
		},
		crontab:{type :String, default: ''},	
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

	let model=dbModel.conn.model(collectionName, schema)
	model.removeOne=(member, filter,cb)=>{ sendToTrash(dbModel,collectionName,member,filter,cb) }
	return model
}
