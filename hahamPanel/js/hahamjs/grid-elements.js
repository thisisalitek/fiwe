let lastRecordRow = {}
var rootGridId = 1


function grid(parentId, item, insideOfModal, cb) {
	item = gridDefaults(item, insideOfModal)
	let listCount = 0
	if (Array.isArray(item.value)) {
		listCount = item.value.length
	} else if (item.value.docs) {
		listCount = item.value.docs.length
	}

	let s = `<div class="${item.col || 'col-12'} p-1">
<div id="${item.id}" level="${item.level}" data-type="${item.dataType}" data-field="${item.field || ''}" class=" p-0 ${item.class || ''} ${item.options.show.infoRow ? 'mt-0' : ''}">
	`
	if (item.options.show.infoRow) {
		s += `
			<div class="grid-top-panel d-md-flex align-items-end">
				<div id="buttonPanel${item.id}" class="button-bar d-flex w-100"></div>
				<div class="pagination-info flex-fill d-inline-flex align-items-end ms-0 mt-3 mt-md-0 justify-content-end w-100 w-md-auto">
					<div class="input-group w-auto m-0" title="Sayfadaki kayıt sayısı" style="max-width: 220px;">
						${item.options.show.pageSize ? gridPageSize(item) : ''}
						${item.options.show.pageCount ? gridPageCount(item) : ''}
						
					</div>
					${item.options.show.pagerButtons ? gridPagerButtons(item) : ''}
					</div>
			</div>
		`
	} else {
		s += `<div id="buttonPanel${item.id}" class="button-bar"></div>`
	}
	s += `
	<div class="table-responsive">
	<table id="table${item.id}" class="table table-striped border m-0 align-middle haham-table ${item.level > 0 ? 'table-bordered' : ''}"  cellspacing="0">
	<tbody></tbody>
	</table>
	</div>
	`

	if (item.options.show.infoRow) {
		s += `
		<div class="grid-bottom-panel d-md-flex align-items-end">
			<div class="${listCount == 0 ? 'd-none' : ''}"><a class="btn btn-success btn-sm d-none d-md-block" href="javascript:gridCSVExport('${item.id}')" title="CSV indir"><i class="far fa-file-excel"></i></a>	</div>
			<div class="pagination-info flex-fill d-inline-flex align-items-end ms-0 justify-content-end w-100 w-md-auto">
				<div class="input-group w-auto m-0" title="Sayfadaki kayıt sayısı" style="max-width: 150px;">				
					${item.options.show.pageCount ? gridPageCount(item) : ''}
				</div>
				${item.options.show.pagerButtons ? gridPagerButtons(item) : ''}
			</div>
		</div>
		`
	}

	s += `</div> </div>`
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	document.querySelector(`${parentId} #${item.id}`).item = item




	gridButtonPanel(`${parentId} #buttonPanel${item.id}`, item, insideOfModal, () => {
		if (item.level == 0) {
			programFileUploaderChangeEvent()
		}
		if ($(`${parentId} #buttonPanel${item.id}`).html() == '') {
			item.options.selection = false
		}
		gridHeader(`${parentId} #${item.id}`, item, insideOfModal, () => {
			gridBody(`${parentId} #${item.id}`, item, insideOfModal, () => {

				$(`#pageSize${item.id}`).on('change', () => {
					hashObj.query.pageSize = $(`#pageSize${item.id}`).val()
					hashObj.query.page = 1
					pageSettings.setItem(`pageSize`, $(`#pageSize${item.id}`).val())
					setHashObject(hashObj)
				})

				$(`#selectAll${item.id}`).on(`change`, (e) => {
					$(`input:checkbox`).not($(`#selectAll${item.id}`)).prop(`checked`, $(`#selectAll${item.id}`).prop(`checked`))
				})

				if (pageSettings.getItem(`filterButton`) == true) {
					$(`#filterRow`).collapse('show');
				} else {
					$(`#filterRow`).collapse('hide');
				}

				$(`#filterRow`).on(`hidden.bs.collapse`, function () {
					pageSettings.setItem(`filterButton`, false)
				})
				$(`#filterRow`).on(`shown.bs.collapse`, function () {
					pageSettings.setItem(`filterButton`, true)
				})




				$(document).on('loaded', function () {

					grid_onchange(item)

				})

				cb()
			})
		})
	})
}

function gridButtonPanel(parentId, item, insideOfModal, cb) {
	let prgButtons = []
	if (hashObj.settings) {
		prgButtons = hashObj.settings.programButtons || []
	}

	if ((prgButtons.length == 0 && !item.panelButtons) || item.level > 0) {
		$(parentId).hide()
		return cb()
	}
	$(parentId).show()
	let s = ``
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
				s += `<a class="${e.class || 'btn btn-primary'} text-white stroke me-2" href="javascript:runProgram('${e.program._id}','${e.program.type}')" title="${e.text || text}">${icon != '' ? '<i class="' + icon + '"></i>' : ''} ${text}</a>`
			}
		})
	}
	s += `<input type="file" name="fileUpload" id="fileUpload" style="visibility:hidden;display:none;" accept="*.*" multiple>`
	if (item.panelButtons) {
		let dizi = Object.keys(item.panelButtons)
		let index = 0

		function calistir(cb1) {
			if (index >= dizi.length) {
				return cb1()
			}
			let key = dizi[index]
			item.panelButtons[key].noGroup = true
			item.panelButtons[key].class = item.panelButtons[key].class || 'btn btn-primary'
			item.panelButtons[key].class += ' me-2'
			item.panelButtons[key].type = 'button'
			if (!item.panelButtons[key].href && item.panelButtons[key].dataSource) {
				item.panelButtons[key].href = `javascript:runPanelButtons('${global.basePath}${item.panelButtons[key].dataSource.url}','${item.panelButtons[key].dataSource.method}')`
			}

			frm_Button(parentId, item.panelButtons[key], () => {
				index++
				setTimeout(calistir, 0, cb1)
			})
		}

		calistir(() => {
			document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
			cb()
		})

	} else {
		document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
		cb()
	}
}


function gridBody(parentId, item, insideOfModal, cb) {
	document.querySelector(`${parentId} table tbody`).innerHTML = ''
	if (!item)
		if (cb) cb()

	if (item.value) {
		let list = []
		if (Array.isArray(item.value)) {
			list = item.value
		} else if (item.value.docs) {
			list = item.value.docs
		}
		let nextIdentity = list.length + 1

		let fieldList = clone(item.fields)
		let s = ``

		list.forEach((listItem, index) => {
			if (!listItem)
				listItem = {}

			listItem.rowIndex = index
			s += `<tr rowIndex="${listItem.rowIndex }" >`
			if (item.options.selection) {
				s += `<td><input class="grid-checkbox checkSingle" type="checkbox" value="${listItem._id || ''}" /></td>`
			}
			Object.keys(fieldList).forEach((key) => {
				let field = fieldList[key]
				field.field = key
				field.parentField = item.parentField || ''
				field.class = htmlEval(field.class, listItem)
				field.level= item.level
				s += gridBody_Cell(field, listItem, insideOfModal)
			})
			if (item.options.buttonCount > 0) {
				s += `<td class="text-center text-nowrap pt-0 pb-1 px-1">${buttonRowCell(listItem, index, item)}</td>`
			}
			s += `</tr>`
		})

		document.querySelector(`${parentId} table tbody`).insertAdjacentHTML('beforeend', htmlEval(s))
		if(item.options.buttons.edit[0]){
			$(`${parentId} table tbody tr`).dblclick(function(){
				let r = $(this).attr('rowIndex')
				if(r!=undefined) {
					if(item.level>0){
						gridSatirDuzenle(`#${item.id}`, r, false)
					}else if(list[r]._id){
						location.href=menuLink(hashObj.path + '/edit/' + list[r]._id, hashObj.query)
					}
					
				}
			})
		}
	
		refreshRemoteList(remoteList)
	}

	grid_onchange(item)

	if (item.level > 0) {
		if (item.options.buttons.add[0]) {
			gridYeniSatir(`${parentId}`, insideOfModal)
		}
	}

	if (document.querySelector(`#gridShowHideModalSwith_${item.id}`)) {
		if (pageSettings.getItem(`showHideModalButtons_${item.id}`) === true) {
			$(`#gridShowHideModalSwith_${item.id}`).prop('checked', true)
		} else {
			$(`#gridShowHideModalSwith_${item.id}`).prop('checked', false)
		}
		document.querySelector(`#gridShowHideModalSwith_${item.id}`).onchange()
	}

	if (cb) {
		cb()
	}
}


