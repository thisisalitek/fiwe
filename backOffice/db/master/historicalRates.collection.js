module.exports = function(conn) {
	let collectionName = path.basename(__filename, '.collection.js')
	
	let schema = mongoose.Schema({
		provider: { type: String, trim:true, required: true },
		currency: { type: String, trim:true, required: true },
		time: { type: Date, default: Date.now },
		price: { type: Number, default: 0 }
	}, { versionKey: false })

	schema.pre('save', next => next())
	schema.pre('remove', next => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', model => {})
	schema.plugin(mongoosePaginate)

	schema.index({ "provider": 1 })
	schema.index({ "currency": 1 })
	schema.index({ "time": 1 })
	// schema.index({ "price": 1 })

	let model = conn.model(collectionName, schema, collectionName)

	return model
}
