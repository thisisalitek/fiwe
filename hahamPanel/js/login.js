var ipInfo = { country_calling_code: '90' }

if(localStorage.getItem('ipInformation') == null) {
	postMan(`https://ipapi.co/json/`, { method: 'GET' })
		.then(result => {
			ipInfo = result
			localStorage.setItem('ipInformation', JSON.stringify(result))
		})
		.catch(err => {})
} else {
	ipInfo = JSON.parse(localStorage.getItem('ipInformation'))
}
if(ipInfo) {
	if(ipInfo.country_calling_code) {
		ipInfo.country_calling_code = ipInfo.country_calling_code.replaceAll('+', '')
	} else {
		ipInfo.country_calling_code = '90'
	}
}

let warnIcon = '<i class="fas fa-exclamation-triangle me-2"></i>'

let loginInfo = {
	username: getAllUrlParams().username || '',
	password: '',
	rePassword: '',
	authCode: '',
	resetCode: '',
}


let pages = {
	index: `
		<div class="title">Login</div>
			<div class="d-flex form-floating  pb-3">
				<input type="text" class="form-control" id="username" name="username" placeholder=" " autocomplete="username" autocapitalize="none" value="${q.username || ''}">
				<label for="username">Phone or email</label>
			</div>
		<div class="d-flex mt-4 justify-content-between align-items-center">
			<a class="skip-enter-next" href="#signup">Sign Up</a>
			<a class="btn btn-primary px-3" href="javascript:nextToPassword()">Next</a>
		</div>
	`,
	password: `
	<div class="title">${q.username || ''}</div>
	<div class="d-flex form-floating ps-1 pb-3">
		<input type="password" class="form-control" id="password" name="password" autocomplete="off" placeholder=" ">
		<label for="password">Password</label>
	</div>
	<a class="skip-enter-next" href="#forgot">Forgot your password?</a>
	<div class="d-flex mt-4 justify-content-between ">
		<a class="skip-enter-next" href="#">Back</a>
		<a class="btn btn-primary" href="javascript:login()">Login</a>
	</div>`,
	signup: `
	<div class="title" >Sign up</div>
	<div class="d-flex form-floating ps-1 pb-3">
		<input type="text" class="form-control" id="username" name="username" placeholder=" " autocomplete="off" autocapitalize="none" value="">
		<label for="username">Phone or email</label>
	</div>
	<div class="d-flex form-floating ps-1 pb-3">
		<input type="password" class="form-control" id="password" name="password" placeholder=" " autocomplete="off" autocapitalize="none" value="">
		<label for="password">Password</label>
	</div>
	<div class="d-flex form-floating ps-1 pb-3">
		<input type="password" class="form-control" id="rePassword" name="rePassword" placeholder=" " autocomplete="off" autocapitalize="none" value="">
		<label for="rePassword">Re-password</label>
	</div>

<div class="d-flex mt-4 justify-content-between align-items-center">
	<a class="skip-enter-next" href="">Back</a>
	<a id="btnCreate" class="btn btn-primary" href="javascript:createAccount()">Create</a>
</div>
	`,
	verify: `
	<div class="title">Verify</div>
	<div class="text-center" >${q.username || ''}</div>
	<div class="d-flex form-floating ps-1 pb-3">
		<input type="text" class="form-control auth-code-input" id="authCode" name="authCode" placeholder=" " autocomplete="off" autocapitalize="none" value="">
		<label for="authCode">Auth Code</label>
	</div>
	<div class="d-flex mt-4 justify-content-between align-items-center">
		<a class="skip-enter-next" href="">Back</a>
		<a id="btnVerify" class="btn btn-primary" href="javascript:verify()">Verify</a>
	</div>
	`,
	forgot: `
	<div class="title">Forgot Password</div>
		<div class="d-flex form-floating  pb-3">
			<input type="text" class="form-control" id="forgotUsername" name="forgotUsername" placeholder=" " autocomplete="forgotUsername" autocapitalize="none" value="${q.username || ''}">
			<label for="forgotUsername">Phone or email</label>
		</div>
	<div class="d-flex mt-4 justify-content-between align-items-center">
		<a class="skip-enter-next" href="">Back</a>
		<a class="btn btn-primary px-3" href="javascript:forgotPass()">Send Reset Link</a>
	</div>
	`,
	reset: `
	<div class="title" >Reset Password</div>
	<div class="d-flex form-floating ps-1 pb-3">
		<input type="password" class="form-control" id="password" name="password" placeholder=" " autocomplete="off" autocapitalize="none" value="">
		<label for="password">Parola</label>
	</div>
	<div class="d-flex form-floating ps-1 pb-3">
		<input type="password" class="form-control" id="rePassword" name="rePassword" placeholder=" " autocomplete="off" autocapitalize="none" value="">
		<label for="rePassword">Tekrar parola</label>
	</div>
	<div class="d-flex mt-4 justify-content-between align-items-center">
		<a class="skip-enter-next" href="">Back</a>
		<a id="btnCreate" class="btn btn-primary" href="javascript:resetPass()">Reset</a>
	</div>
	`,
}

