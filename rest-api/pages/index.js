global.portalConstants = {
	clientMenu: {},
	clientPages: {},
	adminMenu: {},
	adminPages: {},
	moduleList: {},
	staticValues: {},
	widgets: {},
	version: global.version,

}
let maxVersion = ''

module.exports = ()=>new Promise((resolve, reject) => {

	portalConstants.clientMenu = loadJSONFile(path.join(__dirname, '/client/client-menu.json'))
	repairMenu(portalConstants.clientMenu)

	portalConstants.adminMenu = loadJSONFile(path.join(__dirname, '/admin/admin-menu.json'))
	repairMenu(portalConstants.adminMenu)

	portalConstants.staticValues = loadJSONFile(path.join(__dirname, '/static-values.json'))

	portalConstants.clientPages = getJSONPages(path.join(__dirname, '/client/forms'), '.json', 'page')
	portalConstants.adminPages = getJSONPages(path.join(__dirname, '/admin/forms'), '.json', 'page')
	portalConstants.widgets = getJSONPages(path.join(__dirname, '/widgets'), '.json', 'widget')
	portalConstants.javascripts = getJSFiles(path.join(__dirname, '/javascripts'), '.js', 'js file')
	resolve()
})


function getJSONPages(folder, suffix, expression) {
	var moduleHolder = {}
	var files = fs.readdirSync(folder)

	files.forEach((e) => {
		let fileName = path.join(folder, e)
		let fileVer = util.fileVersion(fileName)
		if(fileVer > portalConstants.version || portalConstants.version == '')
			portalConstants.version = fileVer

		if(!fs.statSync(fileName).isDirectory()) {
			let fName = path.basename(fileName)
			let apiName = fName.substr(0, fName.length - suffix.length)
			if(apiName != '' && (apiName + suffix) == fName) {

				if(fileName.substr(-5) == '.json') {
					moduleHolder[apiName] = loadJSONFile(fileName)
				} else {
					moduleHolder[apiName] = require(fileName)
				}

				// if(expression != '')
				// 	eventLog(`${expression} ${apiName.cyan} loaded.`)
			}

		} else {
			let folderName = path.basename(fileName)
			moduleHolder[folderName] = getJSONPages(fileName, suffix, expression)
		}
	})
	return moduleHolder
}

function getJSFiles(folder, suffix, expression) {
	var moduleHolder = {}
	var files = fs.readdirSync(folder)

	files.forEach((e) => {
		let fileName = path.join(folder, e)
		let fileVer = util.fileVersion(fileName)
		if(fileVer > portalConstants.version || portalConstants.version == '')
			portalConstants.version = fileVer

		if(!fs.statSync(fileName).isDirectory()) {
			let fName = path.basename(fileName)
			let apiName = fName.substr(0, fName.length - suffix.length)
			if(apiName != '' && (apiName + suffix) == fName) {

				if(fileName.substr(-3) == '.js') {
					let sbuf = fs.readFileSync(fileName, 'utf8')
					sbuf = sbuf.replaceAll('\r\n', '\n')
					moduleHolder[fName] = sbuf.split('\n')
					if(expression != '')
						eventLog(`${expression} ${fName.cyan} loaded.`)

				}
			}

		} else {
			let folderName = path.basename(fileName)
			moduleHolder[folderName] = getJSONPages(fileName, suffix, expression)
		}
	})
	return moduleHolder
}

function repairMenu(menu, mId = '') {
	Object.keys(menu).forEach((key, index) => {
		menu[key].mId = mId + (mId != '' ? '.' : '') + index
		if(menu[key].fields != undefined) {
			repairMenu(menu[key].fields, menu[key].mId)
		}
	})
}