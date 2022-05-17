function loadUIVariables() {
	let s = ``
	Object.keys(global.databases).forEach((key) => {
		let db = global.databases[key]
		if(global.dbId == key) {
			s += `<div class="dropdown-item active">${db.dbName}</div>`
		} else {
			s += `<a class="dropdown-item" href="javascript:changedb('${db._id}')">${db.dbName}</a>`
		}
	})
	document.querySelector('#dbList').innerHTML = s
	document.querySelector('#dbLabel').innerHTML = `<i class="fas fa-database me-1" title=""></i> ${global.dbName}`
}



loadUIVariables()