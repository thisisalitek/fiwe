var rootGridId = 0
var remoteList = {}
let bSayfaAciliyor = false



function findPageObject() {
	changeDocumentTitle(hashObj.title)
	$('#pageTitle').html(`<i class="${hashObj.icon}"></i> ${hashObj.breadCrumbsHtml}`)
	var sayfa = getPropertyByKeyPath(global.pages, hashObj.pathKey)
	if (!sayfa)
		return null
	var resp
	switch (hashObj.func) {
		case 'edit':
			resp = sayfa.edit || sayfa.form
			break
		case 'view':
			resp = sayfa.view || sayfa.edit || sayfa.form || null
			break
		case 'print':
			resp = sayfa.print || sayfa.edit || sayfa.form || null
			break
		case 'addnew':
			resp = sayfa.addnew || sayfa.form || null
			break

		case '':
		case 'index':
			resp = sayfa.index || null
			break
		default:
			resp = sayfa[hashObj.func] || null
			break
	}
	return resp
}

function changeDocumentTitle(title) {
	let brand = ''
	let ayraclar = [' - ', ' | ', ' . ']
	let sep = ''
	ayraclar.forEach((e) => { if (document.title.indexOf(e) > -1) sep = e })
	if (sep == '') {
		brand = document.title
		sep = ' - '
	} else {
		brand = document.title.split(sep)[1]
	}
	document.title = `${hashObj.title}${sep}${brand}`
}


function publishPage(divId, before, after) {
	if (bSayfaAciliyor)
		return
	bSayfaAciliyor = true
	if (before) before()
	let sayfa = findPageObject()
	if (sayfa) {

		generatePage(divId, sayfa, () => {
			bSayfaAciliyor = false
			if (after) after()
		})

	} else {
		$(divId).html('sayfa bulunamadi')
		bSayfaAciliyor = false
		if (after) after()
	}
}


function generatePage(divId, pageJson, callback) {
	$(divId).html('')
	$(divId).hide()
	//	try {
	let dizi = []
	if (Array.isArray(pageJson)) {
		dizi = pageJson
	} else {
		dizi.push(pageJson)
	}


	let index = 0
	rootGridId = 0
	remoteList = {}

	function calistir(cb) {
		if (index >= dizi.length) {
			return cb()
		}

		let pageSubObj = clone(dizi[index])
		pageSubObj.level = 0


		headerButtons(divId, pageSubObj)
		getRemoteData(pageSubObj)
			.then(data => {
				switch ((pageSubObj.type || '')) {
					case 'filter':
						generateControl(divId, pageSubObj, data, false, (err) => {
							if (!err) {
								document.querySelector(`${divId} #filterForm`).insertAdjacentHTML('beforeend', `${filterFormButton('#filterForm')}`)
							}
							index++
							setTimeout(calistir, 0, cb)
						})
						break



					case 'grid':
						generateControl(divId, pageSubObj, data, false, (err) => {
							index++
							setTimeout(calistir, 0, cb)
						})
						break

					default:
						generateControl(divId, pageSubObj, data, false, (err) => {
							index++
							setTimeout(calistir, 0, cb)
						})
						break
				}
			})
			.catch(cb)
	}

	calistir((err) => {
		if (err) {
			$(divId).html(`Hata:${err.code || err.name || ''} ${err.message || ''}`)
			if (err.code == 'SESSION_NOT_FOUND') {
				confirmX('Oturum sonlandırılmış. Yeniden giriş yapmak istiyor musunuz?', (answer) => {
					if (answer) {
						window.location.href = `/login?ret=${window.location.href}`

					}
					if (callback)
						return callback()
				})
			}
		}
		loadCardCollapses()

		$(document).trigger('loaded')
		$(divId).show()
		if (callback)
			return callback()
	})

}


