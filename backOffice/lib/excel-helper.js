const readXlsxFile = require('read-excel-file/node')
const readSheetNames = require('read-excel-file/node').readSheetNames
/*
	options={
		sheetName: (s) => s.toUpperCase(),  //Convert Sheet Names
		rows: (rows,sheetName) => {							// process rows in sheets
			rows.forEach(e => {
				e[0]=(e[0] || '').toUpperCase()
			})
			return rows
		}
	}
*/


exports.convertXlsxToJSON = (fileName, options = {}) => new Promise((resolve, reject) => {
	try {
		let obj = {}
		readSheetNames(fileName)
			.then(sheets => {
				let i = 0

				let calistir = () => new Promise((resolve, reject) => {
					if (i >= sheets.length)
						return resolve()
					let newSheetName = options.sheetName?options.sheetName(sheets[i]):sheets[i]
					let currSheetName=sheets[i]
					obj[newSheetName] = []
					readXlsxFile(fileName, { sheet: currSheetName })
						.then(rows => {
							obj[newSheetName] =options.rows?options.rows(rows,newSheetName) || []:rows
							i++
							setTimeout(()=>calistir().then(resolve).catch(reject), 0)
						})
						.catch(reject)

				})


				calistir()
					.then(() => resolve(obj))
					.catch(reject)
				
			})
			.catch(reject)


	} catch (err) {
		reject(err)
	}
})
