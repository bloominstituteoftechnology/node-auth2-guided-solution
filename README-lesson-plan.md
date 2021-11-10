# Node Auth 2 Lesson Plan

## Run Migrations and Seeds

**The database is not included, run the migrations to generate it.** Run the seeds to add the `admin` and `user` roles to the `roles` table.

A simple HTML auth form saved inside the `client` folder can be loaded on `http://localhost:9000/` to test out the functionality we build today.

## Register users

- register a user with role 2 (a user with role 1 is seeded in the db)

## Introduce JWTs

Use [jwt.io](https://jwt.io/) to introduce what JWTs are and how they are structured.

List the responsibilities of the server and client when using JWTs for authentication.

### Server

- produce the token
- send the token to the client
- read, decode and verify the token
- make the payload available to the rest of the api

### Client

- store the token
- send the token on every request
- destroy token on logout

## Produce and Send a Token

Introduce the library we'll use to create and verify the tokens.

- add `jsonwebtoken` to the project and require it into `auth-router.js`.
- change the `/login` endpoint inside the `auth-router.js` to produce and send the token.

```js
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken') // npm install

const router = require('express').Router()
const User = require('../users/users-model.js')

const { BCRYPT_ROUNDS, JWT_SECRET } = require('../../config')

router.post('/login', (req, res, next) => {
  let { username, password } = req.body

  User.findBy({ username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user) // new line
        // the server needs to return the token to the client
        // this doesn't happen automatically like it happens with cookies
        res.status(200).json({
          message: `Welcome back ${user.username}, have a token...`,
          token, // attach the token as part of the response
        })
      } else {
        next({ status: 401, message: 'Invalid Credentials' })
      }
    })
    .catch(next)
})

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    role: user.role,
  }
  const options = {
    expiresIn: '1d',
  }
  return jwt.sign(payload, JWT_SECRET, options)
}
```

- use the `./config/index.js` file to hold the `JWT_SECRET`:

```js
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'add a third table for many to many',
  // etc
}
```

- register a user
- login with the user and show the token
- review the steps taken one more time.

**wait for students to catch up**

**time for a break? take 5 minutes**

## Read, Decode and Verify the Token

Modify `./auth/auth-middleware.js` to verify and decode the token.

```js
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../../config')

const restricted = (req, res, next) => {
  const token = req.headers.authorization
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err) {
        next({ status: 401, message: "You can't touch this!" })
      } else {
        req.decodedJwt = decodedToken
        console.log('decoded token', req.decodedJwt)
        next()
      }
    })
  } else {
    next({ status: 401, message: 'You shall not pass!' })
  }
}
```

- make a GET to `/api/users` do not provide the authorization header. No access.
- login, copy the token (take care to NOT copy the wrapping quotes).
- make another GET to `/api/users`, but this time add the `Authorization header` with the token as the value. Success!
- change a character in the token and try again. Fails verification and request is blocked.
- review all steps one more time.

**wait for students to catch up**

**time for a break? take 5 minutes**

## Optional. If Time Permits

Write middleware that checks for the user's roles before providing access to an endpoint.

- edit `./auth/auth-middleware.js` file:

```js
const checkRole = role => (req, res, next) => {
  // make sure the roles property is in the token's payload and that the desired role is present
  if (req.decodedJwt.role && req.decodedJwt.role === role) {
    next()
  } else {
    // return a 403 Forbidden, the user is logged in, but has no access
    next({ status: 403, message: "You have no power here!" })
  }
}
```

- use it for the `/api/users` endpoint

```js
// other code unchanged
const { restricted, checkRole } = require('../auth/auth-middleware')

router.get("/", restricted, checkRole("admin"), (req, res, next) => {
  Users.find()
    .then(users => {
      res.json(users)
    })
    .catch(next)
})
```

- register another user with role 2 (user) and test the functionality.
