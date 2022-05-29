function frm_Card(parentId, item, cb) {
	//	<a class="btn btn-collapse ${item.collapsed?'collapsed':''}" data-bs-toggle="collapse" data-bs-target="#cardCollapse${item.id}" aria-expanded="${!item.collapsed?'false':'true'}" aria-fields="cardCollapse${item.id}" href="#"><i class="far fa-caret-square-up fa-2x"></i></a>

	let s = `
	<div  id="col_${item.id}"  class="${item.col || ''} p-1 pb-1 ${item.visible===false?'d-none':''}">
	<div class="card cerceve1 ${item.level>1?'child':'mother'} ${item.class || ''}  level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}" >
		<div class="card-header ${item.showHeader===false?'d-none':''}"  >
			<span class="hand-pointer" data-bs-toggle="collapse" data-bs-target="#cardCollapse${item.id}" aria-expanded="${!item.collapsed?'false':'true'}" aria-fields="cardCollapse${item.id}">
			<a class="btn btn-collapse ${item.collapsed?'collapsed':''}" data-bs-toggle="collapse" data-bs-target="#cardCollapse${item.id}" aria-expanded="${!item.collapsed?'false':'true'}" aria-fields="cardCollapse${item.id}" ><i class="fas fa-caret-up fa-2x"></i></a>	
			${item.text}${helpButton(item)}
			</span>
		</div>
		<div  id="cardCollapse${item.id}" class="card-body  card-collapse collapse ${item.collapsed?'collapsed':'show'}">
			<div class="row" id="${item.id}">
			${item.html || item.controls || ''}
			</div>
		</div>
	</div>
	</div>
	`


	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	cb()
}

function frm_Tab(parentId, item, cb) {
	let bActive = false
	item.tabs.forEach((tab) => {
		if(tab.active === true) {
			bActive = true
			return
		}
	})
	if(!bActive && item.tabs.length > 0) {
		item.tabs[0].active = true
	}

	let s = `
	<div id="col_${item.id}" class="col-12 p-1 ">
	<ul class="nav nav-tabs" role="tablist" level="${item.level}">`
	item.tabs.forEach((tab, tabIndex) => {
		s += `<li class="nav-item">
		<a class="nav-link ${tab.active?'active':''}" href="#formTab${item.id}${tabIndex}" role="tab" data-bs-toggle="tab" id="IDformTab${item.id}${tabIndex}" aria-controls="formTab${item.id}${tabIndex}" aria-selected="${tab.active?'true':'false'}">
		${tab.icon?'<i class="' + tab.icon + '"></i>':''} ${tab.text || ''}
		</a>
		</li>`
	})
	s += `</ul>
	<div class="tab-content" style="min-height: 60vh;overflow: auto;">`
	item.tabs.forEach((tab, tabIndex) => {
		s += `<div class="tab-pane ${tab.active?'show active':''}" id="formTab${item.id}${tabIndex}" role="tabpanel" aria-labelledby="IDformTab${item.id}${tabIndex}">
		<div class="row" id="${tab.id}" >
		</div>
		</div>`
	})
	s += `</div>
	</div>
	`
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	cb()
}

function frm_GInput(input, item) {
	if(item.noGroup === true) {
		return input
	} else {
		return `
		<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 ${item.visible===false?'d-none':''}">
		<div class="form-floating ">
		${input}
		<label for="${item.id}" class="">${itemLabelCaption(item)}${helpButton(item)}</label>
		
		</div>
		</div>
		`
	}

	// ps-0 ps-md-1 pb-0 pb-md-3 
}

function frm_Group(input, item) {
	if(item.noGroup === true) {
		return input
	} else {
		return `
		<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 ${item.visible===false?'d-none':''}"">
		${input}
		</div>
		`
	}

	// ps-0 ps-md-1 pb-0 pb-md-3 
}

