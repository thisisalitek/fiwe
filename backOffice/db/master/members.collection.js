module.exports = function (dbModel) {
	let collectionName = path.basename(__filename, '.collection.js')
	let schema = mongoose.Schema({
		username: { type: String, required: true, unique: true },
		password: { type: String, default: "", index: true },
		role: { type: String, default: "user" },
		name: { type: String, trim: true, default: '' },
		lastName: { type: String, trim: true, default: '' },
		gender: { type: String, default: '', enum: ['', 'male', 'female', 'other'] },
		authCode: { type: String, default: "" },
		verified: { type: Boolean, default: false },
		lastOnline: { type: Date, default: Date.now },
		createdDate: { type: Date, default: Date.now },
		modifiedDate: { type: Date, default: Date.now },
		suspended: { type: Date, default: Date.now },
		suspendedCount: { type: Number, default: 0 },
		passive: { type: Boolean, default: false },
		approved: { type: Boolean, default: false },
		approvedBy: { type: String, default: "" },
		spamCheck: { type: String, default: "" },
		spamCheckCount: { type: Number, default: 0 },
		partyName: { type: String, trim: true, default: '' },
		taxNumber: { type: String, trim: true, default: '' },
	}, { versionKey: false })

	schema.pre('save', next => next())
	schema.pre('remove', next => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', model => { })
	schema.plugin(mongoosePaginate)

	let model = dbModel.conn.model(collectionName, schema, collectionName)

	model.removeOne = (member, filter) => sendToTrash(dbModel, collectionName, member, filter)
	return model
}