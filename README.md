# Web Auth II Guided Project

Guided project for **Web Auth II** Module.

## Prerequisites

- [SQLite Studio](https://sqlitestudio.pl/index.rvt?act=download) installed.

## Project Setup

- [ ] fork and clone this repository.
- [ ] **CD into the folder** where you cloned **your fork**.
- [ ] type `yarn` or `npm i` to download dependencies.
- [ ] type `yarn server` or `npm run server` to start the API.

Please follow along as the instructor adds support for `sessions` and `cookies` to the API.

## Introduce Sessions and Cookies

Open TK and introduce students to `sessions` and `cookies` and how they help us keep user's logged in across requests.

Take time to walk through the authentication workflow when using `sessions`.

Cover the different ways of storing sessions, including the pros and cons of each.

## Uses Sessions for Login

- add `express-session` to the project and require it at the top of `server.js`.
- configure and use `express-session` globally inside `server.js`.

```js
// other code unchanged
const server = express();

// this object holds the configuration for the session
const sessionConfig = {
  name: 'monkey', // the default would be sid, but that would reveal our stack
  secret: 'keep it secret, keep it safe!', // to encrypt/decrypt the cookie
  cookie: {
    maxAge: 1000 * 60 * 60, // how long is the session valid for, in milliseconds
    secure: false, // used over https only, should be true in production
  },
  httpOnly: true, // cannot access the cookie from JS using document.cookie
  // keep this true unless there is a good reason to let JS access the cookie
  resave: false, // keep it false to avoid recreating sessions that have not changed
  saveUninitialized: false, // GDPR laws against setting cookies automatically
};

// other middleware here
server.use(session(sessionConfig));
// endpoints below
```

Show the [documentation for the library on npmjs.org](https://www.npmjs.com/package/express-session) for different configuration options.

Session support is configured, let's use it to store user information. Change the `/login` endpoint inside `auth-router.js` to read:

```js
router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        // req.session is an object added by the session middleware
        // we can store information inside req.session
        // req.session is available on every request done by the same client
        // as long as the session has not expired
        req.session.user = user;
        res.status(200).json({
          // the cookie will be sent automatically by the library
          message: `Welcome ${user.username}!, have a cookie!`,
        });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});
```

- use Postman to register an user
- login using the new user's credentials.
- show the cookie in the cookies tab in Postman
- make a GET to `/api/users`. You're not logged in, because the server restarted and the session information is stored in memory.
- login again and then visit `/api/users`, should see the list of users.

**wait for students to catch up**

### You Do (estimated 5m to complete)

Open restricted middleware inside `./auth/restricted-middleware.js` and look for refactoring opportunities. Is there duplicate code? if there is, can we remove it?

#### A possible solution

```js
// this is all the content in the file, no need for bcrypt or Users anymore
module.exports = (req, res, next) => {
  // if the client is logged in, req.session.user will be set
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'You shall not pass!' });
  }
};
```

**wait for students to catch up**
**time for a break? take 5 minutes**

## Implement Logout

Add the following endpoint to `auth-router.js`.

```js
router.get('/logout', (req, res) => {
  if (req.session) {
    // the library exposes the destroy method that will remove the session for the client
    req.session.destroy(err => {
      if (err) {
        res.send(
          'you can checkout any time you like, but you can never leave....'
        );
      } else {
        res.send('bye, thanks for playing');
      }
    });
  } else {
    // if there is no session, just end the request or send a response
    // we chose to just end the request for the example
    res.end();
  }
});
```

- login again
- make a GET to `/api/users`
- make a GET to `/api/auth/logout`
- make a GET to `/api/users`, we're logged out!

On logout, the server will void the session, so even if a client had held on to the cookie and send it again, the server will not let them through because the session associated with the cookie is no longer valid.

**wait for students to catch up**

- login
- stop the server
- start the server
- make a GET to `/api/users`, we're not logged in! Bad panda.

We will store session information in the database, that way if the server is restarted logged in users will not need to login again.

## Store Sessions in a Database

- introduce [the library used to connect knex to express-session](https://www.npmjs.com/package/connect-session-knex).
- require it after `express-session`.

```js
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
// alternatively: const KnexSessionStore = require('connect-session-knex');
// and then KnexSessionStore(session);
```

- change the session configuration object to use a database to store session information

```js
const sessionConfig = {
  name: 'monkey',
  secret: 'keep it secret, keep it safe!',
  cookie: {
    maxAge: 1000 * 60 * 60, // in ms
    secure: false, // used over https only
  },
  httpOnly: true, // cannot access the cookie from js using document.cookie
  resave: false,
  saveUninitialized: false, // GDPR laws against setting cookies automatically

  // we add this to configure the way sessions are stored
  store: new KnexSessionStore({
    knex: require('../database/dbConfig.js'), // configured instance of knex
    tablename: 'sessions', // table that will store sessions inside the db, name it anything you want
    sidfieldname: 'sid', // column that will hold the session id, name it anything you want
    createtable: true, // if the table does not exist, it will create it automatically
    clearInterval: 1000 * 60 * 60, // time it takes to check for old sessions and remove them from the database to keep it clean and performant
  }),
};
```

- login
- stop the server
- start the server
- make a GET to `/api/users`, we're still logged in!

**wait for students to catch up**
