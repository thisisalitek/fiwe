const { resolve } = require('path')
const path = require('path')

Number.prototype.toDigit = function (digit) {
	var t = this
	var s = t.toString()
	if (s.length < digit) {
		s = '0'.repeat(digit - s.length) + s
	}
	return s
}



Date.prototype.yyyymmddhhmmss = function (middleChar = ' ', removeTimeOffset = false) {
	let d = new Date(this.valueOf())
	if (removeTimeOffset) {
		d.setMinutes(d.getMinutes() + (new Date()).getTimezoneOffset())
	}

	return `${d.getFullYear()}-${(d.getMonth() + 1).toDigit(2)}-${d.getDate().toDigit(2)}${middleChar}${d.getHours().toDigit(2)}:${d.getMinutes().toDigit(2)}:${d.getSeconds().toDigit(2)}`
}


Date.prototype.yyyymmdd = function () {
	let d = new Date(this.valueOf())
	return d.yyyymmddhhmmss().substr(0, 10)
}

exports.mongoDate = function (dateStr) {
	d = new Date(dateStr);
	d.setMinutes(d.getMinutes() + (new Date()).getTimezoneOffset() * 1)
	eventLog(d.toISOString())
	return d.toISOString()
}

Date.prototype.hhmmss = function (middleChar) {
	let d = new Date(this.valueOf())
	return d.yyyymmddhhmmss().substr(11, 8)

}

Date.prototype.yyyymmddmilisecond = function () {
	let d = new Date(this.valueOf())
	return d.yyyymmddhhmmss() + '.' + this.getMilliseconds().toString()
}


Date.prototype.addDays = function (days) {
	var dat = new Date(this.valueOf())
	dat.setDate(dat.getDate() + days)
	return dat
}

Date.prototype.add = function (interval, units) {
	var dat = new Date(this.valueOf())
	return exports.dateAdd(dat, interval, units)
}

exports.dateAdd = function (date, interval, units) {
	if (!(date instanceof Date))
		return undefined
	let ret = new Date(date) //don't change original date
	let checkRollover = function () {
		if (ret.getDate() != date.getDate())
			ret.setDate(0)
	}
	switch (String(interval).toLowerCase()) {
		case 'year':
			ret.setFullYear(ret.getFullYear() + units)
			checkRollover()
			break
		case 'quarter':
			ret.setMonth(ret.getMonth() + 3 * units)
			checkRollover()
			break
		case 'month':
			ret.setMonth(ret.getMonth() + units)
			checkRollover()
			break
		case 'week':
			ret.setDate(ret.getDate() + 7 * units)
			break
		case 'day':
			ret.setDate(ret.getDate() + units)
			break
		case 'hour':
			ret.setTime(ret.getTime() + units * 3600000)
			break
		case 'minute':
			ret.setTime(ret.getTime() + units * 60000)
			break
		case 'second':
			ret.setTime(ret.getTime() + units * 1000)
			break
		default:
			ret = undefined
			break
	}
	return ret
}

Date.prototype.lastThisMonth = function () {
	let dat = new Date(this.valueOf());
	dat = new Date((new Date(dat.setMonth(dat.getMonth() + 1))).setDate(0))
	return dat
}

global.timeStamp = function () { return (new Date).yyyymmddhhmmss() };


global.eventLog = function (obj, ...placeholders) {
	// if(placeholders){
	// 	if(typeof obj=='string' && placeholders.length>0){
	// 		return console.log(timeStamp(), obj.cyan, ...placeholders)		
	// 	}
	// }
	console.log(timeStamp(), obj, ...placeholders)
}

global.errorLog = function (obj, ...placeholders) {
	console.error(timeStamp().red, obj, ...placeholders)
}

global.warnLog = function (obj, ...placeholders) {
	console.error(timeStamp().yellow, obj, ...placeholders)
}