function buttonRowCell(listItem, rowIndex, item) {
	let s = `<div class="d-flex align-items-center">`
	let grpButtons = []

	//grpButtons= Object.keys(item.options.groupedButtons) || []
	listItem['rowIndex'] = rowIndex
	Object.keys(item.options.buttons).forEach((key) => {
		if (key != 'add' && grpButtons.includes(key) == false) {
			if (item.options.buttons[key][0]) {

				s += htmlEval(item.options.buttons[key][1], listItem)
			}

		}
	})
	if (grpButtons.length > 0) {
		s += `
			<div class="dropdown grid-dropdown">
				<a class="btn btn-secondary btn-grid-row dropdown-toggle" id="dropBtn${rowIndex}" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-ellipsis-h"></i></a>
			  <ul class="dropdown-menu" aria-labelledby="dropBtn${rowIndex}">`
		grpButtons.forEach((key) => {
			s += '<li>' + htmlEval(item.options.groupedButtons[key], listItem) + '</li>'
		})
		s += `</ul></div>`
	}

	s += `</div>`
	return s
}

function gridPagerButtons(item) {
	if (!item.value.page)
		return ''
	if (item.value.pageCount <= 1)
		return ''
	let s = `<ul class="haham-table pagination m-0 ms-2">`
	s += `<li class="page-item"><a class="page-link ${item.value.page <= 1 ? 'disabled' : ''}" href="${menuLink(hashObj.path, pageNo(item.value.page - 1))}"><i class="fas fa-angle-left"></i></a></li>`

	let sayfalar = pagination(item.value.page, item.value.pageCount)
	sayfalar.forEach((e) => {
		let sbuf = e
		if (e.toString().length > 3) {
			sbuf = `<div class="sigdir">${e}</div>`
		}

		//let sbuf=e
		if (e == item.value.page.toString()) {
			s += `<li class="page-item d-none d-md-block active"><span class="page-link">${sbuf}</span></li>`
		} else if (e == '...') {
			s += `<li class="page-item d-none d-md-block"><span class="page-link">...</span></li>`
		} else {
			s += `<li class="page-item d-none d-md-block"><a class="page-link" href="${menuLink(hashObj.path, pageNo(e))}">${sbuf}</a></li>`
		}
	})

	s += `<li class="page-item"><a class="page-link ${item.value.page >= item.value.pageCount ? 'disabled' : ''}" href="${menuLink(hashObj.path, pageNo(item.value.page + 1))}"><i class="fas fa-angle-right"></i></a></li>`

	s += `</ul>`
	return s

	function pageNo(page) {
		let query = clone(hashObj.query)
		query['page'] = page
		return query
	}
}

function pagination(page, total) {
	let sayfalar = []
	let btnMax = 6
	let lamda = 2
	if (total > 0) {
		if (total <= btnMax) {
			for (let i = 1; i <= total; i++) sayfalar.push(i)
		} else {
			if (page > 1) {
				sayfalar.push(1)
			}

			if (page == 1) {
				for (let i = page; i <= page + lamda + 1; i++) sayfalar.push(i)
			} else if (page + lamda < total) {
				for (let i = page; i <= page + lamda; i++) sayfalar.push(i)
			} else {
				for (let i = total - (lamda + 1); i < total; i++) sayfalar.push(i)
			}

			if (total > 1)
				sayfalar.push(total)
		}
	}
	return sayfalar
}

function gridPageSize(item) {
	if (item.value.recordCount <= 0)
		return ''
	let s = `

  <span class="input-group-text border-end-0"><i class="fas fa-list"></i></span>
  <select class="form-control p-0 border-start-0" id="pageSize${item.id}" style="max-width:50px;">
	<option value="10" ${item.value.pageSize == 10 ? 'selected' : ''}>10</option>
	<option value="20" ${item.value.pageSize == 20 ? 'selected' : ''}>20</option>
	<option value="50" ${item.value.pageSize == 50 ? 'selected' : ''}>50</option>
	<option value="100" ${item.value.pageSize == 100 ? 'selected' : ''}>100</option>
	<option value="250" ${item.value.pageSize == 250 ? 'selected' : ''}>250</option>
	<option value="500" ${item.value.pageSize == 500 ? 'selected' : ''}>500</option>
	</select>

	`
	return s
}

function gridPageCount(item) {
	if (item.value.recordCount <= 0)
		return ''
	let rec1 = ((item.value.page - 1) * item.value.pageSize) + 1
	let rec2 = (item.value.page * item.value.pageSize < item.value.recordCount) ? item.value.page * item.value.pageSize : item.value.recordCount

	let s = ``
	if (item.value.pageCount > 1 && item.value.pageSize > 0 && item.value.recordCount > 0) {
		s += `<input class="form-control p-0 ps-2" value="${rec1} - ${rec2}" readonly style="min-width:90px;" >	`
	}
	s += `<input class="form-control p-0 ps-1 bold pe-2 text-end" value="${item.value.recordCount}" readonly  style="max-width:60px;">`

	return s
}

function gridYeniSatir(parentId, insideOfModal) {
	let table = document.querySelector(parentId)
	let tbody = document.querySelector(`${parentId} table tbody`)
	let item = table.item
	let rowIndex = -1
	let newRow = tbody.insertRow()
	let fieldList = clone(item.fields)
	newRow.id = `${table.id}-grid-newrow`
	newRow.classList.add('grid-modal-mode-off')
	if (item.readonly)
		return

	Object.keys(fieldList).forEach((key, cellIndex) => {
		let field = clone(fieldList[key])
		field.field = `${item.field}.${rowIndex}.${key}`
		field.id = generateFormId(field.field)
		field.name = generateFormName(field.field)
		field.noGroup = true
		field.insideOfGrid = true
		field.value = field.value || ''
		field.valueText = field.valueText || ''
		let td = newRow.insertCell()
		td.id = 'td_' + field.id
		td.classList.add('p-0')

		if (field.lastRecord) {
			if (table.item.value.length > 0) {
				field.value = getPropertyByKeyPath(table.item.value[table.item.value.length - 1], key)
			}
		}

		if (field.type == 'identity') {
			field.value = tbody.rows.length
		}

		if (field.visible === false) {
			td.classList.add('hidden')
		}
		field.insideOfGrid = true
		generateControl(`${parentId} table #${td.id}`, field, {}, insideOfModal, () => {

		})

	})

	let td = newRow.insertCell()
	td.classList.add('text-center')
	td.classList.add('text-nowrap')
	td.classList.add('p-0')
	td.innerHTML = `<a href="javascript:gridSatirOK('${parentId}','${newRow.id}',${rowIndex},${insideOfModal})" class="btn btn-primary btn-grid-row" title="Tamam"><i class="fas fa-check"></i></a>
	<a href="javascript:gridSatirVazgec('${parentId}','${newRow.id}',${rowIndex},${insideOfModal}) "class="btn btn-dark btn-grid-row" title="Vazgeç"><i class="fas fa-reply"></i></a>
	`

	// let s = `<div id="${table.id}-grid-show-newrow" class="grid-modal-mode-off text-end d-flex"><a href="javascript:gridShowNewRow('${parentId} table tbody #${table.id}-grid-newrow','#${table.id}-grid-show-newrow') " class="btn btn-primary btn-grid-row" title="Yeni Satır"><i class="far fa-plus-square"></i> Satır Ekle</a></div>`
	// document.querySelector(parentId).insertAdjacentHTML('beforeend', s)

	editRowCalculation(`${parentId} tbody #${newRow.id}`, `${table.item.parentField}.${rowIndex}`, fieldList)
	ilkElemanaFocuslan(`${parentId} #${newRow.id}`)
}

