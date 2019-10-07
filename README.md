# hapi-http2
A simple http2 server built with hapi, nodejs and Mongodb.

To Run:

1) Clone the Repository

2) Generate a self signed certificate with Openssl.

`openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem`

3) If you do not have MongoDB, install it, and open a local connection with `mongod`.

4) Run `npm start` to start the server.


The server contains endpoints for basic CRUD operations with a user object.


Creating a User Object:

url: `https://127.0.0.1:8000/user`

Request Method: POST

Request Body:

```
{
	username: string,
	password: string,
	email: string
}
```

Response:

```
{
	_id: string,
	username: string,
	password: string,
	email: string,
	__v: number
}
```

Getting a List of Users

url: `https://127.0.0.1:8000/users`

Request Method: GET

Request Body: none

Returns list of user objects


Get a specific user by Username:

Url: `https://127.0.0.1:8000/user/{username: string}`

Request Method: GET

Request Body: none

Response:

```
{
	_id: string,
	username: string,
	password: string,
	email: string,
	__v: number
}
```

Update a specific user by Username:

Url: `https://127.0.0.1:8000/user/{username: string}`

Request Method: PUT

Request Body:

you can input any individual field above (username, email, password) with the right type,
or any combination of the fields above.

ex.

```
{
	username: string
}
```

Response:

```
{
    "n": number,
    "nModified": number,
    "ok": number
}
```


Delete a specific user:

Url: `https://127.0.0.1:8000/user/{username: string}`

Request Method: DELETE

Request Body: none

Response Body:

```
{
    "n": number,
    "ok": number,
    "deletedCount": number
}
```