'use strict'

var global = {
	version: '',
	staticValues: {},
	pages: {},
	widgets: {},
	javascripts: {},
	menu: {},
	databases: [],
	dbId: '',
	dbName: '',
	token: '',
	sessionId: '',
	formOptionsLink: '',
	numberFormats: {
		money: { round: 2 },
		amount: { round: 2 },
		quantity: { round: 3 },
		price: { round: 4 }
	},
	status: '',
	// basePath: ''
}

var staticValues = {}


function initHahamGlobals() {
	try {
		if (localStorage.getItem('global')) {
			global = Object.assign({}, global, JSON.parse(localStorage.getItem('global')))
			staticValues = global.staticValues
		}
	} catch (e) {
		localStorage.removeItem('global')
	}
}

initHahamGlobals()

initIspiyonService()

var hashObj = getHashObject()

function getHashObject() {
	if (window.location.hash == '')
		return {}

	let hash = window.location.hash.substr(1)
	let queryString = hash.split('?')[1] ? hash.split('?')[1] : ''
	let dizi = hash.split('?')[0].split('/')
	dizi.splice(0, 1)

	let h = {
		path: dizi.length > 1 ? `/${dizi[0]}/${dizi[1]}` : '',
		pathKey: dizi.length > 1 ? `${dizi[0]}.${dizi[1]}` : '',
		func: dizi.length > 2 ? dizi[2] : '',
		id: dizi.length > 3 ? dizi[3] : '',
		param1: dizi.length > 4 ? dizi[4] : '',
		param2: dizi.length > 5 ? dizi[5] : '',
		param3: dizi.length > 6 ? dizi[6] : '',
		query: {},
		queryString: queryString,
		module: '',
		icon: '',
		title: '',
		funcTitle: '',
		breadCrumbs: '',
		breadCrumbsHtml: '',
		settings: {}
	}
	if (h.path && h.func == '') {
		h.func = 'index'
	}

	if (queryString) {

		h.query = getAllUrlParams(queryString)
	}
	let p = getPageInfos(h)
	h = Object.assign({}, h, p)
	h['settings'] = getPageSettings(h.module)

	return h
}

function setHashObject(h) {
	let hashString = h.path || ''

	if (h.func != '' && h.func != 'index') {
		hashString += '/' + h.func
		if (h.id) {
			hashString += '/' + h.id
			if (h.param1) {
				hashString += '/' + h.param1
				if (h.param2) {
					hashString += '/' + h.param2
					if (h.param3) {
						h += '/' + h.param3
					}
				}
			}
		}
	}

	if (h.query) {
		let filterString = ''
		Object.keys(h.query).forEach((key) => {
			if (filterString != '')
				filterString += '&'
			filterString += `${key}=${encodeURIComponent2(h.query[key])}`
		})
		if (filterString != '') {
			hashString += `?${filterString}`
		}
	}

	window.location.hash = hashString
}

function getPageInfos(h = null) {
	let p = {
		module: '',
		icon: '',
		title: '',
		funcTitle: '',
		breadCrumbs: '',
		breadCrumbsHtml: ''

	}
	if (h == null) {
		h = hashObj
	}
	let breadCrumbs = getBreadCrumbs(h, global.menu)
	// if((h.query.mid || '') == '') {
	// 	breadCrumbs = getBreadCrumbsFromPath(global.menu, (h.path)) || []
	// } else {
	// 	breadCrumbs = getBreadCrumbs(global.menu, (h.query.mid)) || []
	// }


	if (breadCrumbs.length > 0) {
		p.icon = breadCrumbs[breadCrumbs.length - 1].icon || ''
		p.title = breadCrumbs[breadCrumbs.length - 1].text || ''
		// p.module = breadCrumbs[breadCrumbs.length - 1].module || ''

		if (h.func != '' && h.func != 'index') {
			switch (h.func) {
				case 'edit':
					p.funcTitle = 'Düzenle'
					break
				case 'addnew':
					p.funcTitle = 'Yeni'
					break
				case 'view':
					p.funcTitle = 'İzleme'
					break
				case 'print':
					p.funcTitle = 'Yazdır'
					break
				default:
					p.funcTitle = h.func
					break
			}
			breadCrumbs.push({ icon: '', text: p.funcTitle })
		}
		let seperator = ' / '

		let brdc = breadCrumbs.filter(e => (e.text || '') != '')

		p.breadCrumbs = brdc.map(e => e.text).join(seperator)

		p.breadCrumbsHtml = `<span class="mx-1 ellipsis">${brdc.slice(0, -1).map(e => e.text).join(seperator)}${brdc.length > 1 ? seperator : ''}</span><span class="active me-3">${brdc[brdc.length - 1].text || ''}</span>`

	}
	return p
}

function getBreadCrumbs(h, menu, parentMenu = null) {
	if (!h)
		return []
	let mId = h.query.mid || ''
	let path = h.path || ''
	let sonuc = []
	Object.keys(menu).forEach((key) => {
		let e = menu[key]
		if (e.fields) {
			let a = getBreadCrumbs(h, e.fields, e)
			if (parentMenu && a.length > 0)
				sonuc.push(parentMenu)
			a.forEach((e2) => {
				sonuc.push(e2)
			})
		} else {
			if (mId != '' && e.mId != '') {
				if (e.mId && e.mId == mId) {
					if (parentMenu)
						sonuc.push(parentMenu)
					sonuc.push(e)
				}
			} else {
				if (e.path && e.path == path) {
					if (parentMenu)
						sonuc.push(parentMenu)
					sonuc.push(e)
				}
			}

		}
	})
	return sonuc
}