function gridShowNewRow(showRowId, hideRowId) {
	$(showRowId).show()
	$(hideRowId).hide()
}


function editRowCalculation(selector, prefix, fields) {

	$(`${selector} input, ${selector} select`).on('blur', function (e) {
		let valueObj = getDivData(selector, prefix)
		let listObj = objectToListObject(valueObj)
		Object.keys(fields).forEach((key) => {
			if (['number', 'money', 'amount', 'quantity', 'price', 'total'].includes(fields[key].type)) {
				if (isNaN(listObj[key]))
					listObj[key] = 0
				listObj[key] = convertNumber(listObj[key])
			}
		})
		valueObj = listObjectToObject(listObj)

		Object.keys(fields).forEach((key) => {
			if (fields[key].id != e.target.id && fields[key].calc) {
				let id = generateFormId(`${key}`)
				if (prefix != '') {
					id = generateFormId(`${prefix}_${key}`)
				}

				try {

					let deger = calculate(fields[key].calc, valueObj)

					if (['money', 'amount', 'quantity', 'price', 'total'].includes(fields[key].type)) {
						$(`${selector} #${id}`).val(deger.formatMoney(fields[key].round || 2))
					} else if (fields[key].type == 'number') {
						$(`${selector} #${id}`).val(deger.round(fields[key].round || 3))
					} else if (fields[key].type == 'total') {
						$(`${selector} #${id}`).val(deger.formatMoney())
					} else {
						$(`${selector} #${id}`).val(deger)
					}

				} catch (tryErr) {
					console.error(`tryErr:`, tryErr)
					$(`${selector} #${id}`).val(0)
				}
			}
		})
	})
}

function gridSatirOK(tableId, rowId, rowIndex, insideOfModal) {
	let table = document.querySelector(tableId)
	let satirObj = getDivData(`${tableId} #${rowId}`, `${table.item.field}.${rowIndex}`)

	if (rowIndex > -1) {
		table.item.value[rowIndex] = Object.assign({}, table.item.value[rowIndex], satirObj)
	} else {
		table.item.value.push(satirObj)
	}

	gridBody(`${tableId}`, table.item, insideOfModal, () => { })
	if (typeof formCalc == 'function') formCalc(tableId)
}

function gridSatirVazgec(tableId, rowId, rowIndex, insideOfModal) {
	let table = document.querySelector(tableId)
	gridBody(`${tableId}`, table.item, insideOfModal, () => { })
}

function gridSatirDuzenle(tableId, rowIndex, insideOfModal) {
	let table = document.querySelector(tableId)
	let thead = document.querySelector(`${tableId} thead`)
	let tbody = document.querySelector(`${tableId} tbody`)
	let editRow
	if (rowIndex > -1) {
		let trYedek = tbody.rows[rowIndex].cloneNode(true)
		tbody.deleteRow(rowIndex)
		editRow = tbody.insertRow(rowIndex)
		editRow.id = `${table.id}-gridSatir-edit-${rowIndex}`
		editRow.detail = trYedek


	} else {
		return
		// editRow = tbody.insertRow()
		// editRow.id = `${table.id}-gridSatir-edit-${rowIndex}`
	}

	editRowSekillendir(table.item, editRow, tableId, rowIndex)
	//let fieldList=clone(table.item.fields)

	editRowCalculation(`${tableId} tbody #${editRow.id}`, `${table.item.parentField}.${rowIndex}`, table.item.fields)
	ilkElemanaFocuslan(`${tableId} tbody #${editRow.id}`)

	function editRowSekillendir(item, editRow, tableId, rowIndex) {
		Object.keys(item.fields).forEach((key, cellIndex) => {
			let field = clone(item.fields[key])
			field.field = `${item.field}.${rowIndex}.${key}`
			field.id = generateFormId(field.field)
			field.name = generateFormName(field.field)
			field.noGroup = true
			field.value = ''
			let td = editRow.insertCell()
			td.id = 'td_' + field.id
			if (field.visible === false) {
				//td.innerHTML = editRow.detail.cells[cellIndex].innerHTML
				td.classList.add('hidden')
			}

			// if (field.type == 'boolean') {
			// 	if (editRow.detail.cells[cellIndex].querySelector(`input[type="checkbox"]`)) {
			// 		field.value = editRow.detail.cells[cellIndex].querySelector(`input[type="checkbox"]`).checked == true ? true : false
			// 	}
			// 	field.value = field.value.toString() === 'true' ? true : false
			// } else {
			// 	if (editRow.detail.cells[cellIndex].querySelector(`input`)) {
			// 		field.value = editRow.detail.cells[cellIndex].querySelector(`input[name="${field.name}"]`).value
			// 	}
			// }

			if (field.type == 'boolean') {
				if (editRow.detail.cells[cellIndex].querySelector(`input`)) {
					// field.value = editRow.detail.cells[cellIndex].querySelector(`input[type="checkbox"]`).checked == true ? true : false
					field.value = parseBool(editRow.detail.cells[cellIndex].querySelector(`input[data-field="${field.field}"]`).value) == true ? true : false
				}
				field.value = field.value.toString() === 'true' ? true : false
			} else {
				if (editRow.detail.cells[cellIndex].querySelector(`input`)) {
					field.value = editRow.detail.cells[cellIndex].querySelector(`input[data-field="${field.field}"]`).value
				}
			}

			if (field.type == 'remoteLookup' && remoteList[key] && remoteList[key].list[field.value]) {
				field.valueText = remoteList[key].list[field.value].label || remoteList[key].list[field.value].text || editRow.detail.cells[cellIndex].innerText
			} else {
				field.valueText = editRow.detail.cells[cellIndex].innerText
			}

			let data = { value: {} }
			data.value[field.field] = field.value
			if (field.lookupTextField) {
				data.value[field.lookupTextField] = field.valueText
			}
			data.value = listObjectToObject(data.value)
			field.insideOfGrid = true


			generateControl(`${tableId} #${td.id}`, field, data.value, insideOfModal, () => { })
		})

		let td = editRow.insertCell()
		td.classList.add('text-center')
		td.classList.add('text-nowrap')
		td.classList.add('p-0')
		td.innerHTML = `<a href="javascript:gridSatirOK('${tableId}','${editRow.id}',${rowIndex},${insideOfModal})" class="btn btn-primary btn-grid-row" title="Tamam"><i class="fas fa-check"></i></a>
		<a href="javascript:gridSatirVazgec('${tableId}','${editRow.id}',${rowIndex},${insideOfModal}) "class="btn btn-dark btn-grid-row" title="Vazgeç"><i class="fas fa-reply"></i></a>
		`
	}
}

