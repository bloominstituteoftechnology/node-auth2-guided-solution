const router = require('express').Router()

const Roles = require('./roles-model.js')

const { restricted } = require('../auth/auth-middleware')

router.get('/', restricted, (req, res, next) => {
  Roles.find()
    .then(roles => {
      res.status(200).json(roles)
    })
    .catch(next)
})

module.exports = router
