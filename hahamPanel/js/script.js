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

	document.querySelector('#usernameLabel').innerHTML = global.username
	document.querySelector('#usernameLabelMobile').innerHTML = global.username

	document.querySelector('#innerWidth').innerHTML = `${window.innerWidth}x${window.innerHeight} px`
	document.querySelector('#copy-right').innerHTML = config.ui.copyRight || '(c)'
}



loadUIVariables()

function toggleMenu(status) {
	if(status == 'show') {
		$('#side-menu').toggle(0)
	} else if(window.innerWidth < 1000) {
		$('#side-menu').hide()

	}
}

var mainDivId = '#mainCtrl'
if(window.location.hash == '') {
	window.location.hash = '/dashboard/main?mid=0'
	window.location.reload()
}

$(document).ready(() => {
	sayfayiGoster()
	window.onhashchange = () => {
		hashObj = getHashObject()

		sayfayiGoster()
	}
})

function sayfayiGoster() {
	if(hashObj == undefined)
		return

	publishPage(mainDivId,
		() => { //before
			anotherViewStyle(mainDivId)
			$(mainDivId).html('loading...')

			if((((hashObj || {}).query || {}).mid || '') != '') {
				$(`#leftMenu a`).removeClass('active')
				$(`#leftMenu #menu${hashObj.query.mid.replaceAll('.','-')}`).addClass('active')
			}
			toggleMenu()
		},
		() => { //after

		})
}




function anotherViewStyle(divId) {
	switch ((hashObj.query || {}).view || '') {
		case 'print':
			viewStylePrint(divId)
			break
		case 'plain':
			viewStylePlain(divId)
			break
	}
}

function viewStylePlain(divId) {

	$('body').addClass('plain')

}

function viewStylePrint(divId) {

	// $('body').hide()

	$('body').addClass('print')

	if(!document.querySelector('#printButtonPanel')) {
		let s = `<div id="printButtonPanel" class="px-2 d-flex justify-content-end align-items-center">
		<a class="btn btn-outline-light" href="javascript:frameYazdir('${divId} iframe')"><i class="fas fa-print"></i> Yazdır</a>
		<a class="btn btn-dark ms-3" href="javascript:pencereyiKapat()"><i class="fas fa-times"></i> Kapat</a>
		</div>
		`
		document.querySelector('#right-side main').insertAdjacentHTML('afterend', s)
	}

	// $('body').show()
}


function generateMenu(menu, parent,baseElem='') {
	let mId = '0'
	let s = ''
	if(hashObj && hashObj.query && hashObj.query.mid) {
		mId = hashObj.query.mid
	}
	Object.keys(menu).forEach((key) => {
		let item = menu[key]
		if(item.visible !== false) {
			item.expanded = false
			item.active = item.mId == mId ? true : false
			let menuId = item.mId.replaceAll('.', '-')
			let parentMenuId = (parent ? parent.mId || '' : '').replaceAll('.', '-')
			if(item.fields != undefined) {
				Object.keys(item.fields).forEach((key2) => {
					if(item.fields[key2].mId == mId)
						item.expanded = true
				})
				s += `
			<a class="nav-link" href="#" data-bs-toggle="collapse" data-bs-target="#pagesCollapse${menuId}" aria-expanded="${item.expanded}" aria-controls="pagesCollapse${menuId}">
				${item.icon?'<i class="' + item.icon + '"></i>':''}${item.text || ''} <i class="fas fa-angle-down float-end"></i>
			</a>
			<div class="collapse ${item.expanded?'show':''}" id="pagesCollapse${menuId}" data-bs-parent="${parentMenuId!=''?'#pagesCollapse'+parentMenuId:baseElem}">
				<nav class="nav ms-2 accordion" id="navId${menuId}">
					${generateMenu(item.fields, item)}
				</nav>
			</div>
			`

			} else {
				let hrefPath = item.path + (item.path.indexOf('?') > -1 ? '&' : '?') + `mid=${item.mId}`
				s += `<a class="nav-link ${item.active?'active':''} ${parent?'ms-2':''}" href="#${hrefPath}">${item.icon?'<i class="' + item.icon + '"></i>':''}${item.text || ''}</a>`
			}
		}
	})
	return s
}

document.querySelector('#leftMenu').innerHTML = generateMenu(global.menu,null,'#leftMenu')

function changeColorScheme(theme) {
	if (theme)
		localStorage.setItem('theme', theme)
	let codeTheme='vs-dark'
	if (localStorage.getItem('theme') == 'light') {
		codeTheme='vs'
		document.documentElement.classList.remove('dark')
		document.documentElement.classList.add('light')
	} else {
		document.documentElement.classList.remove('light')
		document.documentElement.classList.add('dark')
	}
	let codeDivList=document.querySelectorAll('div[data-type=code]')
	let i=0
	while(i<codeDivList.length){
		codeDivList[i].editor.updateOptions({theme:codeTheme})
		i++
	}
}

changeColorScheme()



function scrollToTop() {
	document.querySelector('#right-side').scrollTop = 0;
}

if (localStorage.getItem('theme') == null) {
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		localStorage.setItem('theme', 'dark')
	} else {
		localStorage.setItem('theme', 'light')
	}
}




$(document).ready(function () {

	$('body, #right-side').on('scroll', function () {
		let scrollDistance = $(this).scrollTop()
		if (scrollDistance > 100) {
			$('.scroll-to-top').fadeIn()
		} else {
			$('.scroll-to-top').fadeOut()
		}
	})

	$('body').on('keydown', 'input, select', function (e) {
		if (e) {
			if (e.key) {
				if (e.key === "Enter") {
					return enterNext(this)
				}
			}
		}
	})

	loadCardCollapses()

	//hahamInclude()

	configUI()
})