function gridBody_Cell(field, listItem, insideOfModal) {
	if(field.class=='undefined')
		field.class=''

	let s = ''
	let td = ''
	let tdClass = `${field.class || 'ms-1'} `
	let itemValue = ''
	let itemValueHtml = ''
	if (field.type.toLowerCase() == 'identity' || field.type.toLowerCase() == 'autoincrement' || field.type.toLowerCase() == 'autoinc') {
		itemValue = listItem.rowIndex + 1
	} else {
		if (field.html && field.type != 'lookup') {
			itemValueHtml = htmlEval(field.html, listItem) || ''
			itemValue = getPropertyByKeyPath(listItem, field.field, itemValue)
		} else {
			itemValue = getPropertyByKeyPath(listItem, field.field, itemValue)
			if (itemValue == undefined) {
				itemValue = ''
				if (['number', 'money', 'amount', 'quantity', 'price', 'total'].includes(field.type)) {
					itemValue = 0
				} else if (field.type == 'boolean') {
					itemValue = false
				}
			}
		}
	}

	switch (field.type.toLowerCase()) {
		case 'lookup':
			let valueText = ''
			let o = Object.assign({}, listItem)
			Object.keys(field.lookup || {}).forEach((key2) => {
				if (key2 === itemValue.toString()) {
					td += field.lookup[key2]
					valueText = field.lookup[key2]
					return
				}
			})
			if (td == '') {
				td += itemValue
			}

			if (field.lookupTextField) {
				o[field.lookupTextField] = valueText
				if (field.level > 0) {
					td += `<input type="hidden" name="${generateFormName((field.parentField ? field.parentField + '.' : '') + listItem.rowIndex + '.' + field.lookupTextField)}" value="${valueText}" />`
				}
			}
			if (field.html) {

				o[field.field] = itemValue.toString()
				o['valueText'] = valueText

				td = htmlEval(field.html, o) || ''
			}
			break

		case 'number':
		case 'money':
		case 'amount':
		case 'price':
		case 'quantity':
		case 'total':
			tdClass = field.class || 'text-end me-1'
			// td = Number(itemValue).formatMoney(field.round || 2)
			td = cellFormatNumber(field.type, itemValue, field.round)
			break
		// case 'total':
		// 	tdClass = field.class || 'text-end me-1'
		// 	td = Number(itemValue).formatMoney()
		// 	break
		case 'date':
			td = (new Date(itemValue)).yyyymmdd()
			break
		case 'time':
			td = (new Date(itemValue)).hhmmss()
			break
		case 'datetime':
			td = (new Date(itemValue)).yyyymmddhhmmss()
			break
		case 'fromnow':
			td = moment((new Date(itemValue))).fromNow()
			break
		
		case 'boolean':
			// let swClass = `${field.class || 'form-check-input grid-checkbox'}`
			// if((field.name || '').toLowerCase().indexOf('passive') > -1) {
			// 	swClass = `${field.class || 'form-check-input grid-checkbox switch-dark'}`
			// }
			
			tdClass = field.class || 'text-center'
			itemValue = (itemValue || '').toString() === 'true' ? true : false
			td = itemValue ? '<i class="fas fa-check-square font-size-150 align-middle"></i>' : '<i class="far fa-square font-size-150 align-middle"></i>'
			// td = `
			// <div class="form-switch  m-0  p-0 ms-3 ps-3">
			// 	<input type="checkbox" class="${swClass}" value="true" ${itemValue?'checked':''} disabled />
			// </div>`


			break
		case 'remotelookup':
			let bRemoteOlarakBulalim = true
			if (itemValue == undefined) {
				itemValue = ''
			}

			if (typeof itemValue == 'object' && itemValue._id != undefined) {
				td = `<div class="">${htmlEval((field.html || field.dataSource.label || '${name}'), itemValue)}</div>`
				bRemoteOlarakBulalim = false
			} else if (field.lookupTextField && !field.html) {
				let valueText = getPropertyByKeyPath(listItem, field.lookupTextField)
				td = `<div class="">${valueText}</div>`
				if (field.level > 0) {
					let sbuf = `${(field.parentField ? field.parentField + '.' : '')}${listItem.rowIndex}.${field.lookupTextField}`
					let p = {
						name: generateFormName(sbuf),
						value: valueText,
						dataType: 'string',
						field: sbuf
					}
					td += `<input type="hidden" name="${p.name}" value="${p.value}" data-type="${p.dataType}" data-field="${p.field}" />`
				}

				if (valueText == '' && itemValue != '') {
					bRemoteOlarakBulalim = true
				} else {
					bRemoteOlarakBulalim = false
				}
			}

			if (bRemoteOlarakBulalim) {
				let cellId = ''
				if (itemValue != '') {
					cellId = `${field.field.replaceAll('.', '-')}-cell-${itemValue}`
					if (remoteList == undefined) {
						remoteList = {}
					}

					if (remoteList[field.field] == undefined) {
						remoteList[field.field] = {
							dataSource: field.dataSource,
							html: field.html,
							list: {}
						}
					}

					if (remoteList[field.field].list[itemValue] == undefined) {
						remoteList[field.field].list[itemValue] = {
							cellId: '.' + cellId,
							text: ''
						}
						if (field.lookupTextField) {
							remoteList[field.field].list[itemValue]['lookupTextField'] = `${generateFormName((field.parentField ? field.parentField + '.' : '') + listItem.rowIndex + '.' + field.lookupTextField)}`
						}
					}
				}
				td += `<div class="${cellId}">${itemValue ? '-' : ''}</div>`
			}
			break

		default:
			td = itemValueHtml || itemValue
			break
	}
	// if(!field.html && field.level > 0) {
	if (field.level > 0) {
		let prefix = (field.parentField ? field.parentField + '.' : '') + listItem.rowIndex
		if (Array.isArray(itemValue)) {
			itemValue.forEach((e, index) => {
				if (typeof e == 'object') {
					Object.keys(e).forEach((k) => {
						let p = {
							name: generateFormName(`${prefix}.${field.field}.${index}.${k}`),
							value: e[k],
							dataType: field.dataType || '',
							field: `${prefix}.${field.field}.${index}.${k}`
						}
						if (field.dataType == 'boolean') {
							td += `<input type="checkbox" class="d-none" name="${p.name}" value="true" data-type="${p.dataType}" data-field="${p.field}" ${p.value == true ? 'checked' : ''} />`
						} else {
							td += `<input type="hidden" name="${p.name}" value="${p.value}" data-type="${p.dataType}" data-field="${p.field}" />`
						}
					})
				} else {
					let p = {
						name: generateFormName(`${prefix}.${field.field}.${index}`),
						value: e,
						dataType: field.dataType || '',
						field: `${prefix}.${field.field}.${index}`
					}
					if (field.dataType == 'boolean') {
						td += `<input type="checkbox" class="d-none" name="${p.name}" value="true" data-type="${p.dataType}" data-field="${p.field}" ${p.value == true ? 'checked' : ''} />`
					} else {
						td += `<input type="hidden" name="${p.name}" value="${p.value}" data-type="${p.dataType}" data-field="${p.field}" />`
					}

				}
			})
		} else if (typeof itemValue == 'object') {

			itemValue = objectToListObject(itemValue)
			Object.keys(itemValue).forEach((e) => {
				let p = {
					name: generateFormName(`${prefix}.${field.field}.${e}`),
					value: e,
					dataType: field.dataType || '',
					field: `${prefix}.${field.field}.${e}`
				}
				if (field.dataType == 'boolean') {
					td += `<input type="checkbox" class="d-none" name="${p.name}" value="true" data-type="${p.dataType}" data-field="${p.field}" ${p.value == true ? 'checked' : ''} />`
				} else {
					td += `<input type="hidden" name="${p.name}" value="${p.value}" data-type="${p.dataType}" data-field="${p.field}" />`
				}
			})

		} else {
			let p = {
				name: generateFormName(`${prefix}.${field.field}`),
				value: itemValue,
				dataType: field.dataType || '',
				field: `${prefix}.${field.field}`
			}
			if (field.dataType == 'boolean') {
				td += `<input type="checkbox" class="d-none" name="${p.name}" value="true" data-type="${p.dataType}" data-field="${p.field}" ${p.value == true ? 'checked' : ''} />`
			} else {
				td += `<input type="hidden" name="${p.name}" value="${p.value}" data-type="${p.dataType}" data-field="${p.field}" />`
			}
		}
	}

	s += `<td class="${tdClass || ''} ${field.visible === false ? 'hidden' : ''}">${td}</td>`

	return s
}