function getModulePageName() {
	let pageName = 'page'
	let dizi = hashObj.path.split('/')
	let k = 0
	dizi.forEach((e) => {
		if (e != '') {
			if (k == 2) {
				return
			} else {
				pageName += '_' + e
				k++
			}
		}
	})

	return pageName
}


var pageSettings = {
	setItem: function (param, value) {
		try {
			let obj = JSON.parse(localStorage.getItem(`${getModulePageName()}`) || '{}')
			obj[param] = value
			localStorage.setItem(`${getModulePageName()}`, JSON.stringify(obj))
		} catch (err) {
			showError(err)
		}
	},
	getItem: function (param) {
		try {
			let obj = JSON.parse(localStorage.getItem(`${getModulePageName()}`) || '{}')
			if (obj[param] == undefined)
				obj[param] = null

			return obj[param]
		} catch (err) {
			showError(err)
			return null
		}

	}
}

function helpButton(item) {
	if ((item.help || '') != '') {
		let helpUrl = item.help
		//manipulateUrl(item.help)

		return `<a href="javascript:openInNewTab('${helpUrl}')" class="skip-enter-next text-primary bold ms-2" title="Yardım ve açıklama için tıklayınız"><i class="far fa-question-circle"></i></a>`
	} else {
		return ''
	}
}

function maxLookupLength(lookup) {
	let max = 0
	Object.keys(lookup).forEach((key) => {
		if (lookup[key].length > max)
			max = lookup[key].length
	})
	return max
}

function generateFormName(name) {
	let keys = name.toString().split('.')
	if (keys.length <= 1) {
		return name
	} else {
		let s = ''
		keys.forEach((k, index) => {
			if (index == 0)
				s = k
			else
				s += `[${k}]`
		})
		return s
	}
}

function generateFormId(name) {
	if (typeof name == 'string')
		return name.replaceAll('.', '_')
	else
		return ''
}

function loadCardCollapses() {
	let kartlar = document.getElementsByClassName('card-collapse')
	let i = 0
	while (i < kartlar.length) {
		if (pageSettings.getItem(`collapse_${kartlar[i].id}`)) {
			$(`#${kartlar[i].id}`).collapse(pageSettings.getItem(`collapse_${kartlar[i].id}`))
		}
		i++
	}

	$('.card-collapse').on('show.bs.collapse', (e) => {
		pageSettings.setItem(`collapse_${e.target.id}`, e.type)

	})
	$('.card-collapse').on('hide.bs.collapse', (e) => {
		pageSettings.setItem(`collapse_${e.target.id}`, e.type)

	})

	$('.modal .card-collapse').on('show.bs.collapse', (e) => {
		pageSettings.setItem(`collapse_${e.target.id}`, e.type)
	})
	$('.modal .card-collapse').on('hide.bs.collapse', (e) => {
		pageSettings.setItem(`collapse_${e.target.id}`, e.type)
	})
}


function postMan(url, options) {
	return new Promise((resolve, reject) => {

		let isForeignUrl = false
		if (!(url.startsWith('http') || url.startsWith('//'))) {
			url = config.api.url + url
		} else {
			isForeignUrl = true
		}



		let data = options.data || {}
		let token = data.token || global.token || ''
		let sid = data.sid || data.sessionId || global.sessionId || ''
		options.headers = options.headers || {}
		if (!isForeignUrl) {
			options.headers.token = token
			options.headers.sid = sid
		}
		$.ajax({
			url: url,
			type: options.method || options.type || 'GET',
			dataType: options.dataType || 'json',
			data: data,
			headers: options.headers,
			timeout: 120000
		}).done((result, textStatus) => {
			if (result.success != undefined) {
				if (result.success) {
					resolve(result.data)
				} else {
					reject(result.error)
				}
			} else {
				resolve(result)
			}
		}).fail((jqXHR, textStatus, errorThrown) => {
			let err = (jqXHR.responseJSON || {}).error || errorThrown
			reject(err)
		})
	})
}

