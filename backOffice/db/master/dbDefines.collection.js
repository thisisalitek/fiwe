module.exports = function(conn) {
	let collectionName = path.basename(__filename, '.collection.js')
	let schema = mongoose.Schema({
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'members', default: null, index: true },
		dbName: { type: String, required: true, index: true },
		userDb: { type: String, default: '', index: true },
		userDbHost: { type: String, default: 'mongodb://localhost:27017/', index: true },
		allowedMembers:{},
		dbStats: {},
		version: { type: String, default: '', index: true },
		deleted: { type: Boolean, default: false, index: true },
		passive: { type: Boolean, default: false, index: true },
		createdDate: { type: Date, default: Date.now },
		modifiedDate: { type: Date, default: Date.now }
	}, { versionKey: false })

	schema.pre('save', next => next())
	schema.pre('remove', next => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', model => {})
	schema.plugin(mongoosePaginate)

	let model = conn.model(collectionName, schema, collectionName)

	model.removeOne = (member, filter, cb) => {
		conn.model(collectionName).updateOne(filter, {$set:{deleted:true,passive:true,modifiedDate:new Date()}}, err => cb(err))
		// sendToTrash(conn, collectionName, member, filter, cb) 
	}
	return model
}