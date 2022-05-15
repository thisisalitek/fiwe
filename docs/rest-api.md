# REST API

- [Response Samples](#response-samples)
- [Authentication](#authentication)
	- [Login](#login) `POST /auth/login`
 	- [Login with username](#login-with-username) `POST /auth/login-username`
 	- [Passport](#passport) `POST /auth/passport`
 	- [Sign up](#sign-up) `POST /auth/signup`
 	- [Verify](#verify) `POST /auth/verify`
 	- [Forgot password](#forgot-password) `POST /auth/forgot-password`
 	- [Change password](#change-password) `POST /auth/change-password`
 	- [Reset password](#reset-password) `POST /auth/reset-password`
- [Server Time](#server-time) `GET /time`


## Response Samples

> Successful Response

    HTTP/1.1 200 OK
    Status: 200
    Content-Type: application/json

```json
{
    "success": true,
    "data": {
        "time": 1650232053838,
        "server": "2022-04-18 00:47:33",
        "utc": "2022-04-17 21:47:33",
        "timeOffset": 180
    }
}
```

> Error Response

    HTTP/1.1 403 Forbidden
    Status: 403
    Content-Type: application/json

```json
{
    "success": false,
    "error": {
        "code": "NO_TOKEN_PROVIDED",
        "message": "No token provided"
    }
}
```

> Function Not Found Response

    HTTP/1.1 404 Not Found
    Status: 404
    Content-Type: application/json

```json
{
    "success": false,
    "error": {
        "code": "404",
        "message": "function not found"
    }
}
```

## Server Time
**`Request`**

`GET /api/v1/time`

	curl -X GET 'http://localhost:3900/api/v1/time' \
	-L -H 'token: <TOKEN>' -H 'Content-Type: application/json'

**`Response`**

    HTTP/1.1 200 OK
    Content-Type: application/json

```json
{
    "success": true,
    "data": {
        "time": 1650238638215,
        "server": "2022-04-18 02:37:18",
        "utc": "2022-04-17 23:37:18",
        "timeOffset": 180
    }
}

```