function htmlEval(html, values = {}, bracketDollar = true) {
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


function remoteLookupAutocomplete(locals) {

	if (locals.dataSource == undefined)
		return

	let searchUrl = ''
	if ((locals.dataSource.search || '') != '') {
		searchUrl = htmlEval(locals.dataSource.search, { _id: locals.value })

	} else if ((locals.dataSource.url || '') != '') {
		searchUrl = htmlEval(locals.dataSource.url, { _id: locals.value })
		if (searchUrl.indexOf('?') < 0) {
			searchUrl += '?search=${search}'
		} else {
			searchUrl += '&search=${search}'
		}
	}
	let idUrl = ''
	if (locals.dataSource.id || locals.dataSource.idUrl) {
		idUrl = htmlEval(locals.dataSource.id || locals.dataSource.idUrl, { _id: locals.value })

	} else if (locals.dataSource.url) {
		idUrl = htmlEval(locals.dataSource.url, { _id: locals.value })
		if (idUrl.indexOf('?') < 0) {
			idUrl += `/${locals.value}`
		} else {
			idUrl += `&id=${locals.value}`
		}
	}


	if (searchUrl == '' || idUrl == '') {
		return
	}

	let labelStr = (locals.dataSource.label || '${name}')
	let valueText = locals.valueText || ''


	$(`#${locals.id}-autocomplete-text`).autocomplete({
		source: function (request, response) {
			let typedText = encodeURIComponent2(request.term)
			let url = htmlEval(searchUrl, { search: typedText, mid: q.mid || '' })
			postMan(url, { type: 'GET' })
				.then(result => {
					let dizi = []
					if (result) {
						if (result.docs != undefined) {
							result.docs.forEach((e) => {
								let text = htmlEval(labelStr, e)
								dizi.push({ label: text, value: text, obj: e })
							})
						} else {
							if (Array.isArray(result)) {
								result.forEach((e) => {
									let text = htmlEval(labelStr, e)
									dizi.push({ label: text, value: text, obj: e })
								})
							} else {
								let text = htmlEval(labelStr, result)
								dizi.push({ label: text, value: text, obj: result })
							}
						}
					}
					response(dizi)
				})
				.catch(err => {
					console.error(err)
					response([])
				})

		},
		select: function (event, ui) {
			$(`#${locals.id}-autocomplete-text`).val((ui.item.label || ''))
			$(`input[name="${locals.name}"]`).val(ui.item.obj._id.toString())
			$(`#${locals.id}-obj`).val(encodeURIComponent2(JSON.stringify(ui.item.obj)))
			if (locals.lookupTextField) {
				$(`input[name="${locals.lookupTextFieldName}"]`).val((ui.item.label || ''))
			}
			if (locals.onchange) {
				eval(`${locals.onchange}`)
			}
			return false
		}
	})


	$(`#${locals.id}-autocomplete-text`).on('change', () => {

		if ($(`#${locals.id}-autocomplete-text`).val() == '') {
			$(`input[name="${locals.name}"]`).val('')

		}
		if (locals.lookupTextField) {
			$(`input[name="${locals.lookupTextFieldName}"]`).val($(`#${locals.id}-autocomplete-text`).val())
		}
	})


	if ((locals.value || '') != '') {
		let url = idUrl.replace('{mid}', q.mid)

		postMan(url, { type: 'GET' })
			.then(result => {
				if (result) {
					let label = htmlEval(labelStr, result) || ''
					if (valueText == '') {
						$(`#${locals.id}-autocomplete-text`).val(label)
					}

					$(`input[name="${locals.name}"]`).val(result._id.toString())

					if (locals.lookupTextField) {
						$(`#${locals.id}-original-text`).html(label)
						$(`#${locals.id}-original-text`).attr('title', label)
					}

				} else {
					if (valueText == '')
						$(`#${locals.id}-autocomplete-text`).val('')
					$(`input[name="${locals.name}"]`).val('')
				}
			})
			.catch(err => {
				console.log(`err`, err)
				$(`#${locals.id}-autocomplete-text`).val('')
				$(`#${locals.id}-autocomplete-text`).attr('placeholder', `Hata:${err.message}`)
			})


	}
}


function cboEasyDateChange(value) {

	let date1 = new Date()
	let date2 = new Date()
	date1.setHours(0, 0, 0, 0)
	date1.setMinutes(-1 * (new Date()).getTimezoneOffset())
	date2.setHours(0, 0, 0, 0)
	date2.setMinutes(-1 * (new Date()).getTimezoneOffset())

	switch (value) {
		case 'today':
			break
		case 'thisWeek':
			date1 = date1.addDays(-1 * (date1.getDay() - 1))
			date2 = date2.addDays(7 - date2.getDay())
			break
		case 'thisMonth':
			date1 = date1.addDays(-1 * (date1.getDate() - 1))
			date2 = date2.lastThisMonth()
			break
		case 'lastMonth':
			date1 = new Date((new Date(date1.setMonth(date1.getMonth() - 1))).setDate(1))
			date2 = date1.lastThisMonth()
			break
		case 'last1Week':
			date1 = date1.addDays(-7)
			break

		case 'last1Month':
			date1 = new Date(date1.setMonth(date1.getMonth() - 1))
			break
		case 'last3Months':
			date1 = new Date(date1.setMonth(date1.getMonth() - 3))
			break
		case 'last6Months':
			date1 = new Date(date1.setMonth(date1.getMonth() - 6))
			break
		case 'thisYear':
			date1 = new Date(date1.getFullYear(), 0, 1)
			date2 = new Date(date2.getFullYear(), 11, 31)
			break
		case 'last1Year':
			date1 = new Date(date1.setMonth(date1.getMonth() - 12))
			break
		default:
			break
	}
	return {
		date1: date1.yyyymmdd(),
		date2: date2.yyyymmdd()
	}
}




function htmlEval222(url, item) {
	if ((url || '') == '')
		return ''
	if (!(url.indexOf('{') > -1 && url.indexOf('}') > -1))
		return url
	let fieldList = []
	let dizi = url.split('}')
	dizi.forEach((e) => {
		if (e.indexOf('{') > -1) {
			fieldList.push(e.split('{')[1])
		}
	})


	fieldList.forEach((e) => {
		let e2 = e.replace('.toLowerCase()', '').replace('.toUpperCase()', '')
		let value = getPropertyByKeyPath(item, e2)

		if (value) {
			if (e.indexOf('.toLowerCase()') > -1) {
				value = value.toLowerCase()
			}
			if (e.indexOf('.toUpperCase()') > -1) {
				value = value.toUpperCase()
			}
		}

		url = url.replaceAll(`{${e}}`, value)
	})

	return url
}


function getPropertyByKeyPath(targetObj, keyPath, defaultValue) {
	if (targetObj == undefined || targetObj == null || !keyPath)
		return defaultPropertyValue(targetObj, defaultValue)

	if (keyPath.substr(0, 1) == '/')
		keyPath = keyPath.substr(1)
	if (keyPath.substr(0, 2) == './')
		keyPath = keyPath.substr(2)
	keyPath = keyPath.replaceAll('/', '.')

	let keys = keyPath.split('.')
	if (keys.length == 0)
		return defaultPropertyValue(undefined, defaultValue)
	keys = keys.reverse()
	let subObject = targetObj
	while (keys.length) {
		let k = keys.pop()
		if (typeof subObject[k] == 'undefined' || subObject[k] == null) {
			return defaultPropertyValue(undefined, defaultValue)
		} else {
			subObject = subObject[k]
		}
	}




	return defaultPropertyValue(subObject, defaultValue)
}

function defaultPropertyValue(subObject, defaultValue) {
	if (!subObject && defaultValue != undefined) {
		if (typeof defaultValue == 'string') {
			let s1 = defaultValue.indexOf('${')
			let s2 = defaultValue.indexOf('}', s1)
			if (s1 > -1 && s2 > -1) {
				let s = eval('`' + defaultValue + '`')
				subObject = s
			} else {
				subObject = defaultValue
			}
		} else {
			subObject = defaultValue
		}
	}
	return subObject
}

function getFormData(divId) {
	let liste = document.querySelectorAll(`${divId} input, select, div`)
	let obj = {}
	let i = 0
	while (i < liste.length) {
		let e = liste[i]
		if (e.getAttribute('data-field')) {
			let key = e.getAttribute('data-field')
			let dataType = e.getAttribute('data-type') || ''
			if (key) {
				if (key.indexOf('.-1.') < 0) {
					if (['number', 'money', 'total', 'quantity', 'amount', 'price'].includes(dataType)) {
						obj[key] = Number(e.value)
					} else if (dataType == 'code') {
						obj[key] = e.editor.getValue()
					} else if (dataType == 'boolean') {
						if (e.type == 'checkbox') {
							obj[key] = e.checked
						} else {
							obj[key] = Boolean(e.value)
						}
					} else {
						obj[key] = e.value
					}
				}
			}
		}
		i++
	}
	return listObjectToObject(obj)
}

// function getFormData1111(divId) {
// 	let obj = listObjectToObject($(`${divId}`).serializeArray().reduce((obj, item) => ({ ...obj, ...{
// 			[item.name.replaceAll('[', '.').replaceAll(']', '')]: item.value } }), {}))
// 	$(`${divId} input[type=checkbox]`).each(function() {
// 		if(this.name) {
// 			let key = this.name
// 			key = key.replaceAll('[', '').replaceAll(']', '.')
// 			if(key.substr(-1) == '.') {
// 				key = key.substr(0, key.length - 1)
// 			}
// 			obj[key] = this.checked
// 		}
// 	})
// 	return obj
// }

function getRemoteData(item) {

	return new Promise((resolve, reject) => {

		let data = item.value || ''

		if (item.value == undefined) {
			switch (item.type) {
				case 'grid':
					data = []
					let ps = pageSettings.getItem(`pageSize`)
					if (ps) {
						hashObj.query.pageSize = ps
						setHashObject(hashObj)
					}
					break
				case 'form':
					data = {}
					break
				case 'filter':
					data = {}
					break

				case 'number':
				case 'money':
					data = 0
					break
				case 'boolean':
					data = false
					break
				default:
					data = ''
					break
			}

		}

		if (item.dataSource == undefined) {
			return resolve(data)
		}

		let url = ''
		if (hashObj.func == 'print') {
			url = item.dataSource.printUrl || item.dataSource.url || ''
		} else {
			url = item.dataSource.url || ''
		}

		let bHashParamsEkle = false
		if (hashObj.func == 'addnew') {
			return resolve(item)
		} else {
			if (hashObj.id) {
				url = `${url.split('?')[0]}/${hashObj.id}`
				if (url.split('?')[1]) {
					url += '?' + url.split('?')[1]
				}
			}
		}
		let filterString = ''
		Object.keys(hashObj.query).forEach((key) => {
			if (key != 'mid') {
				if (filterString != '')
					filterString += '&'
				filterString += `${key}=${encodeURIComponent2(hashObj.query[key])}`
			}
		})
		if (filterString != '') {
			url += `${url.indexOf('?') > -1 ? '&' : '?'}${filterString}`
		}

		if ((url || '') == '')
			return resolve(data)

		postMan(url, { type: item.dataSource.method || 'GET', dataType: 'json' })
			.then(resolve)
			.catch(reject)

	})
}


function cariKart_changed(prefix) {
	if (prefix.indexOf('.party.') < 0)
		prefix += '.party.'
	let fieldList = [
		"person.firstName.value",
		"person.familyName.value",
		"partyIdentification.0.ID.value",
		"partyIdentification.0.ID.attr.schemeID",
		"partyTaxScheme.taxScheme.name.value",
		"postalAddress.streetName.value",
		"postalAddress.buildingNumber.value",
		"postalAddress.buildingName.value",
		"postalAddress.blockName.value",
		"postalAddress.room.value",
		"postalAddress.citySubdivisionName.value",
		"postalAddress.district.value",
		"postalAddress.cityName.value",
		"postalAddress.region.value",
		"postalAddress.country.identificationCode.value",
		"postalAddress.country.name.value",
		"postalAddress.postalZone.value",
		"contact.telephone.value",
		"contact.telefax.value",
		"contact.electronicMail.value",
		"websiteURI.value"
	]

	let cari = $(`#${generateFormId(prefix + '_id')}-obj`).val()
	if (cari == undefined)
		return
	let obj = JSON.parse(decodeURIComponent(cari))


	fieldList.forEach((e) => {
		let componentFieldName = `${prefix}${e}`

		let value = getPropertyByKeyPath(obj, e)
		if (value != undefined) {
			if ($(`#${generateFormId(componentFieldName)}`).val() != undefined) {
				$(`#${generateFormId(componentFieldName)}`).val(value)
			}
		}
	})

	if (($(`#${generateFormId(prefix + 'postalAddress.country.identificationCode.value')}`).val() || '') == '') {
		$(`#${generateFormId(prefix + 'postalAddress.country.identificationCode.value')}`).val('TR')

	}
}

function countryCode_changed(prefix) {
	let fieldName = `${prefix}postalAddress.country.identificationCode.value`
	let fieldNameCountryName = `${prefix}postalAddress.country.name.value`
	let countryCode = $(`#${generateFormId(fieldName)}`).val() || ''
	let countryText = $(`#${generateFormId(fieldName)} option:selected`).text() || ''

	if (countryCode != '') {
		$(`#${generateFormId(fieldNameCountryName)}`).val(countryText)

	}
}


function formSave(dataSource, formData, returnUrl = '') {
	let url = dataSource.url
	let method = 'GET'
	if (hashObj.func == 'addnew') {
		method = 'POST'
	} else if (hashObj.func == 'edit' && hashObj.id) {
		method = 'PUT'
		url = `${url.split('?')[0]}/${hashObj.id}`
		if (url.split('?')[1]) {
			url += '?' + url.split[1]
		}
	} else {
		method = 'PUT'
	}

	if (method == 'POST')
		pageSettings.setItem('lastRecord', formData)


	postMan(url, { type: method, data: formData, dataType: 'json' })
		.then(data => {
			if (hashObj.func == 'index') {
				alertX('Kayıt başarılı :-)')
			} else {
				if (returnUrl) {
					window.location.href = returnUrl
				} else {
					let beforeHash = location.hash
					let h = Object.assign({}, hashObj, { func: 'index', query: { page: 1 } })

					setHashObject(h)
					let afterHash = location.hash

					if (afterHash == beforeHash) {
						location.reload()
					}
				}
			}
		})
		.catch(showError)
}

function collectFieldList(item) {
	let fieldList = {}
	if (item.tabs) {
		item.tabs.forEach((tab) => {
			if (tab.fields) {
				let f = collectFieldList(tab.fields)
				fieldList = Object.assign({}, fieldList, f)
			}
		})

	} else if (item.fields) {

		Object.keys(item.fields).forEach((key) => {
			if (item.fields[key].fields) {
				let f = collectFieldList(item.fields[key])

				if (item.fields[key].type == 'grid') {

					Object.keys(f).forEach((k) => {
						f[k].id = f[k].id || generateFormId(key + '.' + k)
						f[k].name = f[k].name || generateFormName(key + '.' + k)
					})
					let f2 = {}
					f2[key] = f
					fieldList = Object.assign({}, fieldList, f2)
				} else {
					Object.keys(f).forEach((k) => {
						f[k].id = f[k].id || generateFormId(k)
						f[k].name = f[k].name || generateFormName(k)
					})
					fieldList = Object.assign({}, fieldList, f)
				}

			} else {
				fieldList[key] = item.fields[key]
				fieldList[key].id = fieldList[key].id || generateFormId(key)
				fieldList[key].name = fieldList[key].name || generateFormName(key)
			}
		})
	}
	return fieldList
}


function refreshRemoteList(remoteList) {
	Object.keys(remoteList).forEach((e) => {
		let idList = []
		Object.keys(remoteList[e].list).forEach((key) => {
			idList.push(key)
		})

		let url = `${remoteList[e].dataSource.url.split('?')[0]}/${idList.join(',')}`
		let labelStr = remoteList[e].dataSource.label || '${name}'
		postMan(url, { type: 'GET' })
			.then(result => {
				let dizi = []
				if (result) {
					if (result.docs != undefined) {
						result.docs.forEach((e) => {
							let text = htmlEval(labelStr, e)
							dizi.push({ label: text, value: text, obj: e })
						})
					} else {
						if (Array.isArray(result)) {
							result.forEach((e) => {
								let text = htmlEval(labelStr, e)
								dizi.push({ label: text, value: text, obj: e })
							})
						} else {
							let text = htmlEval(labelStr, result)
							dizi.push({ label: text, value: text, obj: result })
						}
					}
				}
				Object.keys(remoteList[e].list).forEach((key) => {
					dizi.forEach((d) => {
						if (d.obj._id == key) {
							remoteList[e].list[key].text = htmlEval((remoteList[e].html || remoteList[e].dataSource.label || '${name}'), d.obj)
							remoteList[e].list[key].label = htmlEval((remoteList[e].dataSource.label || '${name}'), d.obj)
							$(remoteList[e].list[key].cellId).html(remoteList[e].list[key].text)
							if (remoteList[e].list[key].lookupTextField) {
								$(`input[name="${remoteList[e].list[key].lookupTextField}"]`).val(d.value)
							}
						}
					})
				})
			})
			.catch(console.error)
	})
}

var keyupTimer = 0
var timerActive = false

function runTimer(selector, prefix = '') {
	if (keyupTimer == 0) {
		timerActive = false
		return
	}

	if (keyupTimer >= 3) {
		keyupTimer = 0
		timerActive = false
		runFilter(selector, prefix)
	} else {
		timerActive = true
		setTimeout(() => {
			keyupTimer++

			runTimer(selector, prefix)


		}, 800)
	}
}

function runFilter(selector, prefix = '') {
	let h = getHashObject()
	let obj = getDivData(selector, prefix)
	if (obj) {
		obj = objectToListObject(obj)
	}

	Object.keys(obj).forEach((key) => {
		if (h.query[key] != undefined && obj[key] == '') {
			h.query[key] = undefined
			delete h.query[key]
		} else {
			if (obj[key] != '') {
				h.query[key] = obj[key]
			}
		}
	})
	if (h.query.page) {
		h.query.page = 1
	}

	let bFarkli = false
	if (Object.keys(h.query).length != Object.keys(hashObj.query).length) {
		bFarkli = true
	} else {
		Object.keys(h.query).forEach((key) => {
			if (h.query[key] != hashObj.query[key]) {
				bFarkli = true
				return
			}
		})
	}


	if (!bFarkli) {
		window.onhashchange()
	} else {
		setHashObject(h)
	}
}






function menuLink(path, filter) {
	let s = `#${path}`
	if (!filter) {
		filter = {}
	}
	if (filter) {
		let filterString = ''
		Object.keys(filter).forEach((key) => {
			if (filterString != '')
				filterString += '&'
			filterString += `${key}=${encodeURIComponent2(filter[key])}`
		})
		s += '?' + filterString
	}
	return s
}

function openPage(url, title) {
	history.pushState('', 'New Page Title', '${s}')
}

var q = getAllUrlParams()

function getAllUrlParams(query = null) {
	let q = {}
	let queryString = query || window.location.search
	if (queryString.substr(0, 1) != '?') {
		queryString = '?' + queryString
	}
	let dizi = queryString.split('&')
	dizi.forEach((d) => {
		let key = d.split('=')[0]
		if (key[0] == '?')
			key = key.substr(1)

		let value = getUrlParameter(key, queryString)

		if (value != '') {

			q[key] = value
		}
	})
	return q
}

function getUrlParameter(name, query = null) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
	let regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
	let results = regex.exec(query || location.search)

	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}