exports.transformPairKey = (value) => {
	return value.replace(/[`~!@#$%^&*()_|+\-= ?;:'",.<>\{\}\[\]\\\/]/gi, "").toUpperCase();
}

exports.timeAddSeconds = (value, seconds) => {
	var dateAndTime = new Date(value);
	return new Date(dateAndTime.setSeconds(value.getSeconds() + seconds));
}

exports.timeSubstractSeconds = (value, seconds) => {
	var dateAndTime = new Date(value);
	return new Date(dateAndTime.setSeconds(value.getSeconds() - seconds));
}

exports.timeWithoutMilliseconds = (value) => {
	var dateAndTime = new Date(value);
	return new Date(dateAndTime.setMilliseconds(0));
}

exports.urlJoin = (...args) => {
	return args.join('/')
		.replace(/[\/]+/g, '/')
		.replace(/^(.+):\//, '$1://')
		.replace(/^file:/, 'file:/')
		.replace(/\/(\?|&|#[^!])/g, '$1')
		.replace(/\?/g, '&')
		.replace('&', '?');
}


String.prototype.padding = function (n, c) {
	var val = this.valueOf()
	if (Math.abs(n) <= val.length) {
		return val
	}
	var m = Math.max((Math.abs(n) - this.length) || 0, 0)
	var pad = Array(m + 1).join(String(c || ' ').charAt(0))
	return (n < 0) ? pad + val : val + pad
}




global.t = (new Date()).getTime()

global.time = (text = 't') => {
	var fark = (((new Date()).getTime()) - t) / 1000
	console.log(`${text}:`, fark)

}

global.timeReset = () => {
	t = (new Date()).getTime()
}


exports.incString = function (text) {
	if (!text) return '1'
	var sbuf = ''
	for (var i = text.length - 1; i >= 0; i--) {
		if (!isNaN(text[i])) {
			sbuf = text[i] + sbuf
		} else {
			break
		}
	}
	if (sbuf == '') return text + '1'

	//A04950;  sbuf='04950'
	var numara = Number(sbuf)
	var numaraString = ''
	numara++
	if (numara.toString().length < sbuf.length) {
		numaraString = numara.toString()
		for (var i = 0; i < (sbuf.length - numara.toString().length); i++) {
			numaraString = '0' + numaraString
		}
	} else {
		numaraString = numara.toString()
	}
	if (numaraString.length >= text.length) {
		return numaraString
	} else {
		return text.substr(0, (text.length - numaraString.length)) + numaraString
	}
}



global.runNodeJs = (fileName, cb) => {
	const cp = require('child_process')
	const child = cp.spawn('node', [fileName, '-e'])

	let buf = ''
	child.stdout.on('data', (c) => {
		buf += c
	})

	child.stderr.on('data', (data) => {
		console.error('runNodeJs:', fileName)
		console.error('Hata:', data.toString('UTF-8'))
		if (cb) {
			return cb({ name: 'ERR_runNodeJs', message: data.toString('UTF-8') })
		}
	})

	child.stdout.on('end', () => {
		if (cb) {
			return cb(null, buf.toString('UTF-8'))
		}
	})
}

global.clone = (obj) => {
	return JSON.parse(JSON.stringify(obj))
}

global.iteration = function (dizi, fonksiyon, interval, errContinue, callback) {
	var index = 0
	var result = []
	var errors = ''

	function tekrar(cb) {
		if (index >= dizi.length)
			return cb(null)
		fonksiyon(dizi[index], (err, data) => {
			if (!err) {
				if (data)
					result.push(data)
				index++
				setTimeout(tekrar, interval, cb)
			} else {
				errorLog(`iteration():`, err)
				if (errContinue) {
					errors += `iteration(): ${err.message}\n`
					index++
					setTimeout(tekrar, interval, cb)
				} else {
					cb(err)
				}

			}
		})
	}

	tekrar((err) => {
		if (!err) {
			if (errContinue && errors != '') {
				if (callback)
					callback({ code: 'IterationError', message: errors }, result)
			} else {
				if (callback)
					callback(null, result)
			}
		} else {
			if (callback) {
				callback(err, result)
			}
		}

	})
}


global.tempLog = (fileName, text) => {
	if (config.status === 'release')
		return
	var tmpDir = os.tmpdir()
	if (config && config.tmpDir) {
		tmpDir = config.tmpDir
	}
	fs.writeFileSync(path.join(tmpDir, fileName), text, 'utf8')
}

global.moduleLoader = function (folder, suffix, expression) {
	return new Promise((resolve, reject) => {
		try {
			let holder = {}
			let files = fs.readdirSync(folder)
			files.forEach((e) => {
				let f = path.join(folder, e)
				if (!fs.statSync(f).isDirectory()) {
					let fileName = path.basename(f)
					let apiName = fileName.substr(0, fileName.length - suffix.length)
					if (apiName != '' && !apiName.startsWith('!') && (apiName + suffix) == fileName) {
						holder[apiName] = require(f)
						if (expression != '')
							eventLog(`${expression} ${apiName.cyan} loaded.`)
					}
				}
			})
			resolve(holder)
		} catch (err) {
			reject(err)
		}
	})
}


exports.randomNumber = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

global.loadJSONFile = (fileName) => {
	let s = fs.readFileSync(fileName, 'utf8')
	// s=s.replaceAll('\t','\\t').replaceAll('\r','\\r').replaceAll('\n','\\n')
	let TAB = '  '
	s = s.replace(/\t/g, TAB)
	return JSON.parse(s)
}

String.prototype.wordWrap = function (col = 80, eof = '\n') {
	let s = this,
		satir = Math.ceil(s.length / col),
		i = 0,
		lines = []

	while (i < satir) {
		lines.push(s.substr(i * col, col))
		i++
	}

	return lines.join(eof)
}

exports.validEmail = function (s) {
	return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(s)
}

exports.validTelephone = function (tel) {
	if (tel.trim() == '') return false
	var bFound = false
	for (var i = 0; i < tel.length; i++) {
		if (!((tel[i] >= '0' && tel[i] <= '9') || tel[i] == '+')) {
			return false
		}
	}
	return true
}


Date.prototype.monthName = function (language) {


	language = language || 'TR';

	var monthNames = []
	switch (language) {
		case 'TR':
		case 'tr':
			monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
			break
		default:
			monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
			break
	}

	return monthNames[this.getMonth()]
}

// exports.trimNumbers=function(text){
//     return text.replace( /^\D+/g, '')
// }


exports.trimNumbers = function (text) {
	var buf = ''
	for (var i = 0; i < text.length; i++) {
		if (text[i] >= '0' && text[i] <= '9') {
			buf += text[i]
		}
	}

	return buf
}

exports.namecode = function (text) {
	text = text.toLowerCase()
	text = text.replaceAll('İ', 'i')
	text = text.replaceAll('ı', 'i')
	text = text.replaceAll('Ğ', 'g')
	text = text.replaceAll('ğ', 'g')
	text = text.replaceAll('Ü', 'u')
	text = text.replaceAll('ü', 'u')
	text = text.replaceAll('Ö', 'o')
	text = text.replaceAll('ö', 'o')
	text = text.replaceAll('Ş', 's')
	text = text.replaceAll('ş', 's')
	text = text.replaceAll('Ç', 'c')
	text = text.replaceAll('ç', 'c')
	text = text.replaceAll('  ', ' ')
	text = text.replaceAll('  ', ' ')
	text = text.replaceAll('  ', ' ')
	text = text.replaceAll('  ', ' ')
	text = text.replaceAll('  ', ' ')
	text = text.replaceAll('.', '')
	text = text.replaceAll(',', '')
	text = text.replaceAll('-', '')
	text = text.replaceAll('_', '')
	text = text.replaceAll('+', '')
	text = text.replaceAll('#', '')
	text = text.replaceAll('$', '')
	text = text.replaceAll('%', '')
	text = text.replaceAll('^', '')
	text = text.replaceAll('&', '')
	text = text.replaceAll('*', '')
	text = text.replaceAll("'", '')

	for (i = 20; i > 1; i--) {
		var buf = ''
		for (j = 0; j < i; j++) {
			buf = buf + ' '
		}
		text = text.replaceAll(buf, ' ')
	}
	return text
}

String.prototype.lcaseeng = function () {
	var text = this.toLowerCase()
	text = text.replaceAll('İ', 'i')
	text = text.replaceAll('ı', 'i')
	text = text.replaceAll('I', 'i')
	text = text.replaceAll('Ğ', 'g')
	text = text.replaceAll('ğ', 'g')
	text = text.replaceAll('Ü', 'u')
	text = text.replaceAll('ü', 'u')
	text = text.replaceAll('Ö', 'o')
	text = text.replaceAll('ö', 'o')
	text = text.replaceAll('Ş', 's')
	text = text.replaceAll('ş', 's')
	text = text.replaceAll('Ç', 'c')
	text = text.replaceAll('ç', 'c')

	var sbuf = ''
	for (var i = 0; i < text.length; i++) {
		if (text.charCodeAt(i) <= 127) {
			sbuf = sbuf + text[i]
		}
	}
	return sbuf
}

String.prototype.ucaseeng = function () {
	var text = this.lcaseeng()
	text = text.toUpperCase()

	return text
}

String.prototype.upcaseTr = function () {
	var text = this
	text = text.replaceAll('i', 'İ')
	text = text.replaceAll('ı', 'I')
	text = text.replaceAll('ğ', 'Ğ')
	text = text.replaceAll('ü', 'Ü')
	text = text.replaceAll('ş', 'Ş')
	text = text.replaceAll('ö', 'Ö')
	text = text.replaceAll('ç', 'Ç')


	text = this.toUpperCase()

	return text
}

String.prototype.lcaseTr = function () {
	var text = this
	text = text.replaceAll('İ', 'i')
	text = text.replaceAll('I', 'ı')
	text = text.replaceAll('Ğ', 'ğ')
	text = text.replaceAll('Ü', 'ü')
	text = text.replaceAll('Ş', 'ş')
	text = text.replaceAll('Ö', 'ö')
	text = text.replaceAll('Ç', 'ç')


	text = this.toLowerCase()

	return text
}

String.prototype.briefCase = function () {
	var text = this.lcaseTr().trim()
	var newtext = ''
	for (var i = 0; i < text.length; i++) {
		if (i == 0) {
			newtext = newtext + text.substr(i, 1).upcaseTr()
		} else {
			if (text.substr(i - 1, 1) == ' ' && text.substr(i, 1) != ' ') {
				newtext = newtext + text.substr(i, 1).upcaseTr()
			} else {
				newtext = newtext + text.substr(i, 1)
			}
		}
	}

	return newtext
}

String.prototype.lcaseTr2 = function () {
	var text = this.lcaseTr().trim()
	var newtext = ''
	if (text.length > 0) {
		text = text[0].upcaseTr()
	}


	return text
}


global.htmlEval = function (html, values = {}, bracketDollar = true) {
	let code = ''
	try {

		Object.keys(values).forEach((key) => {
			if (key != 'class')
				code += `let ${key}=${JSON.stringify(values[key])}\n`
		})
		code += `return \`${html}\``
		let f = new Function(code)
		return f()
	} catch (tryErr) { }
	return html
}

exports.fileVersion = (fullFileName) => {
	if (!fs.existsSync(fullFileName))
		return '00000000000000'
	let stats = fs.statSync(fullFileName);

	return (new Date(stats.mtime)).yyyymmddhhmmss().replaceAll('-', '').replaceAll(' ', '').replaceAll(':', '')
}

exports.saveTempFolderBase64 = (fileName, base64Data) => new Promise((resolve, reject) => {
	let s = base64Data.indexOf('base64,') > -1 ? base64Data.split('base64,')[1] : base64Data
	try {

		let dosyaAdi = fileName.substr(0, fileName.length - path.extname(fileName).length)
		dosyaAdi = `${dosyaAdi.substr(0, 30)}_${uuid.v4()}${path.extname(fileName)}`
		let newFileName = path.join(config.tmpDir, `${(new Date()).yyyymmddhhmmss().replaceAll(' ', '_').replaceAll(':', '')}_${dosyaAdi}`)
		const fileContents = Buffer.from(s, 'base64')
		fs.writeFileSync(newFileName, fileContents, 'utf8')
		resolve(newFileName)
	} catch (err) {
		reject(err)
	}

})

exports.makeTempDir = () => new Promise((resolve, reject) => {
	try {
		if (!fs.existsSync(config.tmpDir))
			fs.mkdirSync(config.tmpDir)

		if (!fs.existsSync(path.join(config.tmpDir, config.name)))
			fs.mkdirSync(path.join(config.tmpDir, config.name))

		let dir = path.join(config.tmpDir, config.name, (new Date()).yyyymmddhhmmss().replaceAll(' ', '_').replaceAll(':', '') + '_' + uuid.v4())

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir)
		}
		resolve(dir)

	} catch (err) {
		reject(err)
	}

})
