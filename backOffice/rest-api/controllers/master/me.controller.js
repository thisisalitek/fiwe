module.exports = (member, req) => new Promise((resolve, reject) => {
	switch (req.method) {
		case 'GET':
			if(req.params.param1 == undefined || req.params.param1 == 'profile') {

				getMyProfile(member, req).then(resolve).catch(reject)
			} else if(req.params.param1 == 'notifications') {
				if(req.params.param2 != undefined) {
					getOneNotification(member, req).then(resolve).catch(reject)
				} else {
					getNotificationList(member, req).then(resolve).catch(reject)
				}
			} else {
				restError.param1(req, reject)
			}

			break
		case 'PUT':
			if(req.params.param1 == undefined || req.params.param1 == 'profile') {
				put(member, req).then(resolve).catch(reject)
			} else {
				restError.param1(req, reject)
			}

			break
		default:
			restError.method(req, reject)
			break
	}
})


function getMyProfile(member, req) {
	return new Promise((resolve, reject) => {
		db.members.findOne({ _id: member._id }).then(doc => {
			if(dbnull(doc, reject)) {
				let obj = doc.toJSON()
				if(obj.db && obj.db.integrationCode != '') {
					obj.approved = true
				} else {
					obj.approved = false
				}
				resolve(obj)
			}
		}).catch(reject)
	})
}


function put(member, req) {
	return new Promise((resolve, reject) => {
		db.members.findOne({ _id: member._id }).then(doc => {
				if(dbnull(doc, reject)) {
					let data = req.body || {}
					doc.name = data.name || ''
					doc.lastName = data.lastName || ''
					doc.gender = data.gender || doc.gender
					if(data.db) {
						doc.db.integrationCode = data.db.integrationCode || ''
						doc.db.partyName = data.db.partyName || ''
						doc.db.taxNumber = data.db.taxNumber || ''
					}
					doc.save()
						.then(resolve)
						.catch(reject)
				}
			})
			.catch(reject)
	})
}

function getNotificationList(member, req) {
	return new Promise((resolve, reject) => {
		let options = {
			page: (req.query.page || 1)
		}

		if((req.query.pageSize || req.query.limit))
			options['limit'] = req.query.pageSize || req.query.limit

		let filter = { member: member._id }

		if((req.query.isRead || '') != '')
			filter['isRead'] = req.query.isRead

		db.notifications.paginate(filter, options).then(resolve).catch(reject)
	})
}

function getOneNotification(member, req) {
	return new Promise((resolve, reject) => {
		db.notifications.findOne({ _id: req.params.param2, member: member._id }).then(resolve).catch(reject)
	})
}