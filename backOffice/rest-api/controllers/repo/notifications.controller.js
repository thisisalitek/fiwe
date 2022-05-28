module.exports = (dbModel, member, req) => new Promise((resolve, reject) => {
	switch (req.method) {
		case 'GET':
			if (req.params.param1 != undefined) {
				getOne(dbModel, member, req).then(resolve).catch(reject)
			} else {
				getList(dbModel, member, req).then(resolve).catch(reject)
			}
			break

		default:
			restError.method(req, reject)
			break
	}
})

function getList(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let options = {
			page: (req.query.page || 1)
		}

		options.sort = { _id: -1 }
		if ((req.query.pageSize || req.query.limit))
			options['limit'] = req.query.pageSize || req.query.limit


		let filter = { memberId: member._id, dbId: dbModel._id, createdDate: { $gte: (new Date()).addDays(-90) } }

		if ((req.query.isRead || '') != '')
			filter['isRead'] = req.query.isRead

		db.notifications.paginate(filter, options).then(resolve).catch(reject)
	})
}

function getOne(dbModel, member, req) {
	return new Promise((resolve, reject) => {
		let filter = { _id: req.params.param1, memberId: member._id, dbId: dbModel._id }

		db.notifications.findOne(filter)
			.then(doc => {
				if (dbnull(doc, reject))
					resolve(doc)

			})
			.catch(reject)
	})
}