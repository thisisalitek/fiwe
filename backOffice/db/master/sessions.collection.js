module.exports = function(dbModel) {
	let collectionName = path.basename(__filename, '.collection.js')
	let schema = mongoose.Schema({
		memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'members', default: null, index: true },
		token: { type: String, required: true, index: true },
		username: { type: String, default: '', index: true },
		role: { type: String, default: "user" },
		ip: { type: String, default: "" },
		userAgent: { type: String, default: "" },
		dbId: { type: String, default: "", index: true },
		dbName: { type: String, default: "", index: true },
		mId: { type: String, default: "", index: true },
		passive: { type: Boolean, default: false, index: true },
		// menu: [],
		// databases: [],
		// settings: [],
		createdDate: { type: Date, default: Date.now },
		lastOnline: { type: Date, default: Date.now, index: true }
	}, { versionKey: false })

	schema.pre('save', next => next())
	schema.pre('remove', next => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', model => {})
	schema.plugin(mongoosePaginate)

	let model = dbModel.conn.model(collectionName, schema, collectionName)

	return model
}