function changedb(dbId) {
	// qwerty window.location.href = `${global.basePath}/changedb?db=${dbId}&r=${window.location.href}`
}

function windowPathToFieldName(path = '') {
	if (path == '')
		path = hashObj.path
	if (path.substr(0, 1) == '/')
		path = path.substr(1)
	path = path.replaceAll('/', '_')
	path = path.replaceAll('-', '_')

	return path
}


function programButtons1111(panelButtons = '') {
	let prgButtons = []
	if (hashObj.settings) {
		prgButtons = hashObj.settings.programButtons || []
	}


	if (prgButtons.length == 0 && panelButtons == '')
		return ''

	let sbuf = `<div class="button-bar mt-0 p-1 rounded justify-content-start" role="toolbar" aria-label="Toolbar with button groups">\n`
	if (panelButtons != '')
		sbuf += panelButtons

	if (prgButtons.length > 0) {
		prgButtons.forEach((e) => {
			if (e.passive == false) {
				let icon = ''
				let text = e.text || ''
				if ((e.icon || '') != '') {
					icon = e.icon
				} else {
					switch (e.program.type) {
						case 'file-importer':
							icon = 'fas fa-file-import'
							break
						case 'file-exporter':
							icon = 'fas fa-file-export'
							break
						case 'connector-importer':
							icon = 'fas fa-cloud-upload-alt'
							break

						case 'connector-exporter':
							icon = 'fas fa-cloud-download-alt'
							break

						case 'email':
							icon = 'fas fa-envelope-square'
							break

						case 'sms':
							icon = 'fas fa-sms'
							break
					}
				}
				sbuf += `<a class="${e.class || 'btn btn-primary'} me-2" href="javascript:runProgram('${e.program._id}','${e.program.type}')" title="${text}">${icon != '' ? '<i class="' + icon + '"></i>' : ''} ${text}</a>\n`
			}
		})
	}
	sbuf += `
	<input type="file" name="fileUpload" id="fileUpload" style="visibility:hidden;" accept="*.*" multiple>
	</div>
	`
	return sbuf
}

