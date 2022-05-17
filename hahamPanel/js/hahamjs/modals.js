addModalsToDocument()

function openUrl(url, _id, target, popup) {
	url = url.replaceAll('{_id}', _id)
	if(target == '_blank' && popup != true) {
		window.open(url, target)
	} else if(popup) {
		popupCenter(url, 'Goster', '900', '600')
	} else {
		localStorage.setItem('returnUrl', window.location.href)
		window.location.href = url
	}

}

function openInNewTab(url) {
	let win = window.open(url, '_blank')
	win.focus()
	return win
}

function popupCenter(url, title, w, h, isDialog = false) {
	let dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX
	let dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY

	let width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width
	let height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height

	let systemZoom = width / window.screen.availWidth
	let left = (width - w) / 2 / systemZoom + dualScreenLeft
	let top = (height - h) / 2 / systemZoom + dualScreenTop
	if(!isDialog) {
		let newWindow = window.open(url, title, 'scrollbars=yes, width=' + w / systemZoom + ', height=' + h / systemZoom + ', top=' + top + ', left=' + left)
		if(window.focus)
			newWindow.focus()
	} else {
		let newWindow = openDialog(url, title, 'scrollbars=yes, width=' + w / systemZoom + ', height=' + h / systemZoom + ', top=' + top + ', left=' + left)
		if(window.focus)
			newWindow.focus()
	}

}

var copyX_cb = null
var copyX_fields = {}

function copyX(fields, title, cb = null) {
	copyX_fields = fields
	copyX_cb = cb

	$('#modalCopyLabel').html(title)
	let s = ``
	Object.keys(fields).forEach((key) => {
		let field = fields[key]
		s += `<div class="form-group">
		<label class="m-0 p-0">${field.title || ''}</label>
		<input type="text" class="form-control ${field.class || ''}" id="modalCopyField-${generateFormId(key)}" placeholder="${ field.placeholder || field.title || ''}" ${field.readonly==true?'readonly':''} autocomplete="off" autofill="off" spellcheck="false" value="${field.value}">
		</div>`
	})
	$('#modalCopy .modal-body').html(s)

	$('#modalCopy').modal('show')

}

function modalCopyOk() {
	$('#modalCopy').modal('hide')
	if(copyX_cb) {
		let formData = {}
		Object.keys(copyX_fields).forEach((key) => {
			let field = copyX_fields[key]
			formData[key] = $(`#modalCopyField-${generateFormId(key)}`).val()
		})
		formData = listObjectToObject(clone(formData))

		copyX_cb(true, formData)

	} else {
		$('#modalCopy').modal('hide')
	}
}


function logout() {
	confirmX('Programdan çıkmak istiyor musunuz?', (resp) => {
		if(resp) {
			localStorage.removeItem('global')
			window.location.href = `/login`
		}
	})
}


var confirmX_response = false

function confirmX(message, type = 'info', cb) {
	confirmX_response = false
	if(typeof type == 'function') {
		cb = type
		type = 'info'
	}


	$('#modalConfirm .modal-header').removeClass('alert-warning')
	$('#modalConfirm .modal-header').removeClass('alert-info')
	$('#modalConfirm .modal-header').removeClass('alert-danger')

	$('#modalConfirm .modal-header').addClass(`alert-${type}`)

	$('#modalConfirm .modal-content .message').html(message.replaceAll('\n', '<br>'))

	$('#modalConfirm').modal('show')

	$('#modalConfirm').on('hidden.bs.modal', function(e) {
		$('#modalConfirm').unbind('hidden.bs.modal')
		if(cb) {
			cb(confirmX_response)
		}
	})

	$('#modalConfirmOk').on('click', function(e) {
		$('#modalConfirmOk').unbind('click')
		confirmX_response = true
		$('#modalConfirm').modal('hide')
	})
}



function alertX(message, title = '', type = 'info', cb) {
	let icon = 'fas fa-exclamation-triangle'

	if(typeof title == 'function') {
		cb = title
		title = ''
		type = 'info'
	} else if(typeof type == 'function') {
		cb = type
		type = 'info'
	}
	$('#modalMessage .modal-header').removeClass('alert-warning')
	$('#modalMessage .modal-header').removeClass('alert-info')
	$('#modalMessage .modal-header').removeClass('alert-danger')

	switch (type) {
		case 'danger':
			icon = 'fas fa-exclamation-triangle'
			$('#modalMessage .modal-header').addClass('alert-danger')
			break
		case 'warning':
			icon = 'fas fa-exclamation-triangle'
			$('#modalMessage .modal-header').addClass('alert-warning')
			break
		default:
			icon = 'fas fa-info-circle'
			$('#modalMessage .modal-header').addClass('alert-info')
			break
	}
	title = `<i class="${icon}"></i> ${title}`
	$('#modalMessageLabel').html(title)

	$('#modalMessage .modal-body').html(`${(message || '').replaceAll('\n','<br>')}`)

	$('#modalMessage').modal('show')
	$('#modalMessage').on('hidden.bs.modal', function(e) {
		if(cb)	cb('ok')
	})
}

function showError(err,cb) {
	alertX(`<small class="text-muted">${err.code || err.name || ''}</small><br>${err.message || err.name || ''}`, 'Hata', 'danger',cb)
}