function cellFormatNumber(fieldType, deger, precision) {
	if (precision == undefined)
		precision = 2
	let bSifirlariGizle = true
	let s = ``
	let formatliDeger = Number(deger).formatMoney(precision)
	let bolumler = formatliDeger.split(whatDecimalPointer())
	let thousand = bolumler[0]
	let decimal = bolumler.length > 1 ? bolumler[1] : '0'.repeat(precision)

	let thousandSpan = `<span class="td-${fieldType}-thousand">${thousand}</span>`
	let decimalSpan = `<span class="td-${fieldType}-decimal">${whatDecimalPointer()}${decimal}</span>`
	s = thousandSpan + decimalSpan
	return s
}


function gridShowHideModalButtons(parentId, checked) {
	pageSettings.setItem(`showHideModalButtons_${parentId}`, checked)

	if (checked) {
		$('.grid-modal-mode-on').show()
		$('.grid-modal-mode-off').hide()
	} else {
		$('.grid-modal-mode-on').hide()
		$('.grid-modal-mode-off').show()
	}

}

function gridHeader(parentId, item, insideOfModal, cb) {
	let s = `
	<thead>
	<tr class="text-nowrap">`
	if (item.options.selection === true) {
		s += `<th style="width: 30px;"><input class="grid-checkbox" type="checkbox" value="true" name="selectAll${item.id}" id="selectAll${item.id}" title="Tümünü seç"></th>`
	}


	let filterBtn = item.options.show.filterRow ? '<a class="grid-filter-button collapsed" data-bs-toggle="collapse" href="#filterRow" role="button" aria-expanded="false" aria-controls="filterRow" title="Filtre satırını göster/gizle"><i class="fas fa-filter"></i></a>' : ''
	Object.keys(item.fields).forEach((key) => {
		let field = item.fields[key]
		let cls = ''
		if ((field.headerClass || '') == '') {
			switch (item.fields[key].type) {
				case 'number':
				case 'money':
				case 'amount':
				case 'price':
				case 'quantity':
				case 'total':
					cls = 'text-end me-1'
					break
				case 'boolean':
					cls = 'text-center'
					break
			}
		} else {
			cls = field.headerClass
		}
		if (field.visible === false) {
			cls += ' hidden'
		}

		s += `<th class="${cls}" style="${field.width ? 'width:' + field.width + ';min-width:' + field.width + ';' : ''}" ${field.title ? 'title="' + field.title + '"' : ''}>${filterBtn}${field.icon ? '<i class="' + field.icon + '"></i> ' : ''}${itemLabelCaption(field)}</th>`
		if (cls.indexOf('hidden') < 0 && filterBtn != '') {
			filterBtn = ''
		}
	})

	if (item.options.buttonCount > 0) {
		s += `<th class="text-center " style="width:${item.options.buttonWidth}">
		${item.options.buttons.add[0] == true ? item.options.buttons.add[1] : ''}
		</th>`
	}

	s += `
	</tr>
	</thead>
	`

	document.querySelector(`${parentId} table`).insertAdjacentHTML('afterbegin', htmlEval(s))

	gridFilterRow(`${parentId} table thead`, item, insideOfModal, cb)
}

function gridFilterRow(parentId, item, insideOfModal, cb) {

	if (item.options.show.filterRow !== true) {
		return cb()
	}
	let cleanFilters = item.options.show.filter ? `<a class="grid-filter-cleaner" href="javascript:gridCleanRowFilters('${parentId} #filterRow')" title="Satır filtrelerini temizle"><span class="fa-stack">
  <i class="fas fa-filter fa-stack-1x"></i>
  <i class="fas fa-slash fa-stack-1x fs-125 text-white stroke"></i>
</span></a>` : ''

	document.querySelector(`${parentId}`).insertAdjacentHTML('beforeend', `<tr id="filterRow" class="text-nowrap collapse">${item.options.selection === true ? '<th></th>' : ''}</tr>`)

	let dizi = Object.keys(item.fields)
	let index = 0

	function calistir(cb1) {
		if (index >= dizi.length) {
			return cb1()
		}
		let field = Object.assign({}, item.fields[dizi[index]])

		field.filter = field.filter == undefined ? item.options.filter : field.filter


		if (field.filter && field.visible !== false) {
			if (field.filterField)
				field.field = field.filterField
			field.filterField = field.filterField || dizi[index]
			field.id = generateFormId(`${item.id}_filter_${field.filterField}`)
			field.prefix = generateFormId(`${item.id}_filter`)
			field.name = generateFormName(`${item.id}_filter.${field.filterField}`)
			field.class = 'grid-filter'
			field.noGroup = true
			//field.placeholder=field.placeholder || ' '
			field.showAll = true

			if ((hashObj.query[field.filterField] || '') != '') {
				field.value = hashObj.query[field.filterField]
			}
			if (cleanFilters != '') {
				document.querySelector(`${parentId} #filterRow`).insertAdjacentHTML('beforeend', `<th ${field.visible === false ? 'class="p-0 hidden"' : ''}><div class="d-flex" id="filterCol${index}"></div></th>`)
				document.querySelector(`${parentId} #filterRow #filterCol${index}`).insertAdjacentHTML('afterbegin', cleanFilters)
				cleanFilters = ''
				field.class = 'grid-filter d-flex-fill'
			} else {
				document.querySelector(`${parentId} #filterRow`).insertAdjacentHTML('beforeend', `<th id="filterCol${index}" ${field.visible === false ? 'class="hidden"' : ''}></th>`)
			}

			filterControl(`${parentId} #filterRow #filterCol${index}`, `${parentId} #filterRow`, field, () => {
				index++
				setTimeout(calistir, 0, cb1)
			})
		} else {
			document.querySelector(`${parentId} #filterRow`).insertAdjacentHTML('beforeend', `<th id="filterCol${index}" ${field.visible === false ? 'class="hidden"' : ''}></th>`)
			index++
			setTimeout(calistir, 0, cb1)
		}
	}

	calistir(() => {
		document.querySelector(`${parentId} #filterRow`).insertAdjacentHTML('beforeend', `<th class="border-start">&nbsp;</th>`)
		cb()
	})
}



