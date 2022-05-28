module.exports = function(dbModel) {
	let collectionName = path.basename(__filename, '.collection.js')
	let schema = mongoose.Schema({
		memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'members', default: null, index: true },
		dbId: { type: mongoose.Schema.Types.ObjectId, ref: 'dbdefines', default: null, index: true },
		status: { type: String, default: '', index: true },
		icon: { type: String, default: '' },
		text: { type: String, default: '' },
		createdDate: { type: Date, default: Date.now, index: true },
		isRead: { type: Boolean, default: false, index: true },
		readDate: { type: Date, default: Date.now, index: true }
	}, { versionKey: false })

	schema.pre('save', next => next())
	schema.pre('remove', next => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', model => {})
	schema.plugin(mongoosePaginate)
	schema.plugin(mongooseAggregatePaginate)
	let model = dbModel.conn.model(collectionName, schema, collectionName)

	model.removeOne=(member, filter)=>sendToTrash(dbModel,collectionName,member,filter)
	return model
}