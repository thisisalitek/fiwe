function frm_Card(parentId, item, cb) {
	//	<a class="btn btn-collapse ${item.collapsed?'collapsed':''}" data-bs-toggle="collapse" data-bs-target="#cardCollapse${item.id}" aria-expanded="${!item.collapsed?'false':'true'}" aria-fields="cardCollapse${item.id}" href="#"><i class="far fa-caret-square-up fa-2x"></i></a>

	let s = `
	<div  id="col_${item.id}"  class="${item.col || ''} p-1 pb-1 ${item.visible === false ? 'd-none' : ''}">
	<div class="card cerceve1 ${item.level > 1 ? 'child' : 'mother'} ${item.class || ''}  level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}" >
		<div class="card-header ${item.showHeader === false ? 'd-none' : ''}"  >
			<span class="hand-pointer" data-bs-toggle="collapse" data-bs-target="#cardCollapse${item.id}" aria-expanded="${!item.collapsed ? 'false' : 'true'}" aria-fields="cardCollapse${item.id}">
			<a class="btn btn-collapse ${item.collapsed ? 'collapsed' : ''}" data-bs-toggle="collapse" data-bs-target="#cardCollapse${item.id}" aria-expanded="${!item.collapsed ? 'false' : 'true'}" aria-fields="cardCollapse${item.id}" ><i class="fas fa-caret-up fa-2x"></i></a>	
			${item.text}${helpButton(item)}
			</span>
		</div>
		<div  id="cardCollapse${item.id}" class="card-body  card-collapse collapse ${item.collapsed ? 'collapsed' : 'show'}">
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


function frm_ExcelData(parentId, item, cb) {
	item.firstRowIsHeader = true
	// 	let s = `
	// <div id="col_${item.id}" class="${item.col || 'col-12'} p-1 ${item.visible === false ? 'd-none' : ''}">
	// <select class="form-control" id="${item.id}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  data-encoding="${item.encoding || ''}" class="">
	// </select>
	// </div>
	// `
	let excelDataItem = {}
	Object.keys(item).forEach(key => {
		if (key != 'value') {
			excelDataItem[key] = item[key]
		}
	})
	excelDataItem.lookup = {}

	if (Array.isArray(item.value)) {
		item.value.forEach((e, index) => {
			excelDataItem.lookup[index] = {
				text: `${(new Date(e.createdDate)).yyyymmddhhmmss()} ${e.fileName}`,
				value: encodeURIComponent2(JSON.stringify(e.data))
			}
		})
	}

	frm_Lookup(parentId, excelDataItem, () => {
		let s = `<div id="${excelDataItem.id}-excel" class="w-100 p-0"></div>`
		document.querySelector(`${parentId}`).insertAdjacentHTML('beforeend', htmlEval(s))
		cb()
	})

	$(`${parentId} #${excelDataItem.id}`).change(function () {
		document.querySelector(`${parentId} #${excelDataItem.id}-excel`).innerHTML = ''
		let excelCtrlItem = {
			id: `${excelDataItem.id}-excel-item`,
			name: `${excelDataItem.name}.excel.item`,
			type: 'excel',
			field: 'denememe',
			value: JSON.parse(decodeURIComponent($(this).val()))
		}
		frm_Excel(`${parentId} #${excelDataItem.id}-excel`, excelCtrlItem, () => {

		})

	})

	$(document).on('loaded', (e) => {

		$(this).off(e)
	})



	cb()
}

function frm_Excel(parentId, item, cb) {
	item.firstRowIsHeader = true
	let s = `
<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 ${item.visible === false ? 'd-none' : ''}">
<ul class="nav nav-tabs" id="${item.id}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  data-encoding="${item.encoding || ''}" class=""></ul>
<div class="tab-content p-1" id="${item.id}-tabContent"></div>
</div>
`

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))


	if (Array.isArray(item.value)) {
		item.value = {
			Sheet1: item.value
		}
	}

	Object.keys(item.value).forEach((sheetName, sheetIndex) => {
		let tabId = `${item.id}-sheet${sheetIndex + 1}`
		let sheet = item.value[sheetName]
		document.querySelector(`${parentId} #${item.id}`).insertAdjacentHTML('beforeend', `
		<li class="nav-item" role="presentation">
	    <button class="nav-link ${sheetIndex == 0 ? 'active' : ''}" id="${tabId}-tab" data-bs-toggle="tab" data-bs-target="#${tabId}" type="button" role="tab" aria-controls="${tabId}" aria-selected="${sheetIndex == 0 ? 'true' : 'false'}">${sheetName}</button>
	  </li>
		`)
		document.querySelector(`${parentId} #${item.id}-tabContent`).insertAdjacentHTML('beforeend', `
		<div class="tab-pane fade ${sheetIndex == 0 ? 'show active' : ''}" id="${tabId}" role="tabpanel" aria-labelledby="${tabId}-tab">
		</div>`)
		let fields = {}
		let fieldList = []
		let data = []
		if (Array.isArray(sheet) && Array.isArray(sheet[0])) {
			sheet[0].forEach((e, colIndex) => {
				if (item.firstRowIsHeader) {
					fields[`col_${colIndex + 1}`] = { text: e, type: '' }
				} else {
					fields[`col_${colIndex + 1}`] = { text: `col_${colIndex + 1}`, type: '' }
				}
			})
			fieldList = Object.keys(fields)
			sheet.forEach((row, rowIndex) => {
				let obj = {}
				fieldList.forEach((fieldName, colIndex) => {
					obj[fieldName] = row[colIndex]
					if ((item.firstRowIsHeader && rowIndex > 0 || !item.firstRowIsHeader && rowIndex >= 0) && fields[fieldName].type == '') {
						if (!isNaN(obj[fieldName])) {
							fields[fieldName].type = 'number'
							fields[fieldName].width = '150px'
						} else if (obj[fieldName] == null) {
							fields[fieldName].type = ''
							fields[fieldName].width = '150px'
						} else {
							fields[fieldName].type = 'string'
							fields[fieldName].width = '280px'
						}
					}


				})
				if (!item.firstRowIsHeader || rowIndex > 0) {
					data.push(obj)
				}
			})
		}

		let gridItem = {
			id: `${tabId}-grid`,
			type: 'grid',
			text: sheetName,
			parentField: item.field,
			field: item.field,
			fields: fields,
			value: data,
			level: item.level + 1,
			options: {
				buttons: {
					add: true,
					edit: true,
					delete: true,
				}
			}
		}
		grid(`#${tabId}`, gridItem, false, () => { })
	})


	$(document).on('loaded', (e) => {

		$(this).off(e)
	})



	cb()
}

