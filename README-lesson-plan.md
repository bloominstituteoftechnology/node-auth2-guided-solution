# Node Auth 2 Lesson Plan

## Run Migrations and Seeds

**The database is not included, run the migrations to generate it.** Run the seeds to add the `admin` and `user` roles to the `roles` table.

## Register users

- register a user with role 1 (admin)
- register a user with role 2 (user, this is the default role when creating a new user)

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
// ./auth/auth-router.js

const jwt = require("jsonwebtoken"); // installed this library

const secrets = require("../config/secrets.js");

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user); // new line

        // the server needs to return the token to the client
        // this doesn't happen automatically like it happens with cookies
        res.status(200).json({
          message: `Welcome ${user.username}!, have a token...`,
          token, // attach the token as part of the response
        });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    role: user.role,
  };

  const options = {
    expiresIn: "1d",
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}
```

- add the `./config/secrets.js` file to hold the `jwtSecret`

```js
module.exports = {
  jwtSecret: process.env.JWT_SECRET || "add a third table for many to many",
};
```

- register a user
- login with the user and show the token
- review the steps taken one more time.

**wait for students to catch up**

**time for a break? take 5 minutes**

## Read, Decode and Verify the Token

Modify `./auth/restricted-middleware.js` to verify and decode the token.

```js
const jwt = require("jsonwebtoken"); // installed this library

const secrets = require("../config/secrets.js"); // another use for secrets

module.exports = (req, res, next) => {
  // tokens are commonly  sent as the authorization header
  const token = req.headers.authorization;

  if (token) {
    // is it valid?
    jwt.verify(token, secrets.jwtSecret, (err, decodedToken) => {
      if (err) {
        // the token is not valid
        res.status(401).json({ you: "can't touch this!" });
      } else {
        // the token is valid and was decoded
        req.decodedJwt = decodedToken; // make the token available to the rest of the API
        console.log("decoded token", req.decodedJwt); // show this in the terminal

        next();
      }
    });
  } else {
    // no token? bounced!
    res.status(401).json({ you: "shall not pass!" });
  }
};
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

- add a `./auth/check-role-middleware.js` file:

```js
// ./auth/check-role-middleware.js

module.exports = role => {
  return function (req, res, next) {
    // make sure the roles property is in the token's payload and that the desired role is present
    if (req.decodedJwt.role && req.decodedJwt.role === role) {
      next();
    } else {
      // return a 403 Forbidden, the user is logged in, but has no access
      res.status(403).json({ you: "you have no power here!" });
    }
  };
};
```

- use it for the `/api/users` endpoint

```js
// other code unchanged
const checkRole = require('../auth/check-role-middleware.js');

// router.get('/', restricted, (req, res) => {
  router.get('/', restricted, checkRole('admin'), (req, res) => {
    // other code unchanged
```

- register another user with role 2 (user) and test the functionality.

**wait for students to catch up**