function programFileUploaderChangeEvent() {

	$("#fileUpload").change(function () {
		let reader = new FileReader()
		let fileIndex = 0
		let files = this.files
		let uploadFiles = []
		reader.addEventListener("load", function () {

			if (reader.result) {
				uploadFiles[uploadFiles.length - 1].data = reader.result.split('base64,')[1]
			}
			fileIndex++
			runReader()
		})

		function runReader() {
			if (fileIndex >= files.length) {
				document.dispatchEvent(new CustomEvent("file-upload-finished", { detail: uploadFiles }))
				return
			}
			let file = files[fileIndex]
			uploadFiles.push({ name: file.name, modifiedDate: file.lastModifiedDate, size: file.size, data: '' })

			reader.readAsDataURL(file)
		}

		runReader()
	})
}

var programId = ''
var programType = ''

document.addEventListener('file-upload-finished', function (event) {
	let data = { files: event.detail }
	console.log(`document.addEventListener('file-upload-finished' data:`, data)
	runProgramAjax(data)
})

function runProgram(_id, type) {
	programId = _id
	programType = type
	if (type == 'file-importer') {
		$('#fileUpload').trigger('click')
		return
	}
	let list = []

	$(".checkSingle").each(function () {
		if (this.checked) {
			list.push({ _id: this.value })
		}
	})
	if (list.length == 0)
		return alertX('Hiç kayıt seçilmemiş')
	let data = { list: list }
	runProgramAjax(data)
}