function frm_Tab(parentId, item, cb) {
	let bActive = false
	item.tabs.forEach((tab) => {
		if (tab.active === true) {
			bActive = true
			return
		}
	})
	if (!bActive && item.tabs.length > 0) {
		item.tabs[0].active = true
	}

	let s = `
	<div id="col_${item.id}" class="col-12 p-1 ">
	<ul class="nav nav-tabs" role="tablist" level="${item.level}">`
	item.tabs.forEach((tab, tabIndex) => {
		s += `<li class="nav-item">
		<a class="nav-link ${tab.active ? 'active' : ''}" href="#formTab${item.id}${tabIndex}" role="tab" data-bs-toggle="tab" id="IDformTab${item.id}${tabIndex}" aria-controls="formTab${item.id}${tabIndex}" aria-selected="${tab.active ? 'true' : 'false'}">
		${tab.icon ? '<i class="' + tab.icon + '"></i>' : ''} ${tab.text || ''}
		</a>
		</li>`
	})
	s += `</ul>
	<div class="tab-content" style="min-height: 60vh;overflow: auto;">`
	item.tabs.forEach((tab, tabIndex) => {
		s += `<div class="tab-pane ${tab.active ? 'show active' : ''}" id="formTab${item.id}${tabIndex}" role="tabpanel" aria-labelledby="IDformTab${item.id}${tabIndex}">
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
	if (item.noGroup === true) {
		return input
	} else {
		return `
		<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 ${item.visible === false ? 'd-none' : ''}">
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
	if (item.noGroup === true) {
		return input
	} else {
		return `
		<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 ${item.visible === false ? 'd-none' : ''}"">
		${input}
		</div>
		`
	}

	// ps-0 ps-md-1 pb-0 pb-md-3 
}

function frm_FormHtml(parentId, item, cb) {

	let html = ''
	if (item.html) {
		html = replaceUrlCurlyBracket(item.html, item) || ''
	} else {
		html = item.value
	}


	if ($('body').hasClass('print')) {
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

	let s = frm_Group(`<label level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  id="${item.id}" class="m-0 p-0  ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" title="${item.title || item.text || ''}">${itemLabelCaption(item, (item.value || item.text || ''))}</label>`, item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	if (item.id && item.value)
		$(`${parentId} #${item.id}`).val(item.value)

	cb()
}

function frm_Alert(parentId, item, cb) {

	let s = frm_Group(`<label level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  id="${item.id}" class="m-0 alert alert-info alert-${item.type} small w-100 p-1 my-1 ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" title="${item.title || item.text || ''}">${item.value || item.text || ''}</label>`, item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	if (item.id && item.value)
		$(`${parentId} #${item.id}`).val(item.value)

	cb()
}


function frm_TextBox(parentId, item, cb) {
	let s = frm_GInput(`<input type="text" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  class="form-control ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required ? 'required="required"' : ''} ${item.readonly == true ? 'readonly' : ''} onchange="${item.onchange || ''}" autocomplete="off" value="${item.value != undefined ? item.value : ''}">`, item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	$(`${parentId} #${item.id}`).val(item.value != undefined ? item.value : '')

	cb()
}

function frm_InputHidden(parentId, item, cb) {

	let s = `<input type="hidden" id="${item.id}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"   name="${item.name}" onchange="${item.onchange || ''}" value="${item.value != undefined ? item.value : ''}">`

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	$(`${parentId} #${item.id}`).val(item.value != undefined ? item.value : '')
	cb()
}

function frm_Button(parentId, item, cb) {
	let label = `${item.text || ''}`
	let titleText = `${item.title || item.text || ''}`
	if (item.icon) {
		label = `<i class="${item.icon}"></i> ${label}`
	}

	let href = `${item.href || (item.value || '')}`
	if (href.length > 2) {
		if (global.basePath != '' && href[0] == '/' && href[1] != '/') {
			href = global.basePath + href
		}
	}
	let s = `<a class="${item.class || 'btn btn-info'} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"   id="${item.id || ''}" href="${href}" target="${item.target || ''}" title="${titleText.replaceAll('"', '\'')}">${label}</a>`

	if (item.noGroup !== true) {
		s = `<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 d-flex align-items-center ${item.visible === false ? 'hidden' : ''}">
		${s}
		</div>
		`
	}

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	cb()
}

function frm_TextareaBox(parentId, item, cb) {

	let s = `
	<textarea level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"   class="form-control text-nowrap ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}"  style="font-family: courier new;height:auto;"  id="${item.id}-textarea" rows="${item.rows || 4}"  placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required ? 'required="required"' : ''} ${item.readonly == true ? 'readonly' : ''} onchange="${item.onchange || ''}" autocomplete="off" spellcheck="false"></textarea>
	<input type="hidden" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"   id="${item.id}" name="${item.name}" >
	`

	s = frm_GInput(s, item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	let textAreaValue = item.value != undefined ? item.value : ''
	if (item.encoding == 'base64') {
		textAreaValue = b64DecodeUnicode(item.value != undefined ? item.value : '')
	}

	document.querySelector(`${parentId} #${item.id}-textarea`).onkeydown = function (e) {
		if (e.keyCode === 9) {
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
		if (item.encoding == 'base64') {
			$(`${parentId} #${item.id}`).val(b64EncodeUnicode($(`${parentId} #${item.id}-textarea`).val()))
		} else {
			$(`${parentId} #${item.id}`).val($(`${parentId} #${item.id}-textarea`).val())
		}
	})

	cb()
}

function changeEditorOptions(divId, options) {
	let editor = document.querySelector(divId).editor
	editor.updateOptions(options)

}

function changeEditorLanguage(divId, langugage) {
	let editor = document.querySelector(divId).editor
	let model = editor.getModel()
	monaco.editor.setModelLanguage(model, langugage)
}

function copyClipboardEditor(divId) {
	let editor = document.querySelector(divId).editor
	navigator.clipboard.writeText(editor.getValue())
}


function clearEditor(divId) {

	let editor = document.querySelector(divId).editor
	editor.executeEdits('', [{ range: new monaco.Range(1, 1, editor.getModel().getLineCount(), 9999), text: null }])
	editor.focus()
}

function undoEditor(divId) {
	let editor = document.querySelector(divId).editor
	editor.trigger('aaaa', 'undo', 'aaaa')
	editor.focus()
}

function redoEditor(divId) {
	let editor = document.querySelector(divId).editor
	editor.trigger('aaaa', 'redo', 'aaaa')
	editor.focus()
}

function frm_CodeEditor(parentId, item, cb) {
	let s = `
	<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 ${item.visible === false ? 'd-none' : ''}">
	<div class="d-flex justify-content-between align-items-start">
		<div class="">
			<label id="${item.id}-label">${item.text}</label>
		</div>
		<div class="d-flex">
			<select id="${item.id}-language" class="form-control px-2 me-1" onchange="changeEditorLanguage('#${item.id}',this.value)">
				<option value="json">json</option>
				<option value="javascript">javascript</option>
				<option value="python">python</option>
				<option value="sql">SQL</option>
				<option value="html">Html</option>
				<option value="shell">shell</option>
			</select>
			<button type="button" id="${item.id}-undobtn" class="btn btn-toolbox" onclick="undoEditor('#${item.id}')" title="Undo"><i class="fas fa-rotate-left"></i></button>
			<button type="button" id="${item.id}-redobtn" class="btn btn-toolbox" onclick="redoEditor('#${item.id}')" title="Redo"><i class="fas fa-rotate-right"></i></button>
			<a class="btn btn-toolbox" onclick="clearEditor('#${item.id}')" title="Clear editor"><i class="fas fa-eraser"></i></a>
			<a class="btn btn-toolbox" href="javascript:copyClipboardEditor('#${item.id}')" title="Copy code"><i class="fas fa-copy"></i></a>
		</div>
	</div>
	<div id="${item.id}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  data-encoding="${item.encoding || ''}" style="width: 100%; height: ${(item.rows || 10) * 19}px; border: 1px solid grey" class=""></div>
	</div>
	`

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))


	let textAreaValue = item.value != undefined ? item.value : ''
	if (item.encoding == 'base64') {
		textAreaValue = b64DecodeUnicode(item.value != undefined ? item.value : '')
	}

	if (!item.editorOptions) {
		item.editorOptions = {
			language: 'javascript'
		}
	}
	$(document).on('loaded', (e) => {
		setTimeout(() => {
			let options = {
				value: textAreaValue,
				language: item.editorOptions.language || 'javascript',
				theme: localStorage.getItem('theme') == 'dark' ? 'vs-dark' : 'vs',
				automaticLayout: true,
				autoIndent: true,
				contextmenu: true,
				formatOnType: true,
				codeLens: true,
				scrollBeyondLastLine: true,
				lineNumbers: 'on',
				lineNumbersMinChars: 3,
				lineDecorationsWidth: 0,
				renderLineHighlight: 'none',
				minimap: {
					enabled: false
				}
			}
			if (item.editorOptions) {
				options = Object.assign({}, options, item.editorOptions)
			}
			var editor1 = monaco.editor.create(document.getElementById(`${item.id}`), options)

			document.getElementById(`${item.id}`).editor = editor1


			const initialVersion = editor1.getModel().getAlternativeVersionId()
			let currentVersion = initialVersion
			let lastVersion = initialVersion

			editor1.onDidChangeModelContent(e => {
				if(editor1.activeFileId){
					let activeFileLink=document.querySelector(editor1.activeFileId)
					if(activeFileLink && activeFileLink.fileItem){
						let filesItem=document.querySelector(activeFileLink.fileItem.baseElem).item
						let temp1=objectToListObject(filesItem.value,'/')
						temp1[activeFileLink.fileItem.filePath]=editor1.getValue()
						filesItem.value=listObjectToObject(temp1,'/')
						document.querySelector(activeFileLink.fileItem.baseElem).item=filesItem
					}
				}
				const versionId = editor1.getModel().getAlternativeVersionId()
				if (versionId < currentVersion) {
					document.getElementById(`${item.id}-redobtn`).disabled = false
					if (versionId === initialVersion) {
						document.getElementById(`${item.id}-undobtn`).disabled = true
					}
				} else {
					if (versionId <= lastVersion) {
						if (versionId == lastVersion) {
							document.getElementById(`${item.id}-redobtn`).disabled = true
						}
					} else {
						document.getElementById(`${item.id}-redobtn`).disabled = true
						if (currentVersion > lastVersion) {
							lastVersion = currentVersion
						}
					}
					document.getElementById(`${item.id}-undobtn`).disabled = false
				}
				currentVersion = versionId
			})

			$(`#${item.id}-language`).val(item.editorOptions.language)

		}, 500)
		$(this).off(e)
	})




	cb()
}

function getCodeFilesValue(targetObj, keyPath) {

	if (keyPath.substr(0, 1) == '/')
		keyPath = keyPath.substr(1)

	if (keyPath.substr(0, 2) == './')
		keyPath = keyPath.substr(2)
	
	let keys = keyPath.split('/')
	if (keys.length == 0)
		return ''
	
	keys = keys.reverse()
	let subObject = clone(targetObj)
	while (keys.length) {
		let k = keys.pop()
		subObject = subObject[k]
	}

	return subObject
}

function frm_CodeFiles_Show(fileId, parentId,filePath) {
	let fileLink = document.querySelector(fileId)

	if (fileLink) {
		let files = document.querySelectorAll(`${parentId} a.nav-link`)
		let i = 0
		while (i < files.length) {
			if (fileLink.id && fileLink.id == files[i].id) {
				files[i].classList.add('active')
			} else {
				files[i].classList.remove('active')
			}

			i++
		}

		let item=document.querySelector(parentId).item
		let fileItem = fileLink.fileItem

		

		if (fileItem != undefined && fileItem.editorId) {
			let fileLabel = document.querySelector(fileItem.editorId + '-label')

			if (fileLabel) {
				fileLabel.innerHTML = filePath
			}
			if (document.querySelector(fileItem.editorId)) {
				let editor = document.querySelector(fileItem.editorId).editor
				if (editor){
					editor.activeFileId = null
					editor.setValue(getCodeFilesValue(item.value,filePath))
					editor.activeFileId = fileId
				}
				
			}
		}
	}
}

function frm_CodeFiles_NewFile(baseElem,parentId){
	let div=document.querySelector(baseElem)
	let activeFolder=div.activeFolder

	let fields={
		path:{title:'path', value:'/' + activeFolder,readonly:true},
		newFileName:{title:'New file name', value:'newfile.py'},
	}
	copyX(fields,'<i class="fas fa-file-circle-plus"></i> New File',(answer,obj)=>{
		if(answer){
			if(!isValidFileName(obj.newFileName))
				return alertX('File name is incorrect')
			
			let item=div.item
			let temp1=objectToListObject(item.value,'/')
			let key=activeFolder?activeFolder  + '/' + obj.newFileName : obj.newFileName
			if(temp1[key]!=undefined)
				return alertX('There is another folder or file in the directory')
			temp1[key ]='## new file content'
			item.value=listObjectToObject(temp1,'/')
			div.parentNode.removeChild(div)
			frm_CodeFiles(parentId,item,()=>{},true)
		}
	})
}

function frm_CodeFiles_NewFolder(baseElem,parentId){
	let div=document.querySelector(baseElem)
	let activeFolder=div.activeFolder

	let fields={
		path:{title:'path', value:'/' + activeFolder,readonly:true},
		newFolder:{title:'New folder name', value:'newfolder'},
	}
	copyX(fields,'<i class="fas fa-folder-plus"></i> New Folder',(answer,obj)=>{
		if(answer){
			if(!isValidFileName(obj.newFolder))
				return alertX('Folder name is incorrect')
			let item=div.item
			let temp1=objectToListObject(item.value,'/')
			let key=activeFolder?activeFolder  + '/' + obj.newFolder : obj.newFolder
			if(temp1[key]!=undefined)
				return alertX('There is another folder or file in the directory')
			temp1[key ]={}
			item.value=listObjectToObject(temp1,'/')
			div.parentNode.removeChild(div)
			frm_CodeFiles(parentId,item,()=>{},true)
		}
	})
}

function frm_CodeFiles_Rename(baseElem,parentId){
	let div=document.querySelector(baseElem)
	let item=div.item
	let editor=document.querySelector(`${parentId} #${item.editorId}`).editor
	let fileItem=document.querySelector(editor.activeFileId).fileItem

	let dizi=fileItem.filePath.split('/')
	let fileName=dizi[dizi.length-1]
	dizi.splice(-1)
	let folder=dizi.join('/')
	let fields={
		path:{title:'Old', value:'/' + fileItem.filePath,readonly:true},
		rename:{title:'New', value:fileName},
	}
	copyX(fields,'<i class="fas fa-i-cursor"></i> Rename',(answer,obj)=>{
		if(answer){
			if(!isValidFileName(obj.rename))
				return alertX('File name is incorrect')
			
			let item=div.item
			let temp1=objectToListObject(item.value,'/')
			let key=folder?folder  + '/' + obj.rename : obj.rename

			if(temp1[key]!=undefined)
			return alertX('There is another folder or file in the directory')

			let backupData=temp1[fileItem.filePath]
			delete temp1[fileItem.filePath]
		
			temp1[key ]=backupData
			item.value=listObjectToObject(temp1,'/')
			div.parentNode.removeChild(div)
			document.querySelector(`${parentId} #${item.editorId}-label`).innerHTML=key
			frm_CodeFiles(parentId,item,()=>{},true)
		}
	})
}


function frm_CodeFiles(parentId, item, cb,bReload=false) {
	if(!item.value){
		item.value = {
			// 'bin': {
			// 	'config.json': 'rtyrtyrty',
			// 	'report.pdf': 'rtyrtygfhfgh'
			// },
			// 'lib': {
			// 	'deneme': {
			// 		'config.json': 'rtyrtyrty',
			// 		'report.pdf': 'rtyrtygfhfgh'
			// 	},
			// 	'mail.py': 'rtyrtyrty',
			// 	'document.txt': 'rtyrtygfhfgh'
			// },
			'__init__.py': '# python engine startup file\nfor i in range(5):\n\tprint(i)\n',
			// 'util.py': 'rtytyy',
			// 'dfdf.csv': '',
			// 'dfdfdf.docx': '',
			// 'dfdfdf34.xml': '',
		}
	}

	if(!item.editorId)
		item.editorId = 'mainCode'

	let baseElem = `${parentId} #${item.id}`
	let s = `
	<div id="${item.id}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  data-encoding="${item.encoding || ''}"  class="codeFiles">
			<label class="code-label">${item.text}</label>
			<div class="d-flex justify-content-end align-items-start">
					<a class="btn btn-toolbox" href="javascript:frm_CodeFiles_NewFolder('${baseElem}','${parentId}')" title="Add new folder"><i class="fas fa-folder-plus"></i></a>
					<a class="btn btn-toolbox" href="javascript:frm_CodeFiles_NewFile('${baseElem}','${parentId}')" title="Add new file"><i class="fas fa-file-circle-plus"></i></a>
					<a class="btn btn-toolbox" href="javascript:frm_CodeFiles_Rename('${baseElem}','${parentId}')" title="Rename"><i class="fas fa-i-cursor"></i></a>
					<a class="btn btn-toolbox" href="javascript:alertX('#${item.id}')" title="Copy file"><i class="fas fa-copy"></i></a>
					<a class="btn btn-toolbox" href="javascript:alertX('#${item.id}')" title="Cut file"><i class="fas fa-scissors"></i></a>
					<a class="btn btn-toolbox" href="javascript:alertX('#${item.id}')" title="Paste file"><i class="fas fa-paste"></i></a>
					<a class="btn btn-toolbox" href="javascript:alertX('#${item.id}')" title="Delete file"><i class="fas fa-trash-can"></i></a>

				</div>
			</div>
		</div>
	`
	if(!bReload){
		s=`<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 ${item.visible === false ? 'd-none' : ''}">
			${s}
		</div>
		`
		document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	}else{
		document.querySelector(`${parentId} #col_${item.id}`).insertAdjacentHTML('beforeend', htmlEval(s))
	}

	
	

	document.querySelector(`${baseElem}`).item = item
	document.querySelector(`${baseElem}`).activeFolder=''
	document.querySelector(`${baseElem}`).activeFile=''
	document.querySelector(`${baseElem}`).editor=document.querySelector(`${parentId} #${item.editorId}`)

	let menuId = 0
	

	function olustur(divId, obj, parentKey) {
		Object.keys(obj).forEach(key => {
			menuId++
			if (typeof obj[key] == 'string') {
				let icon = fileIcon(key)
				let m = `<a id="${item.id + menuId}" class="nav-link ${parentKey ? 'ms-2' : ''}" href="javascript:frm_CodeFiles_Show('${divId} #${item.id + menuId}','${baseElem}','${parentKey ? parentKey + '/' + key : key}')"><i class="${icon}"></i> ${key}</a>`

				document.querySelector(divId).insertAdjacentHTML('beforeend', m)
				document.querySelector(`${divId} #${item.id + menuId}`).fileItem = {
					baseElem: baseElem,
					filePath: parentKey ? parentKey + '/' + key : key,
					editorId: `${parentId} #${item.editorId}`
				} 
			} else {
				let icon = 'fas fa-folder'
				let expanded = false
				let folder=parentKey ? parentKey + '/' + key : key
				let m = `
				<a class="nav-link folder ${parentKey ? 'ms-2' : ''}" href="#" data-bs-toggle="collapse" data-bs-target="#codeFilesCollapse${item.id + menuId}" aria-expanded="${expanded}" aria-controls="codeFilesCollapse${item.id + menuId}">
				<i class="fas fa-folder"></i> ${key} 
				</a>
				<div class="collapse ${parentKey ? 'ms-2' : ''} ${expanded ? 'show' : ''}" id="codeFilesCollapse${item.id + menuId}" data-folder="${folder}" data-bs-parent="${parentKey ? generateFormId(parentKey) : baseElem}">
					<nav class="nav ms-2 accordion" id="navId${item.id + menuId}">
					</nav>
				</div>
				`
				document.querySelector(divId).insertAdjacentHTML('beforeend', m)
				$(`#codeFilesCollapse${item.id + menuId}`).on('shown.bs.collapse', (e) => {
					document.querySelector(`${baseElem}`).activeFolder=document.getElementById(e.target.id).getAttribute('data-folder')
					console.log(`activeFolder`, document.querySelector(`${baseElem}`).activeFolder)
				})
				$(`#codeFilesCollapse${item.id + menuId}`).on('hidden.bs.collapse', (e) => {
					let folder=document.getElementById(e.target.id).getAttribute('data-folder')
					if(folder){
						let list=document.querySelectorAll('div[data-folder]')
						let i=0
						while(i<list.length){
							if(list[i].getAttribute('data-folder').substr(0,folder.length+1)==(folder+'/')){
								$(`#${list[i].id}`).collapse('hide')
							}
							i++
						}

						// let openedFolders=document.querySelectorAll('div[data-folder].collapse.show')
						// console.log(`openedFolders`, openedFolders)
						list=document.querySelectorAll('div[data-folder]')
						document.querySelector(`${baseElem}`).activeFolder=''
						i=0
						while(i<list.length){
							if(list[i].classList.contains('show')){
								document.querySelector(`${baseElem}`).activeFolder=list[i].getAttribute('data-folder')
							}
							i++
						}

					}
					console.log(`activeFolder`, document.querySelector(`${baseElem}`).activeFolder)
				})

			
				olustur(`${baseElem} #navId${item.id + menuId}`, obj[key], `${parentKey ? parentKey + '/' + key : key}`)
			}
		})
	}

	olustur(`${parentId} #${item.id}`, item.value, '')

	$(document).on('loaded', (e) => {

		$(this).off(e)
	})

	cb()
}


function frm_ImageBox(parentId, item, cb) {
	let s = `
	<div class="${item.noGroup === true && item.visible === false ? 'd-none' : ''}">
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
		if (files.length > 0) {
			let file = files[0]
			$(`${parentId} #${item.id}-img`).attr(`download`, file.name)

			let reader = new FileReader()
			reader.addEventListener("load", function () {
				$(`${parentId} #${item.id}-img`).attr('src', reader.result)
				$(`${parentId} input[name="${item.name}[data]"]`).val(reader.result)
				$(`${parentId} input[name="${item.name}[type]"]`).val(file.type)
				$(`${parentId} input[name="${item.name}[fileName]"]`).val(file.name)
			}, false)
			if (file) {
				reader.readAsDataURL(file)
			}
		}
	})

	cb()
}

function frm_FileBox(parentId, item, cb) {
	let s = `
	<div class="${item.noGroup === true && item.visible === false ? 'd-none' : ''}">
	<label for="fileUpload_${item.id}" class="btn btn-primary hand-pointer" title="${item.title || item.text || ''}"><i class="fas fa-file-alt"></i> Dosya seçiniz</label>
	<div class="w-100 my-2"></div>
	<a id="fileDownload_${item.id}" class="" href="${item.value.data || '#'}" download="${item.value.fileName || ''}">${item.value.fileName ? '<i class="fas fa-file-download"></i> ' + item.value.fileName : ''}</a>
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
		if (files.length > 0) {
			let file = files[0]
			$(`${parentId} #${item.id}-img`).attr(`download`, file.name)

			let reader = new FileReader()
			reader.addEventListener("load", function () {
				$(`${parentId} #fileDownload_${item.id}`).attr('href', reader.result)
				$(`${parentId} #fileDownload_${item.id}`).attr('download', file.name)
				$(`${parentId} #fileDownload_${item.id}`).html(`<i class="fas fa-file-download"></i> ${file.name}`)

				$(`${parentId} input[name="${item.name}[data]"]`).val(reader.result)
				$(`${parentId} input[name="${item.name}[type]"]`).val(file.type)
				$(`${parentId} input[name="${item.name}[fileName]"]`).val(file.name)
			}, false)
			if (file) {
				reader.readAsDataURL(file)
			}
		}
	})

	cb()
}

