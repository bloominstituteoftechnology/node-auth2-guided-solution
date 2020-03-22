const router = require('express').Router();

const Roles = require('./roles-model.js');
const restricted = require('../auth/restricted-middleware.js');

router.get('/', restricted, (req, res) => {
  Roles.find()
    .then(roles => {
      res.json(roles);
    })
    .catch(err => res.send(err));
});

module.exports = router;
