const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // npm install

const router = require("express").Router();

const secrets = require("../config/secrets.js");
const Users = require("../users/users-model.js");
const { isValid } = require("../users/users-service.js");

router.post("/register", (req, res) => {
  let user = req.body;

  if (isValid(user)) {
    const rounds = process.env.BCRYPT_ROUNDS || 8;
    const hash = bcrypt.hashSync(user.password, rounds);

    user.password = hash;

    Users.add(user)
      .then(saved => {
        const token = generateToken(saved);

        res.status(201).json({ data: { user, token } });
      })
      .catch(error => {
        res.status(500).json({ message: error.message });
      });
  } else {
    res.status(400).json({
      message: "please provide username and password and the password shoud be alphanumeric",
    });
  }
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  if (isValid(req.body)) {
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
  } else {
    res.status(400).json({
      message: "please provide username and password and the password shoud be alphanumeric",
    });
  }
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

module.exports = router;