function gridCleanRowFilters(divId) {
	let elements = document.querySelector(divId).querySelectorAll(`input, select`)
	let index = 0
	let h = getHashObject()
	let tazele = false
	$(divId).collapse('hide')
	while (index < elements.length) {
		let el = elements[index]
		let field = el.getAttribute('data-field') || ''
		if (el.tagName == 'SELECT') {
			if (el.options.length > 0)
				el.selectedIndex = 0
		} else {
			if (el.type == 'checkbox') {
				el.checked = false
			} else {
				el.value = ''
			}
		}
		if (field && h.query[field] != undefined) {
			h.query[field] = undefined
			delete h.query[field]
			tazele = true
		}
		index++
	}

	if (tazele) {
		setTimeout(() => {
			if (h.query.page) {
				h.query.page = 1
			}
			setHashObject(h)
		}, 200)
	}

	// document.querySelector(divId).classList.remove('show')
}



function gridButtonOptions(item, insideOfModal) {
	let options = item.options || {}
	let buttonCount = 0
	let currentPath = window.location.pathname


	let defaultButtons = {
		add: [false, '', 'primary'],
		copy: [false, '', 'success'],
		view: [false, '', 'info'],
		print: [false, 'info',],
		edit: [false, 'primary'],
		delete: [false, 'danger']
	}
	if (options.groupedButtons == undefined) {
		options.groupedButtons = {}
	}

	if (options.buttons == undefined) {
		options.buttons = defaultButtons
	} else {
		options.buttons = Object.assign({}, defaultButtons, options.buttons)
		Object.keys(options.buttons).forEach((key) => {
			if (typeof options.buttons[key] == 'boolean') {
				options.buttons[key] = [options.buttons[key], '']
			} else if (Array.isArray(options.buttons[key])) {
				if (options.buttons[key].length < 2)
					options.buttons[key].push('')
			}
		})
	}
	let q = {}
	if (hashObj.query.mid)
		q = { mid: hashObj.query.mid }
	if (options.queryValues) {
		q = hashObj.query
	} else {

	}
	if (options.buttons.add[0] == true && options.buttons.add[1] == '') {
		if (item.level == 0) {
			options.buttons.add[1] = `<a href="${menuLink(hashObj.path + '/addnew', q)}" class="btn btn-primary btn-sm far fa-plus-square" target="_self"  title="Yeni Ekle"></a>`
		} else {
			if (item.modal && !item.insideOfModal) {
				let switchButton = `<div class="form-switch  text-center  m-0  p-0 ms-3 ps-3">
				<input type="checkbox" id="gridShowHideModalSwith_${item.id}" class="form-check-input switch-cyan" value="true" onchange="gridShowHideModalButtons('${item.id}',this.checked)" title="Modal çalışma On/Off"/>
				</div>`

				options.buttons.add[1] = `<div class="d-flex justify-content-between px-2">
					${switchButton}
					<a href="javascript:gridModalAddRow('#${item.id}',${insideOfModal})" class="btn btn-primary  btn-sm far fa-plus-square grid-modal-mode-on" target="_self"  title="Yeni Ekle (modal)"></a>
				</div>`
			} else {
				options.buttons.add[1] = ``
			}
		}
	}

	if (options.buttons.copy[0] == true && options.buttons.copy[1] == '') {
		options.buttons.copy[1] = `<a class="btn btn-success btn-grid-row" href="javascript:gridCopyItem(\$\{rowIndex\},'#${item.id}')" title="Kopyala"><i class="fas fa-copy"></i></a>`
	}
	if (options.buttons.copy[0] == true)
		options.groupedButtons.copy = `<a class="dropdown-item bg-success" href="javascript:gridCopyItem(\$\{rowIndex\},'#${item.id}')" title="Kopyala"><i class="fas fa-copy"></i></a>`


	if (options.buttons.print[0] == true && options.buttons.print[1] == '') {
		let q2 = clone(q)
		q2['view'] = 'print'

		if (hashObj.settings.print) {
			if (hashObj.settings.print.form) {
				q2['designId'] = hashObj.settings.print.form._id
			}
		}

		options.buttons.print[1] = `<a href="javascript:popupCenter('${menuLink(hashObj.path + '/print/\${_id\}', q2)}','Yazdır','900','600')" class="btn btn-info btn-grid-row" title="Yazdır"><i class="fas fa-print"></i></a>`
		options.groupedButtons.print = `<a href="javascript:popupCenter('${menuLink(hashObj.path + '/print/\${_id\}', q2)}','Yazdır','900','600')" class="dropdown-item bg-info" title="Yazdır"><i class="fas fa-print"></i></a>`
	}

	if (options.buttons.view[0] == true && options.buttons.view[1] == '') {
		options.buttons.view[1] = `<a href="${menuLink(hashObj.path + '/view/\${_id\}', q)}" class="btn btn-info btn-grid-row" title="İncele"><i class="fas fa-eye"></i></a>`
	}

	if (options.buttons.view[0] == true)
		options.groupedButtons.view = `<a href="${menuLink(hashObj.path + '/view/\${_id\}', q)}" class="dropdown-item bg-info" title="İncele"><i class="fas fa-eye"></i></a>`


	if (options.buttons.edit[0] == true && options.buttons.edit[1] == '') {
		if (item.level == 0) {
			options.buttons.edit[1] = `<a href="${menuLink(hashObj.path + '/edit/\${_id\}', q)}" class="btn btn-primary btn-grid-row" target="_self"  title="Düzenle"><i class="fas fa-edit"></i></a>`
		} else {
			if (!insideOfModal) {
				options.buttons.edit[1] = `<a href="javascript:gridSatirDuzenle('#${item.id}', \$\{rowIndex\}, ${insideOfModal})" class="btn btn-info btn-grid-row fas fa-edit grid-modal-mode-off" title="Satır Düzenle"></a>`
				if (item.modal) {
					options.buttons.edit[1] += `<a href="javascript:gridModalEditRow('#${item.id}', \$\{rowIndex\}, ${insideOfModal})" class="btn btn-success btn-grid-row fas fa-window-restore grid-modal-mode-on" title="Modal Düzenle"></a>`
				}
			} else {
				options.buttons.edit[1] = `<a href="javascript:gridSatirDuzenle('#modalRow #${item.id}', \$\{rowIndex\}, ${insideOfModal})" class="btn btn-info btn-grid-row fas fa-edit" title="Satır Düzenle"></a>`
			}
		}
	}


	if (options.buttons.delete[0] == true && options.buttons.delete[1] == '') {
		if (item.level == 0) {
			options.buttons.delete[1] = `<a href="javascript:gridDeleteItem(\$\{rowIndex\},'#${item.id}')" class="btn btn-danger btn-grid-row" title="Sil"><i class="fas fa-trash-alt"></i></a>`
			options.groupedButtons.delete = `<a href="javascript:gridDeleteItem(\$\{rowIndex\},'#${item.id}')" class="dropdown-item bg-danger" title="Sil"><i class="fas fa-trash-alt"></i></a>`
		} else {
			if (!insideOfModal) {
				options.buttons.delete[1] = `<a href="javascript:gridSatirSil('#${item.id}',\$\{rowIndex\},${insideOfModal})" class="btn btn-danger btn-grid-row fas fa-trash-alt" title="Sil"></a>`
			} else {
				options.buttons.delete[1] = `<a href="javascript:gridSatirSil('#modalRow #${item.id}',\$\{rowIndex\},${insideOfModal})" class="btn btn-danger btn-grid-row fas fa-trash-alt" title="Sil"></a>`
			}
		}
	}

	Object.keys(options.buttons).forEach((key) => {
		buttonCount += options.buttons[key][0] ? 1 : 0
	})
	if (buttonCount > 1 && options.buttons.add[0])
		buttonCount--

	buttonCount = buttonCount > 4 ? 4 : buttonCount

	// if(item.level == 0) {
	// 	options.buttonWidth = `${buttonCount*45+10}px`
	// } else {
	// 	options.buttonWidth = `${2*45+10}px`
	// }
	options.buttonWidth = '0'
	item.options = options

	if (item.readonly) {
		item.options.buttonCount = 0
	} else {
		item.options.buttonCount = buttonCount
	}
	return item
}