function frm_NumberBox(parentId, item, cb) {
	let s = frm_GInput(`<input type="number" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  class="form-control text-end ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required ? 'required="required"' : ''} ${item.readonly == true ? 'readonly' : ''} onchange="${item.onchange || ''}" autocomplete="off" value="${item.value != undefined ? item.value : 0}">`, item)
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
	let input = `<input type="text" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  class="form-control formatted-number ${cssId} text-end ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required ? 'required="required"' : ''} ${item.readonly == true ? 'readonly' : ''} onchange="${item.onchange || ''}" autocomplete="off" value="${convertNumber(item.value != undefined ? item.value : 0).formatMoney(item.round)}">`
	let s = frm_GInput(input, item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	$(`${parentId} #${item.id}`).on({
		focus: function () {
			if ($(this).attr('readonly'))
				return
			let sbuf = $(`${parentId} #${item.id}`).val()

			$(this).attr('type', 'number')
			$(this).val(convertNumber(sbuf).round(item.round || 2))

		},
		blur: function () {
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
		<div id="col_${item.id}" class="${item.col || 'col-12'} p-1 ${item.visible === false ? 'd-none' : ''}">
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
	let s = frm_GInput(`<input type="date" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}" class="form-control ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required ? 'required="required"' : ''} ${item.readonly == true ? 'readonly' : ''} onchange="${item.onchange || ''}" autocomplete="off" value="${item.value != undefined ? item.value : ''}">`, item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	cb()
}

function frm_TimeBox(parentId, item, cb) {
	let s = frm_GInput(`<input type="time" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}" class="form-control ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" id="${item.id}" name="${item.name}" step="1" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" ${item.required ? 'required="required"' : ''} ${item.readonly == true ? 'readonly' : ''} onchange="${item.onchange || ''}" autocomplete="off" value="${(item.value != undefined ? item.value : '').substr(0, 8)}">`, item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))
	cb()
}

function frm_Lookup(parentId, item, cb) {
	// let s = `<select type="text" class="form-control ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" autocomplete="off" ${item.required?'required="required"':''} ${item.readonly==true?'disabled':''} onchange="${item.onchange || ''}">
	// <option value="" ${item.value==''?'selected':''}>${item.showAll===true?'*':'-- Seç --'}</option>`
	let s = `<select level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}" class="form-control ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || ' '}" title="${item.title || item.text || ''}" autocomplete="off" ${item.required ? 'required="required"' : ''} ${item.readonly == true ? 'disabled' : ''} onchange="${item.onchange || ''}">
	<option value="" ${item.value == '' ? 'selected' : ''}>&#x2315;</option>`
	if (item.lookup) {
		if (Array.isArray(item.lookup)) {
			item.lookup.forEach((e) => {
				let text = e.text ? e.text : e
				let value = e.value ? e.value : e
				s += `<option value="${value}" ${value == item.value ? 'selected' : ''}>${text}</option>`
			})
		} else {
			Object.keys(item.lookup).forEach((key) => {
				let text = item.lookup[key].text ? item.lookup[key].text : item.lookup[key]
				let value = item.lookup[key].value ? item.lookup[key].value : key
				s += `<option value="${value}" ${value == item.value ? 'selected' : ''}>${text}</option>`
			})
		}

	}
	s += `</select>`

	if (item.lookupTextField) {
		s += `<input type="hidden" name="${item.lookupTextFieldName || ''}" data-type="string" data-field="${item.lookupTextField}"  value="">`
	}

	s = frm_GInput(s, item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', htmlEval(s))

	if (item.lookupTextField) {
		$(`${parentId} #${item.id}`).on('change', () => {
			if ($(`${parentId} #${item.id}`).val() != '') {
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
	<select name="${item.name}" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  id="${item.id}" class="form-control ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" title="${item.title || item.text || ''}">
	<option value="">&#x2315;</option>
	<option value="true" ${(item.value != undefined ? item.value : '').toString() == 'true' ? 'selected' : ''}><i class="fas fa-check-square text-primary"></i> Evet</option>
	<option value="false" ${(item.value != undefined ? item.value : '').toString() == 'false' ? 'selected' : ''}><i class="far fa-square text-dark"></i> Hayır</option>
	</select>
	`
	if (item.noGroup === true) {
		s = input
	} else {
		s = `<div id="col_${item.id}" class="${item.col || ''} p-1 ${item.visible === false ? 'd-none' : ''}">
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
	<input type="hidden" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  name="${item.name}" value="${item.value != undefined ? item.value : ''}">
	<input type="hidden" id="${item.id}-obj"  value="">
	`

	if (item.lookupTextField) {
		input += `<input type="hidden" level="${item.level || ''}" data-type="string" data-field="${item.lookupTextField}"  name="${item.lookupTextFieldName || ''}" value="${item.valueText || ''}">`
	}

	if (item.hiddenFields) {
		if (Array.isArray(item.hiddenFields)) {
			item.hiddenFields.forEach((e) => {
				if (e != '')
					input += `<input type="hidden" level="${item.level || ''}" data-type="string" data-field="${e}"  name="${generateFormName(e)}" value="">`
			})

		} else if (typeof item.hiddenFields == 'object') {
			Object.keys(item.hiddenFields).forEach((key) => {
				input += `<input type="hidden" level="${item.level || ''}" data-type="string" data-field="${key}"  name="${generateFormName(key)}" value="">`
			})
		}

	}

	input += `<input type="search" level="${item.level || ''}" class="form-control ${item.class || ''} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" id="${item.id}-autocomplete-text"  placeholder="${item.noGroup === true ? '&#x2315;' : ''}${item.placeholder || ' '}" value="${item.valueText || ''}" autocomplete="off"  ${item.required ? 'required="required"' : ''} ${item.readonly ? 'readonly' : ''} title="${item.title || 'Tümünü listelemek için BOŞLUK tuşuna basabilirsiniz.'}" >`

	if (item.noGroup === true) {
		s = input
	} else {
		s = `<div id="col_${item.id}" class="${item.col || ''} p-1 ${item.visible === false ? 'd-none' : ''}">
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

	if ((item.name || '').toLowerCase().indexOf('passive') > -1) {
		sClass = `${item.class || 'form-check-input switch-dark'}`
	}

	let input = `<input type="checkbox" level="${item.level || ''}" data-type="${item.dataType}" data-field="${item.field || ''}"  class="${sClass} ${item.noGroup === true && item.visible === false ? 'd-none' : ''}" id="${item.id}" name="${item.name}"  value="true" ${item.value == true ? 'checked' : ''} ${item.readonly == true ? 'disabled' : ''} onchange="${item.onchange || ''}" />`
	if (item.noGroup === true) {
		s = `<div class="form-switch  text-center  m-0  p-0 ms-3 ps-3">
		${input}
		</div>`
	} else {
		s = `<div id="col_${item.id}" class="${item.col || ''} p-1 d-flex align-items-center ${item.visible === false ? 'd-none' : ''}">
		<div class="form-check form-switch ${item.insideOfGrid ? '' : ''}" title="${item.title || item.text || ''}">
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
	<div id="col_${item.id}" class="${item.col || 'col-md-auto'} p-1 ${item.visible === false ? 'd-none' : ''}">
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
		if (bNoAction)
			return
		bNoAction = true
		cbDate_onchange(`${parentId} #${item.id}`)
		if (document.querySelector('#filterForm')) {
			runFilter('#filterForm')
		}
		bNoAction = false
	})


	if ((hashObj.query.cbDate || '') != '') {
		$(`${parentId} #${item.id} #cbDate`).val(hashObj.query.cbDate)
		if (hashObj.query.date1 || '' != '') {
			$(`${parentId} #${item.id} #date1`).val(hashObj.query.date1)
		}
		if (hashObj.query.date2 || '' != '') {
			$(`${parentId} #${item.id} #date2`).val(hashObj.query.date2)
		}
	} else if ((hashObj.query.cbDate || '') == '' && hashObj.query.date1 && hashObj.query.date2) {
		$(`${parentId} #${item.id} #cbDate`).val('')
		$(`${parentId} #${item.id} #date1`).val(hashObj.query.date1)
		$(`#${item.id} #date2`).val(hashObj.query.date2)

		pageSettings.setItem('cbDate', '')

	} else if (pageSettings.getItem('cbDate')) {
		$(`${parentId} #${item.id} #cbDate`).val(pageSettings.getItem('cbDate'))
		cbDate_onchange(`${parentId} #${item.id}`)

	} else {
		if ($(`${parentId} #${item.id} #cbDate`).val() == '') {
			$(`${parentId} #${item.id} #cbDate`).val('thisMonth')
		}
	}






	cb()
}

function cbDate_onchange(parentId) {
	let obj = cboEasyDateChange($(`${parentId} #cbDate`).val())
	$(`${parentId} #date1`).val(obj.date1)
	$(`${parentId} #date2`).val(obj.date2)
	if ($(`${parentId} #cbDate`).val() != '')
		pageSettings.setItem('cbDate', $(`${parentId} #cbDate`).val())
}