window.onhashchange = () => {
	let key = window.location.hash.substr(1)
	if(pages[key] != undefined) {
		document.querySelector('#content').innerHTML = pages[key]
	} else {
		document.querySelector('#content').innerHTML = pages.index
	}
	configUI()
}
window.onhashchange()


function resetPass() {
	$('.login-warning').html('')

	loginInfo.resetCode = q.resetCode || ''
	loginInfo.password = $('#password').val() || ''
	loginInfo.rePassword = $('#rePassword').val() || ''

	if(!loginInfo.resetCode) {
		location.href = 'login.html'
		return
	}
	if(loginInfo.password.length < 4) {
		$('.login-warning').html(`${warnIcon} Password must be at least 8 characters`)
		return
	}

	if(loginInfo.password != loginInfo.rePassword) {
		$('.login-warning').html(`${warnIcon} Retyped password doesn't match password`)
		return
	}

	postMan('/auth/resetPassword', { method: 'POST', data: loginInfo })
		.then(result => {
			alertX('Your password has been changed successfully', () => {
				location.href = 'login.html'
			})
		})
		.catch(err => {
			showError(err)
		})

}

function forgotPass() {

	loginInfo.username = $('#forgotUsername').val().replaceAll(' ', '').replaceAll('+', '')

	if(!isNaN(loginInfo.username)) {
		if(loginInfo.username.length < 10) {
			$('.login-warning').html(`${warnIcon} Incorrect phone number`)
			return
		}
		if(loginInfo.username.substr(0, 1) == '0') {
			loginInfo.username = loginInfo.username.substr(1)
		}
		if(loginInfo.username.length > 10 && loginInfo.username.substr(0, ipInfo.country_calling_code.length) != ipInfo.country_calling_code) {
			$('.login-warning').html(`${warnIcon} Incorrect phone number`)
			return
		}
		if(loginInfo.username.length <= 10) {
			$('#forgotUsername').val(ipInfo.country_calling_code + loginInfo.username)
		}
	} else if(loginInfo.username.indexOf('@') > -1) {

	} else {
		$('.login-warning').html(`${warnIcon} Incorrect phone number or email`)
		return
	}

	postMan('/auth/forgotPassword', { method: 'POST', data: loginInfo })
		.then(result => {
			alertX(`${loginInfo.username} Parolaniz gonderildi`, () => {
				location.href = 'login.html?username=' + loginInfo.username
			})
		})
		.catch(err => {
			showError(err)
		})


}

function nextToPassword() {

	loginInfo.username = $('#username').val().replaceAll(' ', '').replaceAll('+', '')

	if(!isNaN(loginInfo.username)) {
		if(loginInfo.username.length < 10) {
			$('.login-warning').html(`${warnIcon} Incorrect phone number`)
			return
		}
		if(loginInfo.username.substr(0, 1) == '0') {
			loginInfo.username = loginInfo.username.substr(1)
		}
		if(loginInfo.username.length > 10 && loginInfo.username.substr(0, ipInfo.country_calling_code.length) != ipInfo.country_calling_code) {
			$('.login-warning').html(`${warnIcon} Incorrect phone number`)
			return
		}
		if(loginInfo.username.length <= 10) {
			$('#username').val(ipInfo.country_calling_code + loginInfo.username)
		}
	} else if(loginInfo.username.indexOf('@') > -1) {

	} else {
		$('.login-warning').html(`${warnIcon} Incorrect phone number or email`)
		return
	}

	postMan('/auth/loginUsername', { method: 'POST', data: loginInfo })
		.then(result => {
			location.href = '?username=' + loginInfo.username + '#password'
		})
		.catch(err => {
			showError(err, () => {
				if(err.code == 'USER_NOT_VERIFIED') {
					location.hash = 'verify'
				}
			})
		})


}