function runProgramAjax(data) {
	postMan(`/dbapi/programs/run/${programId}`, { type: 'POST', dataType: 'json', data: data })
		.then(data => {
			if (typeof data == 'string') {
				if (programType == 'file-exporter') {
					download(`data:application/file;base64,${btoa2(data)}`, `export_${(new Date()).yyyymmddhhmmss()}.csv`, 'application/file')
					return
				} else if (programType == 'connector-exporter') {
					alertX(data, 'Bilgi', () => { window.onhashchange() })
				} else {
					alertX(data, 'Bilgi', () => { window.onhashchange() })
				}
			} else {
				alertX(data, 'Bilgi', () => { window.onhashchange() })
			}

		})
		.catch(showError)
}

function runPanelButtons(url, method) {

	let list = []

	$(".checkSingle").each(function () {
		if (this.checked) {
			list.push({ _id: this.value })
		}
	})
	if (list.length == 0)
		return alertX('Hiç kayıt seçilmemiş')
	let data = { list: list }

	postMan(url, { type: 'POST', dataType: 'json', data: data })
		.then(data => {
			alertX(data, () => window.onhashchange())
		})
		.catch(showError)
}



function frameYazdir(frameId) {
	let mainCtrl = document.querySelector(frameId)
	if (!mainCtrl) {
		console.log(`HATA: ${frameId} Bulunamadi`)
	}
	let iframe = mainCtrl.contentWindow || (mainCtrl.contentDocument.document || mainCtrl.contentDocument)

	iframe.focus()
	iframe.print()
}


