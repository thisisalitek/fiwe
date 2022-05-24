let apiUrl=location.origin
if(location.origin.indexOf('localhost')>-1)
	apiUrl='http://localhost:4501'

var config={
	basePath:'',
	api:{
		url:apiUrl + '/api/v1'
	},
	websocketApi: {
		url:'ws://localhost:4501'	
	},
	ui:{
		title:'FiweRobo',
		logo:`<div class="d-flex align-items-center"><img class="logo" src="img/logo.png" alt="logo" style="max-height:30px;"> <div class="fs-150 ms-2">FiweRobo</div></div>`,
		copyRight:`&copy; ${(new Date()).getFullYear()} `	
	}
	
}