function modalFormOptions() {
	if((global.formOptionsLink || '')==''){
		console.log('global.formOptionsLink bos olamaz.')
		return
	}
	let title=document.title.split(' - ')[0]
	let s = global.formOptionsLink
	if(s.indexOf('?') > -1) {
		s += '&'
	} else {
		s += '?'
	}
	s += `&module=${hashObj.module}`
	// popupCenter(s+'&view=plain',title,'900','600')
	window.location.hash=s
}

function reloadHaham(){
	location.href=global.basePath + '/changedb?ret=' + encodeURIComponent2(location.href)
}


function addModalsToDocument(parentId = 'body') {
	$(document).ready(() => {
		if(!document.querySelector(`${parentId} #modalFormOptions`)) {
			document.querySelector(parentId).insertAdjacentHTML('beforeend', `
		<div class="modal" id="modalFormOptions" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="true" aria-labelledby="modalFormOptionsLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
				<div class="modal-content border shadow">
					<div class="modal-header p-2 ">
						<label class="modal-title" id="modalFormOptionsLabel"><i class="fas fa-cogs"></i> Form Options</label>
						<button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body p-2" style="overflow: auto;">
						<table class="table form-table table-bordered table-striped m-0"  cellspacing="0">
							<thead>
								<tr class="text-nowrap">
									<th width="30" class="">#</th>
									<th class="">Program Adı</th>
									<th class="">Türü</th>
								</tr>
							</thead>
							<tbody id="gridPrograms">
							</tbody>
						</table>
					</div>
					<div class="modal-footer">
						<a class="btn btn-primary" href="javascript:modalFormOptions_OK()" title="Kaydet"><i class="fas fa-check"></i> Tamam</a>
						<button class="btn btn-dark" type="button" data-bs-dismiss="modal">Vazgeç</button>
					</div>
				</div>
			</div>
		</div>
		`)
		}
		if(!document.querySelector(`${parentId} #modalMessage`)) {
			document.querySelector(parentId).insertAdjacentHTML('beforeend', `
		<div class="modal" id="modalMessage" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="true" aria-labelledby="modalMessageLabel" aria-hidden="true" style="z-index: 1051">
			<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
				<div class="modal-content border shadow">
					<div id="modalMessageHeader" class="modal-header p-2 ">
						<label class="modal-title" id="modalMessageLabel"></label>
						<button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body p-2" style="overflow: auto;">
						
					</div>
					<div class="modal-footer">
						<button class="btn btn-primary" type="button" data-bs-dismiss="modal">Tamam</button>
					</div>
				</div>
			</div>
		</div>
	`)
		}
		if(!document.querySelector(`${parentId} #modalConfirm`)) {
			document.querySelector(parentId).insertAdjacentHTML('beforeend', `
		<div class="modal" id="modalConfirm" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="true" aria-labelledby="modalConfirmLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
				<div class="modal-content border shadow">
					<div class="modal-header modal-body row align-items-center p-3" style="overflow: auto;">
						<div class="col-md-2 icon" style="font-size:16pt;">
							<i class="fas fa-question-circle fa-2x"></i>
						</div>
						<div class="col message" style="font-size:12pt;">
						</div>
					</div>
					<div class="modal-footer">
						<button id="modalConfirmOk" class="btn btn-primary" type="button">Tamam</button>
						<button class="btn btn-dark" type="button" data-bs-dismiss="modal">Vazgeç</button>
					</div>
				</div>
			</div>
		</div>
	`)
		}

		if(!document.querySelector(`${parentId} #modalCopy`)) {
			document.querySelector(parentId).insertAdjacentHTML('beforeend', `
		<div class="modal" id="modalCopy" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="true" aria-labelledby="modalCopyLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
				<div class="modal-content border shadow">
					<div id="modalCopyHeader" class="modal-header p-2 ">
						<label class="modal-title"><i class="fas fa-copy"></i> <span id="modalCopyLabel"></span></label>
						<button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body" style="overflow: auto;">
						
					</div>
					<div class="modal-footer">
						<a href="javascript:modalCopyOk()" id="modalCopyOk" class="btn btn-primary">Tamam</a>
						<button class="btn btn-dark" type="button" data-bs-dismiss="modal">Vazgeç</button>
					</div>
				</div>
			</div>
		</div>
	`)
		}


		if(!document.querySelector(`${parentId} #modalRow`)) {
			document.querySelector(parentId).insertAdjacentHTML('beforeend', `
		<div class="modal" id="modalRow" tabindex="-1" role="dialog" data-backdrop="static" aria-labelledby="modalRowLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
				<div class="modal-content border shadow">
					<div id="modalRowHeader" class="modal-header p-2 ">
						<label class="modal-title"></label>
						<button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					
					
					
					<div class="modal-body p-1">
					<form>

					</form>	
					</div>

					<div class="modal-footer">
						<a href="javascript:modalRowOk()" id="modalRowOk" class="btn btn-primary">Tamam</a>
						<button class="btn btn-dark" type="button" data-bs-dismiss="modal">Vazgeç</button>
					</div>
					
				</div>
			</div>
		</div>
	`)
		}
	})
}