function headerButtons(divId, pageSubObj) {
	let hbtn = ``
	if (hashObj.query.view === 'plain') {
		hbtn = `<a class="btn btn-dark btn-form-header ms-2" href="javascript:pencereyiKapat()"><i class="fas fa-times"></i> Kapat</a>`
	} else {
		if (pageSubObj.type == 'form' && pageSubObj.dataSource) {
			let backLink = 'javascript:history.back(-1)'
			if (pageSubObj.options && pageSubObj.options.returnUrl) {
				backLink = pageSubObj.options.returnUrl
			}
			hbtn = `<button id="headerButtonSave" class="btn btn-outline-light btn-form-header ms-2" title="Kaydet"><i class="fas fa-save"></i></button>
			<a href="${backLink}" class="btn btn-outline-dark  btn-form-header ms-2" title="Vazgeç"><i class="fas fa-reply"></i></a>`


			if (hashObj.func == 'view') {
				hbtn = `<a href="${backLink}" class="btn btn-outline-dark btn-form-header ms-2" title="Vazgeç"><i class="fas fa-reply"></i></a>`
			}
		}
	}

	$('#headerButtons').html(hbtn)

	$('#headerButtonSave').on('click', () => {
		formKaydet(pageSubObj.dataSource, divId, (pageSubObj.options ? pageSubObj.options.returnUrl || '' : ''))
	})
}

