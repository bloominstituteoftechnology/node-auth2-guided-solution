const router = require("express").Router();

const Roles = require("./roles-model.js");
const restricted = require("../auth/restricted-middleware.js");

router.get("/", restricted, (req, res) => {
  Roles.find()
    .then(roles => {
      res.status(200).json(roles);
    })
    .catch(err => {
      res.status(500).json({ message: err.message });
    });
});

module.exports = router;
