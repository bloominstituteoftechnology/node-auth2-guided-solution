const router = require("express").Router();

const Users = require("./users-model.js");
const restricted = require("../auth/restricted-middleware.js");
const checkRole = require("../auth/check-role-middleware.js");

router.get("/", restricted, checkRole("user"), (req, res, next) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(next);
});

module.exports = router;