function generateControl(divId, item, data, insideOfModal, callback) {
	let autocol = item.options ? (item.options.autocol === true ? true : false) : false
	let queryValues = item.options ? (item.options.queryValues === true ? true : false) : false

	if (item.type == 'widget') {
		item = generateWidget(item)

	}


	item = itemLevels(item, item.level)
	item = itemHtmlCode(item)

	if (item.level == 0) item.pageFormId = divId

	// if(item.script) {
	// 	$(divId).append(`<script type="text/javascript">${item.script}</script>`)
	// }

	if (item.fields) {
		Object.keys(item.fields).forEach((key) => {

			item.fields[key].field = key
			item.fields[key].pageFormId = item.pageFormId || ''
			item.fields[key] = itemDefaultValues(item.fields[key], autocol, insideOfModal, queryValues)

			if (item.fields[key].type == 'grid') {
				item.fields[key].parentField = key
			} else if (item.fields[key].type == 'widget') {

			}
		})
	} else if (item.tabs) {
		item.tabs.forEach((tab) => {
			tab.pageFormId = item.pageFormId || ''

			if (tab.fields) {
				Object.keys(tab.fields).forEach((key) => {
					tab.fields[key].field = key
					tab.fields[key] = itemDefaultValues(tab.fields[key], autocol, insideOfModal, queryValues)
					tab.fields[key].pageFormId = tab.pageFormId || ''
					if (tab.fields[key].type == 'grid') {

						tab.fields[key].parentField = key

					}
				})
			}
		})
	} else {
		item = itemDefaultValues(item, autocol, insideOfModal, queryValues)
	}

	item.insideOfModal = insideOfModal

	if (item.script) {
		$(divId).append(`<script type="text/javascript">${item.script}</script>`)
	}

	switch ((item.type || '').toLowerCase()) {

		case 'hidden':
			item.value = getPropertyByKeyPath(data, item.field, item.value)
			frm_InputHidden(divId, item, cb)
			break
		case 'string':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_TextBox(divId, item, cb)
			break
		case 'number':
			item.value = getPropertyByKeyPath(data, item.field, item.value)
			if (item.value == undefined) {
				item.value = 0
			}
			frm_NumberBox(divId, item, cb)
			break

		case 'money':
		case 'quantity':
		case 'amount':
		case 'price':
			if (item.class.indexOf('text-end') < 0)
				item.class += ' text-end'
			if (item.readonly) {
				let buf = getPropertyByKeyPath(data, item.field, item.value) || 0
				item.value = Number(buf).formatMoney(item.round || 2)
				frm_FormattedNumberBox(divId, item, cb)
			} else {
				item.value = getPropertyByKeyPath(data, item.field, item.value) || 0
				frm_FormattedNumberBox(divId, item, cb)
			}
			break

		case 'total':
			if (item.class.indexOf('text-end') < 0)
				item.class += ' text-end'
			if (item.readonly) {
				let buf = getPropertyByKeyPath(data, item.field, item.value) || 0
				item.value = Number(buf).formatMoney(item.round || 2)


				frm_TotalBox(divId, item, cb)
			} else {
				item.value = getPropertyByKeyPath(data, item.field, item.value) || 0

				frm_TotalBox(divId, item, cb)
			}
			break

		case 'identity':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || 0
			item.readonly = true
			frm_NumberBox(divId, item, cb)
			break
		case 'date':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_DateBox(divId, item, cb)
			break
		case 'time':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_TimeBox(divId, item, cb)
			break
		case 'filebase64image':
		case 'image':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_ImageBox(divId, item, cb)
			break
		case 'filebase64':
		case 'file':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_FileBox(divId, item, cb)
			break
		case 'strings':
		case 'textarea':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_TextareaBox(divId, item, cb)
			break
		case 'code':
			// item.rows = item.rows || 40
			// item.encoding = item.encoding || 'base64'
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_CodeEditor(divId, item, cb)
			break
		case 'codefiles':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_CodeFiles(divId, item, cb)
			break
		case 'json':
			item.rows = item.rows || 40
			item.encoding = item.encoding || 'base64'
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_CodeEditor(divId, item, cb)
			break

		case 'button':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_Button(divId, item, cb)
			break
		case 'lookup':

			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_Lookup(divId, item, cb)
			break
		case 'html':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_FormHtml(divId, item, cb)
			break
		case 'label':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_Label(divId, item, cb)
			break
		case 'info':
		case 'alert':
		case 'warning':
		case 'danger':
		case 'check':
		case 'success':
		case 'light':
		case 'dark':
		case 'primary':
		case 'secondary':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_Alert(divId, item, cb)
			break
		case 'remotelookup':
			item.value = getPropertyByKeyPath(data, item.field, item.value)
			if (item.lookupTextField) {
				item.valueText = getPropertyByKeyPath(data, item.lookupTextField) || item.valueText || ''
			}
			frm_RemoteLookup(divId, item, cb)
			break
		case 'boolean':
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_CheckBox(divId, item, cb)
			break
		case 'daterange':
			frm_DateRangeBox(divId, item, cb)
			break
		case 'w-100':
		case 'w100':
		case 'divisor':
			document.querySelector(divId).insertAdjacentHTML('beforeend', `<div class="w-100"></div>`)
			cb()
			break
		case 'grid':
			if (item.level == 0) {
				item.value = data
				grid(divId, item, insideOfModal, cb)
			} else {
				item.value = getPropertyByKeyPath(data, item.field, [])
				grid(divId, item, insideOfModal, cb)
			}
			break
		case 'excel':
			item.value = getPropertyByKeyPath(data, item.field, [])
			frm_Excel(divId, item, cb)
			break
		case 'exceldata':
			item.value = getPropertyByKeyPath(data, item.field, [])
			frm_ExcelData(divId, item, cb)
			break
		case 'filter':

			if (item.fields) {
				let btnShowHide = `<a id="btnShowHideFilterForm" href="#filterForm" class="stroke-white btn-collapse collapsed" data-bs-toggle="collapse" aria-expanded="false" aria-controls="filterForm" title="Göster/gizle" ><i class="fas fa-caret-square-up"></i></a>`
				document.querySelector(divId).insertAdjacentHTML('beforeend', `<div class="col-12 p-0 position-relative">${btnShowHide}<div id="filterForm" class="row m-0 card-collapse collapse"></div></div>`)

				let dizi = Object.keys(item.fields)
				let index = 0

				function calistir1(cb1) {
					if (index >= dizi.length) {
						cb1()
					} else {
						let key = dizi[index]
						item.fields[key].value = hashObj.query[key] || item.fields[key].value || ''
						item.fields[key].showAll = true
						item.fields[key].class = 'my-3 my-md-0'
						let filterItem = item.fields[key]
						generateControl('#filterForm', filterItem, data, insideOfModal, () => {
							if (['lookup', 'boolean', 'remotelookup', 'date', 'time'].includes(filterItem.type.toLowerCase())) {
								$(`${divId} #${filterItem.id}`).on('change', () => {
									if (document.querySelector('#filterForm')) {
										keyupTimer = 0
										runFilter('#filterForm')
									}
								})
							}
							index++
							setTimeout(calistir1, 0, cb1)
						})
					}
				}

				calistir1(() => {
					cb()
				})

			} else {
				cb()
			}
			break
		case 'widgetcontrol':
		case 'tab':
		case 'form':
		case 'group':
		case 'modal':
			let dizi = []
			let index = 0

			function calistir2(fields, connDivId, cb1) {
				if (index >= dizi.length) {
					return cb1()
				}
				let key = dizi[index]

				generateControl(connDivId, fields[key], data, insideOfModal, () => {
					index++
					setTimeout(() => {
						calistir2(fields, connDivId, cb1)
					}, 0)
				})
			}


			if (item.fields) {
				dizi = Object.keys(item.fields)
				index = 0
				if (item.level == 0 || item.type == 'modal' || item.type == 'form') {
					if (document.querySelector(divId).classList.contains('row') == false) {
						document.querySelector(divId).insertAdjacentHTML('beforeend', `<div class="row m-0"></div>`)
						calistir2(item.fields, `${divId} .row`, callback)
					} else {
						calistir2(item.fields, `${divId}`, callback)
					}

				} else if (item.type == 'widgetControl') {
					if (item.grouped === true) {
						let orjinalId = item.id
						item.id = 'card-' + item.id
						frm_Card(divId, item, () => {
							calistir2(item.fields, `${divId} #${item.id}`, callback)
						})
					} else {
						calistir2(item.fields, divId, callback)
					}

				} else {
					let orjinalId = item.id
					item.id = 'card-' + item.id
					frm_Card(divId, item, () => {
						calistir2(item.fields, `${divId} #${item.id}`, callback)
					})
				}
			} else if (item.tabs) {
				item.id = item.id || 'tabForm'
				item.tabs.forEach((tab, tabIndex) => {
					tab.id = tab.id || `${item.id}_tab${tabIndex}`
				})

				frm_Tab(divId, item, () => {
					let tabIndex = 0

					function calistirTab(cb1) {
						if (tabIndex >= item.tabs.length) {
							return cb1()
						}
						let tab = item.tabs[tabIndex]
						if (tab.fields) {
							dizi = Object.keys(tab.fields)
							index = 0
							calistir2(tab.fields, `${divId} #${tab.id}`, () => {
								tabIndex++
								setTimeout(calistirTab, 0, cb1)
							})
						} else {
							tabIndex++
							setTimeout(calistirTab, 0, cb1)
						}
					}

					calistirTab(callback)
				})
			}


			break

		default:
			item.value = getPropertyByKeyPath(data, item.field, item.value) || ''
			frm_TextBox(divId, item, cb)
			break
	}


	function cb() {
		if (item.html && !item.insideOfGrid) {
			document.querySelector(divId).insertAdjacentHTML('beforeend', item.html)
		}


		callback()
	}
}