function filterControl(parentId, filterRowDivId, field, cb) {
	switch (field.type.toLowerCase()) {
		case 'lookup':
			frm_Lookup(parentId, field, () => {
				$(`#${field.id}`).on('change', (e) => {
					keyupTimer = 0
					runFilter(filterRowDivId, field.prefix)
				})
				cb()
			})
			break
		case 'remotelookup':
			frm_RemoteLookup(parentId, field, () => {
				$(`#${field.id}-autocomplete-text`).on('change', (e) => {
					keyupTimer = 0
					runFilter(filterRowDivId, field.prefix)
				})
				cb()
			})
			break
		case 'boolean':
			frm_CheckBoxLookup(parentId, field, () => {
				$(`#${field.id}`).on('change', (e) => {
					keyupTimer = 0
					runFilter(filterRowDivId, field.prefix)
				})
				cb()
			})
			break
		case 'date':
			frm_DateBox(parentId, field, () => {
				$(`#${field.id}`).on('change', (e) => {
					keyupTimer = 0
					runFilter(filterRowDivId, field.prefix)
				})
				cb()
			})
			break
		case 'time':
			frm_TimeBox(parentId, field, () => {
				$(`#${field.id}`).on('change', (e) => {
					keyupTimer = 0
					runFilter(filterRowDivId, field.prefix)
				})
				cb()
			})
			break
		case 'number':
			frm_TextBox(parentId, field, () => {
				$(`#${field.id}`).on('keyup', (e) => {
					keyupTimer = 1
					if (timerActive)
						return
					runTimer(filterRowDivId, field.prefix)
				})
				cb()
			})
			break
		case 'money':
		case 'amount':
		case 'quantity':
		case 'price':
			frm_TextBox(parentId, field, () => {
				$(`#${field.id}`).on('keyup', (e) => {
					keyupTimer = 1
					if (timerActive)
						return
					runTimer(filterRowDivId, field.prefix)
				})
				cb()
			})
			break
		case 'total':
			frm_TextBox(parentId, field, () => {
				$(`#${field.id}`).on('keyup', (e) => {
					keyupTimer = 1
					if (timerActive)
						return
					runTimer(filterRowDivId, field.prefix)

				})
				cb()
			})
			break
		default:
			frm_TextBox(parentId, field, () => {

				$(`#${field.id}`).on('keyup', (e) => {
					keyupTimer = 1
					if (timerActive)
						return
					runTimer(filterRowDivId, field.prefix)

				})
				cb()
			})
			break
	}
}

function gridFooter(item) {
	return ``
}

function filterFormButton(divId) {
	let s = `
	<div class="ms-auto col text-end pt-2 pt-md-4">
	<a href="javascript:runFilter('#${divId}')" class="btn btn-primary text-nowrap" title="Filtrele" ><i class="fas fa-sync-alt"><i class="fas fa-filter ms-2"></i></i></a>
	</div>
	`

	return s
}



function gridDefaults(item, insideOfModal) {
	if (item.level == undefined)
		item.level = 0
	if (item.id == undefined && item.level == 0) {
		rootGridId++
		item.id = `rootGrid${rootGridId}`
	}
	item = gridButtonOptions(item, insideOfModal)
	let optShow = {}

	if (item.level > 0) {
		optShow = {
			filter: false,
			pageSize: false,
			pageCount: false,
			pagerButtons: false,
			header: true,
			footer: false
		}
	} else {
		optShow = {
			filter: true,
			pageSize: true,
			pageCount: true,
			pagerButtons: true,
			header: true,
			footer: true
		}
	}
	item.options.show = Object.assign({}, optShow, item.options.show)
	if (item.options.show.infoRow == undefined) {
		if (item.level == 0 && (item.options.show.filter || item.options.show.pageSize || item.options.show.pageCount || item.options.show.pagerButtons)) {
			item.options.show.infoRow = true
		} else {
			item.options.show.infoRow = false
		}
	}
	item.options.show.filterRow = item.options.filter || false


	if (item.level > 0)
		item.options.show.filterRow = false

	if (item.options.show.filterRow) {
		let bFound = false
		Object.keys(item.fields).forEach((key) => {
			if (item.fields[key].filter == undefined) {
				item.fields[key].filter = true
			}

			if (item.fields[key].filter === true) {
				bFound = true
				return
			}

		})
		if (bFound == false) {
			item.options.show.filterRow = false
		}
	}

	item.value = objectArrayControl(item.value)
	return item
}

function gridModalAddRow(tableId, insideOfModal) {
	gridModalEditRow(tableId, -1, insideOfModal)
}

function gridModalEditRow(tableId, rowIndex, insideOfModal) {

	let table = document.querySelector(tableId)
	let item = table.item

	$(`#modalRow .modal-body`).html('')


	let gridLine = {}

	if (item.modal) {
		gridLine = clone(item.modal)
	} else {
		gridLine = {
			fields: clone(item.fields || {})
		}
	}

	gridLine.id = item.id
	gridLine.type = "modal"
	gridLine.options = { autocol: true }

	if (rowIndex >= 0) {
		gridLine.value = table.item.value[rowIndex]
		$(`#modalRow .modal-title`).html(`<i class="fas fa-edit"></i> #${rowIndex + 1} satırını düzenle`)
	} else {
		gridLine.value = {}
		$(`#modalRow .modal-title`).html('<i class="far fa-plus-square"></i> Yeni satir')
		Object.keys(item.fields).forEach((key, cellIndex) => {
			item.fields[key].field = ''
			let field = item.fields[key]
			field.insideOfGrid = true
			if (field.lastRecord) {
				if (table.item.value.length > 0) {
					gridLine.value[key] = getPropertyByKeyPath(table.item.value[table.item.value.length - 1], key)
				}
			}

			if (field.type == 'identity') {
				gridLine.value[key] = item.value.length + 1
			}
		})
	}


	generateControl(`#modalRow .modal-body`, gridLine, gridLine.value, true, () => {
		editRowCalculation(`#modalRow .modal-body`, '', table.item.fields)
	})

	$(`#modalRow .modal-footer`).html(`<a class="btn btn-primary" href="javascript:gridModalOK('${tableId}',${rowIndex},${insideOfModal})" title="Kaydet"><i class="fas fa-check"></i> Tamam</a><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Vazgeç</button>`)

	$(`#modalRow`).modal('show')

}

function gridModalOK(tableId, rowIndex, insideOfModal) {
	let table = document.querySelector(tableId)

	let satirObj = getDivData(`#modalRow .modal-body`, '', false)

	if (rowIndex > -1) {
		table.item.value[rowIndex] = satirObj
	} else {
		table.item.value.push(satirObj)
	}
	gridBody(`${tableId}`, table.item, insideOfModal, () => { })

	if (typeof formCalc == 'function') formCalc(tableId)
	$(`#modalRow`).modal('hide')
}