function frm_FormHtml(parentId, item, cb) {

	let html = ''
	if(item.html) {
		html = replaceUrlCurlyBracket(item.html, item) || ''
	} else {
		html = item.value
	}


	if($('body').hasClass('print')) {
		let iframe = document.createElement('iframe')
		iframe.style.display = 'block'
		iframe.style.border = 'none'
		iframe.style.height = '86vh'
		iframe.style.width = '100%'

		document.querySelector(parentId).appendChild(iframe)
		iframe.contentWindow.document.open()
		iframe.contentWindow.document.write(html)
		iframe.contentWindow.document.close()
	} else {
		// let s = frm_GInput(html, item)
		let s = frm_Group(html, item)
		document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s, item))
	}
	cb()
}

function frm_Label(parentId, item, cb) {

	let s = frm_Group(`<label level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  id="${item.id}" class="m-0 p-0  ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}" title="${item.title || item.text || ''}">${itemLabelCaption(item, (item.value || item.text || ''))}</label>`, item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	if(item.id && item.value)
		$(`${parentId} #${item.id}`).val(item.value)

	cb()
}

function frm_Alert(parentId, item, cb) {

	let s = frm_Group(`<label level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  id="${item.id}" class="m-0 alert alert-info alert-${item.type} small w-100 p-1 my-1 ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}" title="${item.title || item.text || ''}">${item.value || item.text || ''}</label>`, item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	if(item.id && item.value)
		$(`${parentId} #${item.id}`).val(item.value)

	cb()
}


function frm_TextBox(parentId, item, cb) {
	let s = frm_GInput(`<input type="text" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  class="form-control ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" value="${item.value!=undefined?item.value:''}">`, item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	$(`${parentId} #${item.id}`).val(item.value != undefined ? item.value : '')

	cb()
}

function frm_InputHidden(parentId, item, cb) {

	let s = `<input type="hidden" id="${item.id}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"   name="${item.name}" onchange="${item.onchange || ''}" value="${item.value!=undefined?item.value:''}">`

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	$(`${parentId} #${item.id}`).val(item.value != undefined ? item.value : '')
	cb()
}

function frm_Button(parentId, item, cb) {
	let label = `${item.text || ''}`
	let titleText = `${item.title || item.text || ''}`
	if(item.icon) {
		label = `<i class="${item.icon}"></i> ${label}`
	}

	let href = `${item.href || (item.value || '')}`
	if(href.length > 2) {
		if(global.basePath != '' && href[0] == '/' && href[1] != '/') {
			href = global.basePath + href
		}
	}
	let s = `<a class="${item.class || 'btn btn-info'} ${item.noGroup === true && item.visible===false?'d-none':''}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"   id="${item.id || ''}" href="${href}" target="${item.target || ''}" title="${titleText.replaceAll('"','\'')}">${label}</a>`

	if(item.noGroup !== true) {
		s = `<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 d-flex align-items-center ${item.visible===false?'hidden':''}">
		${s}
		</div>
		`
	}

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	cb()
}

function frm_TextareaBox(parentId, item, cb) {

	let s = `
	<textarea level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"   class="form-control text-nowrap ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}"  style="font-family: courier new;height:auto;"  id="${item.id}-textarea" rows="${item.rows || 4}"  placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" spellcheck="false"></textarea>
	<input type="hidden" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"   id="${item.id}" name="${item.name}" >
	`

	s = frm_GInput(s, item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	let textAreaValue = item.value != undefined ? item.value : ''
	if(item.encoding == 'base64') {
		textAreaValue = b64DecodeUnicode(item.value != undefined ? item.value : '')
	}

	document.querySelector(`${parentId} #${item.id}-textarea`).onkeydown = function(e) {
		if(e.keyCode === 9) {
			let val = this.value
			let start = this.selectionStart
			let end = this.selectionEnd
			this.value = val.substring(0, start) + '\t' + val.substring(end)
			this.selectionStart = this.selectionEnd = start + 1
			return false
		}
	}

	$(`${parentId} #${item.id}-textarea`).val(textAreaValue)
	$(`${parentId} #${item.id}`).val(item.value != undefined ? item.value : '')

	$(`${parentId} #${item.id}-textarea`).change(() => {
		if(item.encoding == 'base64') {
			$(`${parentId} #${item.id}`).val(b64EncodeUnicode($(`${parentId} #${item.id}-textarea`).val()))
		} else {
			$(`${parentId} #${item.id}`).val($(`${parentId} #${item.id}-textarea`).val())
		}
	})

	cb()
}


function frm_ImageBox(parentId, item, cb) {
	let s = `
	<div class="${item.noGroup === true && item.visible===false?'d-none':''}">
	<label for="fileUpload_${item.id}" class="btn btn-primary btn-image-edit" title="${item.title || item.text || ''}"><i class="fas fa-edit"></i></label>
	<img id="${item.id}-img" class="imageBox-img" src="${item.value.data || '/img/placehold-place.jpg'}" download="${item.value.fileName || ''}">
	</div>
	<input type="file" id="fileUpload_${item.id}" style="display:none;" accept="" >
	<input type="hidden" data-type="string" data-field="${item.field || ''}.data" name="${item.name}[data]" value="${item.value.data || ''}" >
	<input type="hidden" data-type="string" data-field="${item.field || ''}.type" name="${item.name}[type]" value="${item.value.type || ''}" >
	<input type="hidden" data-type="string" data-field="${item.field || ''}.fileName" name="${item.name}[fileName]" value="${item.value.fileName || ''}" >
	`

	s = frm_GInput(s, item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	$(`${parentId} #fileUpload_${item.id}`).change(() => {
		let files = $(`${parentId} #fileUpload_${item.id}`).prop('files')
		if(files.length > 0) {
			let file = files[0]
			$(`${parentId} #${item.id}-img`).attr(`download`, file.name)

			let reader = new FileReader()
			reader.addEventListener("load", function() {
				$(`${parentId} #${item.id}-img`).attr('src', reader.result)
				$(`${parentId} input[name="${item.name}[data]"]`).val(reader.result)
				$(`${parentId} input[name="${item.name}[type]"]`).val(file.type)
				$(`${parentId} input[name="${item.name}[fileName]"]`).val(file.name)
			}, false)
			if(file) {
				reader.readAsDataURL(file)
			}
		}
	})

	cb()
}

function frm_FileBox(parentId, item, cb) {
	let s = `
	<div class="${item.noGroup === true && item.visible===false?'d-none':''}">
	<label for="fileUpload_${item.id}" class="btn btn-primary hand-pointer" title="${item.title || item.text || ''}"><i class="fas fa-file-alt"></i> Dosya seçiniz</label>
	<div class="w-100 my-2"></div>
	<a id="fileDownload_${item.id}" class="" href="${item.value.data || '#'}" download="${item.value.fileName || ''}">${item.value.fileName?'<i class="fas fa-file-download"></i> ' + item.value.fileName:''}</a>
	</div>
	<input type="file" id="fileUpload_${item.id}" style="display:none;" accept="" >
	<input type="hidden" data-type="string" data-field="${item.field || ''}.data" name="${item.name}[data]" value="${item.value.data || ''}" >
	<input type="hidden" data-type="string" data-field="${item.field || ''}.type" name="${item.name}[type]" value="${item.value.type || ''}" >
	<input type="hidden" data-type="string" data-field="${item.field || ''}.fileName" name="${item.name}[fileName]" value="${item.value.fileName || ''}" >
	
	`
	s = frm_Group(s, item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	$(`${parentId} #fileUpload_${item.id}`).change(() => {
		let files = $(`${parentId} #fileUpload_${item.id}`).prop('files')
		if(files.length > 0) {
			let file = files[0]
			$(`${parentId} #${item.id}-img`).attr(`download`, file.name)

			let reader = new FileReader()
			reader.addEventListener("load", function() {
				$(`${parentId} #fileDownload_${item.id}`).attr('href', reader.result)
				$(`${parentId} #fileDownload_${item.id}`).attr('download', file.name)
				$(`${parentId} #fileDownload_${item.id}`).html(`<i class="fas fa-file-download"></i> ${file.name}`)

				$(`${parentId} input[name="${item.name}[data]"]`).val(reader.result)
				$(`${parentId} input[name="${item.name}[type]"]`).val(file.type)
				$(`${parentId} input[name="${item.name}[fileName]"]`).val(file.name)
			}, false)
			if(file) {
				reader.readAsDataURL(file)
			}
		}
	})

	cb()
}

function frm_NumberBox(parentId, item, cb) {
	let s = frm_GInput(`<input type="number" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  class="form-control text-end ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" value="${item.value!=undefined?item.value:0}">`, item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	cb()
}

function frm_FormattedNumberBox(parentId, item, cb) {

	switch (item.dataType) {
		case 'amount':
			frm_AmountBox(parentId, item, cb)
			break
		case 'price':
			frm_PriceBox(parentId, item, cb)
			break
		case 'quantity':
			frm_QuantityBox(parentId, item, cb)
			break
		default:
			frm_MoneyBox(parentId, item, cb)
			break
	}
}

function frm_MoneyBox(parentId, item, cb, cssId = 'frm-moneybox') {
	item.round = item.round || 2
	let input = `<input type="text" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  class="form-control formatted-number ${cssId} text-end ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" value="${convertNumber(item.value != undefined ? item.value : 0).formatMoney(item.round)}">`
	let s = frm_GInput(input, item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	$(`${parentId} #${item.id}`).on({
		focus: function() {
			if($(this).attr('readonly'))
				return
			let sbuf = $(`${parentId} #${item.id}`).val()

			$(this).attr('type', 'number')
			$(this).val(convertNumber(sbuf).round(item.round || 2))

		},
		blur: function() {
			let sbuf = $(`${parentId} #${item.id}`).val()
			$(this).attr('type', 'text')
			$(this).val(Number(sbuf).formatMoney(item.round || 2))
		}
	})
	cb()
}

function frm_PriceBox(parentId, item, cb) {

	frm_MoneyBox(parentId, item, cb, 'frm-pricebox')
}

function frm_QuantityBox(parentId, item, cb) {

	frm_MoneyBox(parentId, item, cb, 'frm-quantitybox')
}

function frm_AmountBox(parentId, item, cb) {

	frm_MoneyBox(parentId, item, cb, 'frm-amountbox')
}


function frm_TotalBox(parentId, item, cb) {
	let input = `<input type="text" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}" class="formatted-number w-100 border-0 text-end ${item.class || ''}" id="${item.id}" name="${item.name}" value="${convertNumber(item.value != undefined ? item.value : 0).formatMoney(item.round || 2)}" readonly>`
	let s = ''
	// if(item.noGroup === true) {
	// 	s = input
	// } else {

	s = `
		<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 ${item.visible===false?'d-none':''}">
			<div class="table-responsive">
				<table class="table align-middle m-0" title="${item.title || item.text || ''}">
					<tbody>
						<tr class="totalbox-row">
							<td class="w-50 text-start align-bottom py-0">${item.text || ''}</td>
							<td class="w-50 text-end align-bottom py-0">${input}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		`
	// }


	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))



	cb()
}


function frm_DateBox(parentId, item, cb) {
	let s = frm_GInput(`<input type="date" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}" class="form-control ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" value="${item.value!=undefined?item.value:''}">`, item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	cb()
}

function frm_TimeBox(parentId, item, cb) {
	let s = frm_GInput(`<input type="time" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}" class="form-control ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}" id="${item.id}" name="${item.name}" step="1" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" value="${(item.value!=undefined?item.value:'').substr(0,8)}">`, item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	cb()
}

function frm_Lookup(parentId, item, cb) {
	// let s = `<select type="text" class="form-control ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" autocomplete="off" ${item.required?'required="required"':''} ${item.readonly==true?'disabled':''} onchange="${item.onchange || ''}">
	// <option value="" ${item.value==''?'selected':''}>${item.showAll===true?'*':'-- Seç --'}</option>`
	let s = `<select level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}" class="form-control ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" autocomplete="off" ${item.required?'required="required"':''} ${item.readonly==true?'disabled':''} onchange="${item.onchange || ''}">
	<option value="" ${item.value==''?'selected':''}>&#x2315;</option>`
	if(item.lookup) {
		if(Array.isArray(item.lookup)) {
			item.lookup.forEach((e) => {
				s += `<option value="${e}" ${e==item.value?'selected':''}>${e}</option>`
			})
		} else {
			Object.keys(item.lookup).forEach((key) => {
				s += `<option value="${key}" ${key==item.value?'selected':''}>${item.lookup[key]}</option>`
			})
		}

	}
	s += `</select>`

	if(item.lookupTextField) {
		s += `<input type="hidden" name="${item.lookupTextFieldName || ''}" data-type="string" data-field="${item.lookupTextField}"  value="">`
	}

	s = frm_GInput(s, item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	if(item.lookupTextField) {
		$(`${parentId} #${item.id}`).on('change', () => {
			if($(`${parentId} #${item.id}`).val() != '') {
				$(`${parentId} input[name="${item.lookupTextFieldName || ''}"]`).val($(`${parentId} #${item.id} option:selected`).text())
			} else {
				$(`${parentId} input[name="${item.lookupTextFieldName || ''}"]`).val('')
			}
		})
	}

	cb()
}

function frm_CheckBoxLookup(parentId, item, cb) {

	let s = ``

	let input = `
	<select name="${item.name}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  id="${item.id}" class="form-control ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}" title="${item.title || item.text || ''}">
	<option value="">&#x2315;</option>
	<option value="true" ${(item.value!=undefined?item.value:'').toString()=='true'?'selected':''}><i class="fas fa-check-square text-primary"></i> Evet</option>
	<option value="false" ${(item.value!=undefined?item.value:'').toString()=='false'?'selected':''}><i class="far fa-square text-dark"></i> Hayır</option>
	</select>
	`
	if(item.noGroup === true) {
		s = input
	} else {
		s = `<div id="col_${item.id}" class="${item.col || ''} p-1 ${item.visible===false?'d-none':''}">
		<div class="form-group">
		<label>
		<span class="mb-1" style="display:block;">${item.text || ''}${helpButton(item)}</span>
		${input}
		</label>
		</div>
		</div>`
	}

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	cb()
}

function frm_RemoteLookup(parentId, item, cb) {

	let s = ``

	let input = `
	<input type="hidden" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  name="${item.name}" value="${item.value!=undefined?item.value:''}">
	<input type="hidden" id="${item.id}-obj"  value="">
	`

	if(item.lookupTextField) {
		input += `<input type="hidden" level="${item.level || ''}" data-type="string" data-field="${item.lookupTextField}"  name="${item.lookupTextFieldName || ''}" value="${item.valueText || ''}">`
	}

	if(item.hiddenFields) {
		if(Array.isArray(item.hiddenFields)) {
			item.hiddenFields.forEach((e) => {
				if(e != '')
					input += `<input type="hidden" level="${item.level || ''}" data-type="string" data-field="${e}"  name="${generateFormName(e)}" value="">`
			})

		} else if(typeof item.hiddenFields == 'object') {
			Object.keys(item.hiddenFields).forEach((key)=>{
				input += `<input type="hidden" level="${item.level || ''}" data-type="string" data-field="${key}"  name="${generateFormName(key)}" value="">`
			})
		}

	}

	input += `<input type="search" level="${item.level || ''}" class="form-control ${item.class || ''} ${item.noGroup === true && item.visible===false?'d-none':''}" id="${item.id}-autocomplete-text"  placeholder="${item.noGroup === true?'&#x2315;':''}${item.placeholder || ' '}" value="${item.valueText || ''}" autocomplete="off"  ${item.required?'required="required"':''} ${item.readonly?'readonly':''} title="${item.title || 'Tümünü listelemek için BOŞLUK tuşuna basabilirsiniz.'}" >`

	if(item.noGroup === true) {
		s = input
	} else {
		s = `<div id="col_${item.id}" class="${item.col || ''} p-1 ${item.visible===false?'d-none':''}">
		<div class="form-floating">
		${input}
		<label for="${item.id}-autocomplete-text" class="text-nowrap"><i class="fas fa-search"></i> ${item.text || ''}</label>
		</div>
		</div>
		`
	}


	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	remoteLookupAutocomplete(item)
	cb()
}

function frm_CheckBox(parentId, item, cb) {
	let s = ``
	let sClass = `${item.class || 'form-check-input'}`

	if((item.name || '').toLowerCase().indexOf('passive') > -1) {
		sClass = `${item.class || 'form-check-input switch-dark'}`
	}

	let input = `<input type="checkbox" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  class="${sClass} ${item.noGroup === true && item.visible===false?'d-none':''}" id="${item.id}" name="${item.name}"  value="true" ${item.value==true?'checked':''} ${item.readonly==true?'disabled':''} onchange="${item.onchange || ''}" />`
	if(item.noGroup === true) {
		s = `<div class="form-switch  text-center  m-0  p-0 ms-3 ps-3">
		${input}
		</div>`
	} else {
		s = `<div id="col_${item.id}" class="${item.col || ''} p-1 d-flex align-items-center ${item.visible===false?'d-none':''}">
		<div class="form-check form-switch ${item.insideOfGrid?'':''}" title="${item.title || item.text || ''}">
		${input}
		<label class="form-check-label" for="${item.id}">${item.text || ''}${helpButton(item)}</label>
		
		</div>
		</div>`
	}

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	cb()
}

function frm_DateRangeBox(parentId, item, cb) {
	let s = `
	<div id="col_${item.id}" class="${item.col || 'col-md-auto'} p-1 ${item.visible===false?'d-none':''}">
	<div id="${item.id}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  class="d-md-flex m-0 p-0">
		<div class="form-floating">
			<select class="form-control ${item.class || ''}" name="cbDate" id="cbDate">
			<option value="">Tarih</option>
			<option value="today">Bugün</option>
			<option value="thisWeek">Bu Hafta</option>
			<option value="thisMonth">Bu Ay</option>
			<option value="lastMonth">Geçen Ay</option>
			<option value="last1Week">Son 1 Hafta</option>
			<option value="last1Month">Son 1 Ay</option>
			<option value="last3Months">Son 3 Ay</option>
			<option value="last6Months">Son 6 Ay</option>
			<option value="thisYear">Bu yıl</option>
			<option value="last1Year">Son 1 yıl</option>
			</select>
			<label for="cbDate" class="">Tarih</label>
		</div>
		<div class="d-md-flex">
			<div class="form-floating">
				<input type="date" name="date1" id="date1" class="form-control" value="${moment().format('YYYY-MM-DD')}">
				<label for="date1" class="">Başlangıç</label>
			</div>
			<div class="form-floating">
				<input type="date" name="date2" id="date2" class="form-control" value="${moment().format('YYYY-MM-DD')}">
				<label for="date2" class="">Bitiş</label>
			</div>
		</div>
	</div>
	</div>`

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	var bNoAction = false

	$(`${parentId} #${item.id} #cbDate`).on('change', () => {
		if(bNoAction)
			return
		bNoAction = true
		cbDate_onchange(`${parentId} #${item.id}`)
		if(document.querySelector('#filterForm')) {
			runFilter('#filterForm')
		}
		bNoAction = false
	})


	if((hashObj.query.cbDate || '') != '') {
		$(`${parentId} #${item.id} #cbDate`).val(hashObj.query.cbDate)
		if(hashObj.query.date1 || '' != '') {
			$(`${parentId} #${item.id} #date1`).val(hashObj.query.date1)
		}
		if(hashObj.query.date2 || '' != '') {
			$(`${parentId} #${item.id} #date2`).val(hashObj.query.date2)
		}
	} else if((hashObj.query.cbDate || '') == '' && hashObj.query.date1 && hashObj.query.date2) {
		$(`${parentId} #${item.id} #cbDate`).val('')
		$(`${parentId} #${item.id} #date1`).val(hashObj.query.date1)
		$(`#${item.id} #date2`).val(hashObj.query.date2)

		pageSettings.setItem('cbDate', '')

	} else if(pageSettings.getItem('cbDate')) {
		$(`${parentId} #${item.id} #cbDate`).val(pageSettings.getItem('cbDate'))
		cbDate_onchange(`${parentId} #${item.id}`)

	} else {
		if($(`${parentId} #${item.id} #cbDate`).val() == '') {
			$(`${parentId} #${item.id} #cbDate`).val('thisMonth')
		}
	}






	cb()
}

function cbDate_onchange(parentId) {
	let obj = cboEasyDateChange($(`${parentId} #cbDate`).val())
	$(`${parentId} #date1`).val(obj.date1)
	$(`${parentId} #date2`).val(obj.date2)
	if($(`${parentId} #cbDate`).val() != '')
		pageSettings.setItem('cbDate', $(`${parentId} #cbDate`).val())
}