function itemLevels(item, level = 0) {
	if (Array.isArray(item)) {
		item.forEach((e) => {
			e = itemLevels(e, level + 1)
		})
		return item
	} else if (typeof item == 'object' && item != null) {
		item.level = level
		if (item.fields != undefined) {
			Object.keys(item.fields).forEach((key) => {
				item.fields[key] = itemLevels(item.fields[key], level + 1)
			})
		}
		if (item.modal != undefined) {
			item.modal = itemLevels(item.modal, level + 1)
		}
		if (item.tabs != undefined) {
			item.tabs.forEach((tab) => {
				tab.level = level
				tab = itemLevels(tab, level)
			})
		}
		return item
	} else {
		return item
	}
}

function generateWidget(item) {
	if (!item.widget)
		return item

	if (!global.widgets[item.widget])
		return item

	let widget = clone(global.widgets[item.widget])

	Object.assign(item, widget)

	item.type = 'widgetControl'
	item.dataType = 'widgetControl'

	if ((item.prefix || '') != '') {
		let copyItem = {}
		Object.keys(item).forEach((key) => {
			if (key != 'fields') {
				let yeniKey = htmlEval(key, { prefix: item.prefix })
				copyItem[yeniKey] = item[key]
			}
		})
		if (item.fields != undefined) {
			copyItem.fields = {}
			Object.keys(item.fields).forEach((key) => {
				let yeniKey = htmlEval(key, { prefix: item.prefix })
				copyItem.fields[yeniKey] = item.fields[key]
				Object.keys(copyItem.fields[yeniKey] || {}).forEach((key2) => {
					if (typeof copyItem.fields[yeniKey][key2] == 'string') {
						let yeniDeger = htmlEval(copyItem.fields[yeniKey][key2], { prefix: item.prefix })
						copyItem.fields[yeniKey][key2] = yeniDeger
					}
				})
			})

		}
		return copyItem
	} else {
		return item
	}
}


function generateWidget222(item) {
	if (!item.widget)
		return item
	if (!global.widgets[item.widget])
		return item

	let prefix = item.prefix || ''
	let widget
	let cloneWidget = clone(global.widgets[item.widget])
	cloneWidget.level = item.level

	if (prefix == '') {
		widget = cloneWidget
	} else {
		widget = widgetPrefixDuzelt(cloneWidget, { prefix: prefix })
	}


	Object.assign(widget, item)
	widget.type = 'widgetControl'
	console.log(`widget:`, widget)
	return widget
}

