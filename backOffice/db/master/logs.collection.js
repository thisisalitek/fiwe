module.exports = function(conn) {
	let collectionName = path.basename(__filename, '.collection.js')
	let schema = mongoose.Schema({
		logDate: { type: Date, default: Date.now },
		logData: { type: Object, default: null }
	}, { versionKey: false })

	schema.pre('save', next => next())
	schema.pre('remove', next => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', model => {})
	schema.plugin(mongoosePaginate)

	let model = conn.model(collectionName, schema, collectionName)

	return model
}