function grid_onchange(item) {
	let onchange = ''
	try {
		if (!item)
			return
		if (document.querySelector(`${item.pageFormId} #${item.id}`)) {
			if (document.querySelector(`${item.pageFormId} #${item.id}`).item) {
				if (item.onchange) {
					onchange = item.onchange
					if (onchange.indexOf('this.value') > -1) {
						onchange = onchange.replace('this.value', `document.querySelector('${item.pageFormId} #${item.id}').item.value`)
						eval(onchange)
					} else if (onchange.indexOf('this') > -1) {
						onchange = onchange.replace('this', `document.querySelector('${item.pageFormId} #${item.id}').item`)
						eval(onchange)
					} else {
						eval(onchange)
					}
				}
			}
		}
	} catch (tryErr) {
		alertX(`<tt>${tryErr.name || ''} - ${tryErr.message || ''}\nFunction: <b>grid_onchange</b>\nid: <b>${item.id}</b>\nonchange: <b>${onchange}</b>\n</tt>`, 'Custom Script Hatası', 'danger')
	}
}


function gridSatirSil(tableId, rowIndex, insideOfModal) {
	let table = document.querySelector(`${tableId}`)
	if (rowIndex > -1) {
		if (table.item.options.confirmBeforeRemove) {
			confirmX(`#${rowIndex + 1} nolu Satiri silmek istiyor musunuz?`, (answer) => {
				if (answer) {
					table.item.value.splice(rowIndex, 1)
					gridBody(`${tableId}`, table.item, insideOfModal, () => { })
					if (typeof formCalc == 'function') formCalc(tableId)
				}
			})
		} else {
			table.item.value.splice(rowIndex, 1)
			gridBody(`${tableId}`, table.item, insideOfModal, () => { })
			if (typeof formCalc == 'function') formCalc(tableId)
		}

	}
}

function ilkElemanaFocuslan(selector) {

	let ilkEleman = document.querySelector(`${selector}`).querySelector('input,select')
	if (ilkEleman) {
		ilkEleman.focus()
		if (typeof ilkEleman.select === 'function') {
			if (ilkEleman.getAttribute('readonly') != undefined || ilkEleman.getAttribute('disabled') != undefined) {
				enterNext(ilkEleman)
			} else {
				ilkEleman.select()
			}
		}
	}
}

function gridDeleteItem(rowIndex, tableId) {
	let table = document.querySelector(tableId)
	let item = table.item
	if (!item.dataSource)
		return
	if (!item.value)
		return

	let row = table.querySelectorAll('tbody tr')[rowIndex]
	let listItem
	if (Array.isArray(item.value)) {
		listItem = item.value[rowIndex]
	} else if (item.value.docs) {
		listItem = item.value.docs[rowIndex]
	}

	if (!row)
		return


	let soru = `Belge/Kayıt silinecektir! Onaylıyor musunuz?`
	let i = 0
	soru += `<br><hr class="hr-primary">`
	while (i < row.cells.length && i < 4) {
		if (row.cells[i].innerText.trim() != '') {
			soru += `${row.cells[i].innerHTML.trim()}<br>`
		}
		i++
	}

	let url = ''
	if (item.dataSource.deleteUrl) {
		url = item.dataSource.deleteUrl.split('?')[0]
		if (url.indexOf('${_id}') < 0) {
			url += '/${_id}'
		}
	} else {
		url = item.dataSource.url.split('?')[0]
		url += '/${_id}'
	}
	url = htmlEval(url, listItem)

	confirmX(soru, 'danger', (answer) => {
		if (!answer) return
		postMan(url, { type: 'DELETE' })
			.then(data => {
				window.onhashchange()
			})
			.catch(showError)
	})
}

function gridCopyItem(rowIndex, tableId) {
	let table = document.querySelector(tableId)
	let item = table.item
	if (!item.dataSource)
		return
	if (!item.value)
		return


	let listItem
	if (Array.isArray(item.value)) {
		listItem = item.value[rowIndex]
	} else if (item.value.docs) {
		listItem = item.value.docs[rowIndex]
	}


	if (item.dataSource.copyUrl) {
		url = item.dataSource.copyUrl.split('?')[0]
		if (url.indexOf('${_id}') < 0) {
			url += '/${_id}'
		}
	} else {
		url = item.dataSource.url.split('?')[0]
		url += '/copy/${_id}'
	}
	url = htmlEval(url, listItem)

	let name = ''
	let nameTitle = ''
	let key = ''
	let placeholder = ''
	if (item.fields['name']) {
		key = 'name'
		name = listItem['name'] || ''
		nameTitle = item.fields['name'].text || ''
	} else if (item.fields['name.value']) {
		key = 'name.value'
		name = getPropertyByKeyPath(listItem, 'name.value') || ''
		nameTitle = item.fields['name.value'].text || ''
	} else if (item.fields['ID']) {
		key = 'ID'
		name = listItem['ID'] || ''
		nameTitle = item.fields['ID'].text || ''
	} else if (item.fields['ID.value']) {
		key = 'ID.value'
		name = getPropertyByKeyPath(listItem, 'ID.value') || ''
		nameTitle = item.fields['ID.value'].text || ''
	}

	if (name == '') {
		Object.keys(item.fields).forEach((k) => {
			if (name == '' && item.fields[k].type == 'string' && item.fields[k].readonly !== true && item.fields[k].visible !== false) {
				key = k
				name = getPropertyByKeyPath(listItem, k)
				nameTitle = item.fields[key].text || ''
			}
		})
	}
	if (key == 'ID' || key == 'ID.value') {
		name = ''
		placeholder = 'Boş ise otomatik verilir'
	} else {
		name += ' kopya'
	}

	copyX({
		newName: { title: `Yeni ${nameTitle}`, type: 'string', value: `${name}`, placeholder: `${placeholder}` }
	}, 'Kopya oluştur', (answer, formData) => {
		if (!answer) return
		postMan(url, { type: 'POST', dataType: 'json', data: formData })
			.then(data => {
				if (data.newName) {
					alertX(`Yeni ad/kod:<br> <b>${data.newName}</b>`, 'Kopyalama başarılı', (answer) => {
						window.onhashchange()
					})
				} else {
					window.onhashchange()
				}
			})
			.catch(showError)
	})
}

function gridCSVExport(gridId) {

	let grid = document.querySelector(`#${gridId}`)
	let thead = document.querySelector(`#${gridId} table thead`)
	let tbody = document.querySelector(`#${gridId} table tbody`)
	let item = grid.item
	let s = ``
	let i = 0,
		j = 0
	while (j < thead.rows[0].cells.length) {
		if (item.options.selection && j == 0) {

		} else {
			if (!thead.rows[0].cells[j].classList.contains('hidden')) {
				s += '"' + thead.rows[0].cells[j].innerText + '";'
			}

		}

		j++
	}

	s += '\r\n'

	while (i < tbody.rows.length) {
		j = 0
		while (j < tbody.rows[i].cells.length) {
			if (item.options.selection && j == 0) {

			} else {
				if (!tbody.rows[i].cells[j].classList.contains('hidden'))
					s += '"' + tbody.rows[i].cells[j].innerText.replaceAll('\r\n', ' ').replaceAll('\n', ' ') + '";'
			}

			j++
		}
		s += '\r\n'

		i++
	}
	let fileName = (document.title || '').split('-')[0].trim() + '.csv'

	let blob = new Blob([String.fromCharCode(0xFEFF), s], { type: "text/plain;charset=utf-8", autoBom: true })
	saveAs(blob, fileName)
}