function pencereyiKapat() {
	window.open('', '_parent', '');
	window.close()
}


function getPageSettings(module) {
	return {}
	// if(!global.settings)
	// 	return {}
	// let obj = global.settings.find((e) => {
	// 	if(e.module == module) {
	// 		return true
	// 	} else {
	// 		return false
	// 	}
	// })

	// return obj || {}
}

moment.updateLocale('en', {
	relativeTime: {
		future: "in %s",
		past: "%s önce",
		s: 'birkaç saniye',
		ss: '%d saniye',
		m: "bir dakika",
		mm: "%d dakika",
		h: "bir saat",
		hh: "%d saat",
		d: "bir gün",
		dd: "%d gün",
		w: "bir hafta",
		ww: "%d hafta",
		M: "bir ay",
		MM: "%d ay",
		y: "bir yıl",
		yy: "%d yıl"
	}
})


function initIspiyonService() {
	if (!global.ispiyonServiceUrl)
		return
	try {
		let socket = io(global.ispiyonServiceUrl, {
			reconnection: false,
			reconnectionDelay: 120000,
			reconnectionDelayMax: 300000
		})
		socket.on('connect', () => {
			socket.emit('I_AM_HERE', global.token, global.dbId)

		})

		socket.on('error', function (err) {
			console.log('socket io hatasi');
		})

		socket.on('connect_error', function (err) {
			console.log('Error connecting to server');
		})

		socket.on('TOTAL_UNREAD', (count, lastNotifications) => {

			if (Number(count) > 0) {
				$('#unread-notification-count').html(count)
				global.lastNotifications = lastNotifications
			} else {
				$('#unread-notification-count').html('')
				global.lastNotifications = []
			}
		})

		socket.on('NOTIFY', (text, status, icon) => {
			let message = SnackBar({
				message: (text || '').substr(0, 500),
				status: status || 'orange',
				dismissible: true,
				timeout: 3000
			})
		})
		socket.on('message', data => {
			console.log('serverdan gelen mesaj:', data)
		})

		$(document).ready(() => {

			$('#alertsDropdown').on('shown.bs.dropdown', () => {

				let s = ``
				if (global.lastNotifications) {
					global.lastNotifications.forEach((e, index) => {
						s += notificationItem(e._id, e.createdDate, e.text, e.status, e.icon)
					})
				}
				$('#last-notifications').html(s)
				$('#unread-notification-count').html('')
				global.lastNotifications = []
				socket.emit('READ_ALL') //, global.token,global.dbId)

			})

			$('#alertsDropdown').on('hidden.bs.dropdown', () => {

			})

		})
	} catch { }
}

function notificationItem(id, notifyDate, text, status, icon) {
	let bgClass = 'bg-primary'
	switch (status || '') {
		case 'success':
			bgClass = 'bg-primary'
			icon = icon || 'fas fa-bell'
			break
		case 'error':
			bgClass = 'bg-danger'
			icon = icon || 'fas fa-times'
			break
		case 'warning':
			bgClass = 'bg-warning'
			icon = icon || 'fas fa-exclamation-triangle'
			break
	}
	let s = `
	<a id='${id}' class="notification-dropdown-item dropdown-item d-flex align-items-center" href="#">
	<div class="me-3">
	<div class="icon-circle ${bgClass}">
	<i class="${icon ? icon : 'fas fa-bell'} text-white"></i>
	</div>
	</div>
	<div  class="text-truncate" style="max-width:300px" >
	<div class="small text-gray-500">${moment(notifyDate).fromNow()}</div>
	<span>${text}</span>
	</div>
	</a>
	`
	return s
}