function widgetPrefixDuzelt2222(itemWidget, valueObj) {
	if (!itemWidget.fields)
		return itemWidget
	let obj = {}

	Object.keys(itemWidget).forEach((key) => {
		if (key != 'fields') {
			// obj[key]={}
			// obj[key]=Object.assign({},obj[key],itemWidget[key])
			obj[key] = clone(itemWidget[key])
		}
	})

	obj.level = itemWidget.level || 0
	obj.fields = {}
	Object.keys(itemWidget.fields).forEach((key) => {
		let yeniKey = htmlEval(key, valueObj)
		if (itemWidget.fields[key].type != 'widget') {
			if (itemWidget.fields[key].fields != undefined) {
				obj.fields[yeniKey] = widgetPrefixDuzelt(itemWidget.fields[key], valueObj)
				obj.fields[yeniKey].level = obj.level + 1
			} else {
				// obj.fields[yeniKey]={}
				// obj.fields[yeniKey]=Object.assign({},obj.fields[yeniKey],itemWidget.fields[key])
				obj.fields[yeniKey] = itemWidget.fields[key]
				if (typeof obj.fields[yeniKey] == 'object' && yeniKey != 'lookup') {
					obj.fields[yeniKey].level = obj.level + 1
				}
				Object.keys(obj.fields[yeniKey]).forEach((key2) => {
					if (obj.fields[yeniKey][key2]) {
						if (key2 != 'fields') {
							// if(typeof obj.fields[yeniKey][key2]==='string' && ['text','value','html'].includes(key2)) {
							obj.fields[yeniKey][key2] = htmlEval(obj.fields[yeniKey][key2], valueObj)
						}
					}
				})
			}
		}

	})
	return obj
}


function widgetPrefixDuzelt11112(itemWidget, valueObj) {
	if (!itemWidget.fields)
		return itemWidget
	let obj = { level: itemWidget.level }

	Object.keys(itemWidget).forEach((key) => {
		if (key != 'fields') {
			obj[key] = clone(itemWidget[key])
		}
	})


	obj.fields = {}
	Object.keys(itemWidget.fields).forEach((key) => {
		let yeniKey = htmlEval(key, valueObj)
		if (itemWidget.fields[key].fields != undefined) {
			obj.fields[yeniKey] = widgetPrefixDuzelt(itemWidget.fields[key], valueObj)
			obj.fields[yeniKey].level = obj.level + 1
		} else {
			obj.fields[yeniKey] = itemWidget.fields[key]
			if (typeof obj.fields[yeniKey] == 'object') {
				obj.fields[yeniKey].level = obj.level + 1
			}
			Object.keys(itemWidget.fields[key]).forEach((key2) => {
				if (key2 != 'fields') {
					itemWidget.fields[key][key2] = htmlEval(itemWidget.fields[key][key2], valueObj)
				}
			})
		}

	})
	return obj
}


function filterFormButton(divId) {

	let s = `
	<div class="col text-end p-1 pt-2 ">
	<a href="javascript:runFilter('${divId}')" class="btn btn-outline-primary text-nowrap filter-button" title="Filtrele" ><i class="fas fa-sync-alt"><i class="fas fa-filter ms-2"></i></i></a>
	</div>
	`

	return s
}