function login() {
	$('.login-warning').html('')
	if(!loginInfo.username) {
		location.href = location.origin + location.pathname
		return
	}
	if(!$('#password').val()) {
		$('.login-warning').html(`${warnIcon} password hatalı`)
		return
	}

	loginInfo.password = $('#password').val()

	console.log(`loginInfo:`, loginInfo)
	postMan('/auth/login', { method: 'POST', data: loginInfo })
		.then(result => {
			initializeGlobals(result.token)
		})
		.catch(err => {
			showError(err, () => {
				if(err.code == 'USER_NOT_VERIFIED') {
					location.hash = 'verify'
				}
			})
		})

}

function createAccount() {
	loginInfo.username = $('#username').val().replaceAll(' ', '').replaceAll('+', '')
	loginInfo.password = $('#password').val() || ''
	loginInfo.rePassword = $('#rePassword').val() || ''

	$('.login-warning').html('')

	if(!isNaN(loginInfo.username)) {
		if(loginInfo.username.length < 10) {
			$('.login-warning').html(`${warnIcon} Incorrect phone number`)
			return
		}
		if(loginInfo.username.substr(0, 1) == '0') {
			loginInfo.username = loginInfo.username.substr(1)
		}
		if(loginInfo.username.length > 10 && loginInfo.username.substr(0, ipInfo.country_calling_code.length) != ipInfo.country_calling_code) {
			$('.login-warning').html(`${warnIcon} Incorrect phone number`)
			return
		}
		if(loginInfo.username.length <= 10) {
			$('#username').val(ipInfo.country_calling_code + loginInfo.username)
		}
	} else if(loginInfo.username.indexOf('@') > -1) {

	} else {
		$('.login-warning').html(`${warnIcon} Incorrect phone number or email`)
		return
	}


	if(loginInfo.password.length < 4) {
		$('.login-warning').html(`${warnIcon} Password must be at least 8 characters`)
		return
	}

	if(loginInfo.password != loginInfo.rePassword) {
		$('.login-warning').html(`${warnIcon} Retyped password doesn't match password`)
		return
	}
	postMan('/auth/signup', { method: 'POST', data: loginInfo })
		.then(result => {
			location.href = `login.html?username=${loginInfo.username}#verify`
		})
		.catch(err => {
			showError(err)
		})
}

function verify() {
	loginInfo.authCode = trimNumbers($('#authCode').val())
	if(loginInfo.authCode.length != 4)
		return
	postMan('/auth/verify', { method: 'POST', data: loginInfo })
		.then(result => {
			initializeGlobals(result.token)
		})
		.catch(err => {
			showError(err, () => {
				$('#authCode').val('')
				$('#authCode').focus()
			})
		})
}


function initializeGlobals(token) {
	
	postMan('/session', { method: 'POST', data: {token:token} })
		.then(result => {
			global.token = token
			global=Object.assign({},global,result)
			localStorage.setItem('global', JSON.stringify(global || {}))
			location.href = '/'
		})
		.catch(err => {
			showError(err, () => {
				if(err.code == 'USER_NOT_VERIFIED') {
					location.href = 'login.html#verify'
				}
			})
		})
}

$(document).ready(() => {
	if(document.querySelector('#username input')) {
		$('#username').on('focus', () => {
			$('.login-warning').html('')
			$('#username').select()
		})

		$('#username').on('keydown', e => keyEnter(e, nextToPassword))

		document.querySelector('#username').value = loginInfo.username
	}

	if(document.querySelector('#login-username')) {
		document.querySelector('#login-username').innerHTML = loginInfo.username
	}

	if(document.querySelector('#authCode')) {
		$('#authCode').inputmask({
			'mask': '9999',
			'greedy': false,
			'clearIncomplete': false,
			'removeMaskOnSubmit': false
		})


		$('#authCode').on('keydown', e => {

			if($('#authCode').val().length == 4)
				keyEnter(e, verify)
		})
	}

})



function showError(err,cb) {
	$('.login-warning').html(`${err.message || err.name || ''}`)
	
}