function notifyMe(text, status) {
	let message = SnackBar({
		message: text,
		status: status || 'orange',
		dismissible: true,
		timeout: 3000
	})

}

function formCalculation(divId, calcUrl) {
	if (!calcUrl) return
	$(`${divId} .formatted-number`).each(function () {
		let sbuf = $(this).val()
		$(this).attr('type', 'number')
		$(this).val(convertNumber(sbuf))
	})
	let formData = getFormData(`${divId}`)
	postMan(calcUrl, { type: 'POST', dataType: 'json', data: formData })
		.then(data => setFormData(divId, data))
		.catch(showError)

}

function setFormData(divId, data) {
	let elemanlar = document.querySelectorAll(`${divId} input, select`)
	let i = 0
	while (i < elemanlar.length) {
		let el = elemanlar[i]
		if (el.name) {
			if (el.name.indexOf('[-1]') < 0) {
				let fieldName = generateFieldName(el.name)

				if (el.type == 'checkbox') {
					let value = getPropertyByKeyPath(data, fieldName, el.checked)
					if (value != undefined) {
						el.checked = value
					}
				} else {
					let value = getPropertyByKeyPath(data, fieldName, el.value)
					if (value != undefined) {
						el.value = value
					}
				}
			}
		}
		i++
	}

	let j = 0
	let gridler = document.querySelectorAll(`${divId} div[data-type="grid"]`)
	while (j < gridler.length) {
		let table = gridler[j]
		if (table.item && table.id) {
			if (table.item.parentField) {
				table.item.value = getPropertyByKeyPath(data, table.item.parentField) || []
				gridBody(`${divId} #${table.id}`, table.item, false, () => { })
			}
		}

		j++
	}

}

function generateFieldName(name) {
	let s = name.replaceAll('][', '.').replaceAll('[', '.').replaceAll(']', '')

	return s
}

function getUrlInfo(href = window.location.href) {
	let match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
	return match && {
		href: href,
		protocol: match[1],
		host: match[2],
		hostname: match[3],
		port: match[4],
		pathname: match[5],
		search: match[6],
		hash: match[7]
	}
}

function calculate(formula, values) {
	if ((formula || '') == '')
		return 0
	formula = formula.replaceAll('${', '{').replaceAll('{', '${')
	let code = `(function(){
	`
	Object.keys(values).forEach((key) => {
		code += `let ${key}=${JSON.stringify(values[key])}\n`
	})

	code += `return eval(\`${formula}\`)
	})()`

	return eval(code)
}





function enterNext(bu) {

	if (bu == undefined)
		bu = this
	var self = $(bu),
		form = self.parents('form:eq(0)'),
		focusable, next
	focusable = form.find('input,a,select,button,textarea').filter(':visible')
	next = focusable.eq(focusable.index(bu) + 1)
	if (next.length) {

		var readonly = next.prop('readonly') || false
		var disabled = next.prop('disabled') || false
		var cl = next.prop('class') || ''

		if (cl.indexOf('btn-collapse') > -1 || cl.indexOf('skip-enter-next') > -1 || cl.indexOf('no-enter-next') > -1)
			return enterNext(next)

		if (readonly || disabled)
			return enterNext(next)



		next.focus()
		if (typeof next.select === 'function')
			next.select()
	} else {
		//form.submit()
	}
	return false
}

function keyEnter(e, next) {
	if (e) {
		if (e.key) {
			if (e.key === "Enter") {
				next()
			}
		}
	}
}

function hahamInclude() {
	var z, i, elmnt, file, xhttp
	z = document.getElementsByTagName('*')
	i = 0
	while (i < z.length) {
		elmnt = z[i]
		file = elmnt.getAttribute('haham-include')
		if (file) {
			xhttp = new XMLHttpRequest()
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4) {
					if (this.status == 200) {
						// elmnt.innerHTML = this.responseText 
						elmnt.insertAdjacentHTML('beforeend', this.responseText)
					}
					if (this.status == 404) { elmnt.innerHTML = 'Page not found.' }
					elmnt.removeAttribute('haham-include')
					hahamInclude()
				}
			}
			xhttp.open("GET", file, true)
			xhttp.send()
			return
		}
		i++
	}
}


function configUI() {
	var z, i, elmnt
	z = document.getElementsByTagName('*')
	i = 0
	while (i < z.length) {
		elmnt = z[i]
		let fieldName = elmnt.getAttribute('config-ui')
		if (fieldName) {
			let s = getPropertyByKeyPath(config.ui, fieldName)
			if (s) {
				elmnt.innerHTML = htmlEval(s)
			}
			//elmnt.removeAttribute('config-ui')
		}
		i++
	}
}

function fileIcon(fileName) {
	let ext = ''
	if (fileName.indexOf('.') > -1) {
		ext = fileName.split('.')[fileName.split('.').length - 1].toLowerCase()
	}

	switch (ext) {
		case 'py':
			return 'fab fa-python'
		case 'txt':
			return 'fas fa-file-lines'
		case 'doc':
		case 'docx':
			return 'fas fa-file-word'
		case 'xls':
		case 'xlsx':
			return 'fas fa-file-excel'
		case 'csv':
			return 'fas fa-file-csv'
	}

	return 'fas fa-file'
}