function itemDefaultValues(item, autocol = false, insideOfModal = false, queryValues = false) {
	var field = item.field || ''

	var lookupTextField = item.lookupTextField || ''
	if (item.parentField) {
		field = `${item.parentField}.${field}`
	}
	if (item.lookupTextField) {
		var lookupTextField = item.lookupTextField
		if (item.parentField) {
			lookupTextField = `${item.parentField}.${item.lookupTextField}`
		}
		item.lookupTextFieldId = generateFormId(lookupTextField)
		item.lookupTextFieldName = generateFormName(lookupTextField)

	}
	item.id = generateFormId(field)

	item.name = generateFormName(field)
	item.text = item.text || ''
	item.icon = item.icon || ''
	// if(item.title!='')
	// 	item.title=item.title.replace(/&/gim, '&amp;').replace(/</gim, '&lt;').replace(/>/gim, '&gt;')


	item.type = item.type || ''

	if (item.type == '' && item.fields) {

		item.type = 'group'
	}
	if (item.type == '' && item.tabs) {
		item.type = 'tab'
	}

	if (!isNaN(item.col)) {
		item.col = 'col-md-' + item.col
	} else {
		if (autocol) {
			switch ((item.type || '').toLowerCase()) {
				case 'identity':
					item.col = 'col-md-1'
					break
				case 'number':
				case 'money':
				case 'amount':
				case 'quantity':
				case 'price':
					item.col = 'col-md-2'
					break
				case 'remotelookup':
					item.col = 'col-md-6'
					break
				case 'lookup':
					item.col = 'col-md-2'
					if (maxLookupLength(item.lookup || {}) > 30) {
						item.col = 'col-md-4'
					}
					break
				case 'boolean':
					item.col = 'col-md-2'
					break
				case 'grid':
					item.col = 'col-md-12'
					break
				default:
					item.col = 'col-md-4'
					break
			}
		} else {
			if (item.type.toLowerCase() == 'daterange') {
				item.col = item.col || 'col-md-auto'
			} else {
				item.col = item.col || 'col-md-12'
			}

		}
	}


	item.required = item.required == undefined ? false : item.required
	item.visible = item.visible == undefined ? true : item.visible
	item.collapsed = item.collapsed == undefined ? false : item.collapsed

	if (item.lookup == undefined) {
		item.lookup = {}
	}

	if (item.staticValues) {
		item.lookup = global.staticValues[item.staticValues] || {}
	}
	item.class = item.class || ''
	item.readonly = item.readonly || false
	if (hashObj.func == 'view') {
		item.readonly = true
	}

	if (item.noGroup === true && !item.placeholder) {
		item.placeholder = item.text
	}


	item.insideOfModal = insideOfModal
	item.dataType = item.dataType || item.type || 'unknown'
	if (!item.value) {

		if (queryValues) {
			item.value = hashObj.query[item.field] || ''
		} else if (item.dataType == 'date') {
			item.value = (new Date()).yyyymmdd()
		} else if (item.dataType == 'time') {
			item.value = (new Date()).hhmmss()
		} else if (item.lastRecord === true) {
			var lastRecord = pageSettings.getItem('lastRecord')
			if (lastRecord) {
				item.value = getPropertyByKeyPath(lastRecord, item.field, item.value)
			}

		}
	}

	try {
		switch (item.dataType) {
			case 'total':
				item.round = item.round || global.numberFormats.amount.round || 2
				break
			case 'amount':
				item.round = item.round || global.numberFormats.amount.round || 2
				break
			case 'price':
				item.round = item.round || global.numberFormats.price.round || 5
				break
			case 'quantity':
				item.round = item.round || global.numberFormats.quantity.round || 3
				break
			case 'money':
				item.round = item.round || global.numberFormats.money.round || 2
				break
			default:
				item.round = item.round || 2
				break
		}
	} catch { }


	return item
}

function itemHtmlCode(item) {
	if (item.html) {
		let htmlString = ''
		if (Array.isArray(item.html)) {
			item.html.forEach((e) => {
				htmlString += e + '\n'
			})
		} else {
			htmlString = item.html
		}

		item.html = replaceUrlCurlyBracket(htmlString, item) || ''
	}
	if (item.script) {
		let scriptString = ''
		if (Array.isArray(item.script)) {
			item.script.forEach((e) => {
				scriptString += e + '\n'
			})
		} else {
			scriptString = item.script
		}
		item.script = scriptString
	}
	if (item.stylesheet) {
		if (!Array.isArray(item.stylesheet)) {
			item.stylesheet = [item.stylesheet]
		}
	}
	return item
}

function formKaydet(dataSource, divId, returnUrl = '') {
	let numberInputs = document.querySelectorAll(`${divId} .formatted-number`)
	let i = 0
	while (i < numberInputs.length) {
		let e = numberInputs[i]
		let sbuf = e.value
		e.attributes.type = 'number'
		e.value = convertNumber(sbuf)
		i++
	}

	let formData = getFormData(divId)
	formSave(dataSource, formData, returnUrl)

}

function bulkFormData(divId) {
	let numberInputs = document.querySelectorAll(`${divId} .formatted-number`)
	let i = 0
	while (i < numberInputs.length) {
		let e = numberInputs[i]
		let sbuf = e.value
		e.attributes.type = 'number'
		e.value = convertNumber(sbuf)
		i++
	}

	let formData = getFormData(divId)
	return formData
}
function itemLabelCaption(item, text = '') {
	if (item.required === true) {
		return `<span class="label-required">*${text || item.text || ''}</span>`
	} else {
		return (text || item.text || '')
	}
}