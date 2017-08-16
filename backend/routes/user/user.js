var _ = require('lodash');
var express = require('express');
var app = express();
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('users');
var jwt = require('jsonwebtoken');
var config = require('./../../config.js');

router.get('/authenticate', (req, res) => {
  var redirect = req.body.redirect || false;
  if (req.user) {
    var token = jwt.sign({
      _id: req.user._id
    }, config.jwt, {expiresIn: config.tokenexpirationtime})
    return res.status(200).send({
      user: {
        profile: req.user.profile,
        roles: req.user.roles,
        username: req.user.username,
        _id: req.user._id
      },
      token: token,
      success: true,
      authenticated: true,
      redirect: redirect
    })
  } else {
    return res.status(200).send({
      user: {},
      success: false,
      authenticated: false,
      redirect: redirect
    })
  }
});

router.post('/authenticate', (req, res) => {
  var redirect = req.body.redirect || false

  var errors = req.validationErrors()
  if (errors) {
    return res.status(401).send({
      success: false,
      authenticated: false,
      msg: errors[0].msg,
      redirect: '/signin'
    })
  } else {
    User.findOne({
      username: req.body.username
    }, function (err, user) {
      if (err) throw err
      if (!user) {
        res.send({
          success: false,
          authenticated: false,
          msg: 'Authentication failed. User not found.',
          redirect: '/signin'
        })
      } else {
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            req.logIn(user, function (err) {
              if (err) {
                return next(err)
              }
              delete user['password']
              var token = jwt.sign({
                _id: user._id
                }, config.jwt, {expiresIn: config.tokenexpirationtime})
              res.cookie('token', token)

              res.json({
                success: true,
                authenticated: true,
                user: {
                  profile: user.profile,
                  roles: user.roles,
                  username: user.username,
                  _id: user._id
                },
                token: 'JWT ' + token,
                redirect: redirect
              })
            })
          } else {
            res.send({
              success: false,
              authenticated: false,
              msg: 'Authentication failed. Wrong password.',
              redirect: '/signin'
            })
          }
        })
      }
    })
  }
});

router.post('/login', (req, res) => {
  var errors = req.validationErrors()
  var redirect = req.body.redirect || false
  if (errors) {
    return res.status(400).send({
      success: false,
      authenticated: false,
      msg: errors[0].msg,
      redirect: '/signin'
    })
  }
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(400).send({
        success: false,
        authenticated: false,
        msg: info.message,
        redirect: false
      })
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err)
      }
      delete user['password']
      var token = jwt.sign({
        _id: user._id
      }, config.jwt, {expiresIn: config.tokenexpirationtime})
      res.cookie('token', token)
      res.json({
        success: true,
        authenticated: true,
        user: {
          profile: user.profile,
          roles: user.roles,
          username: user.username,
          _id: user._id
        },
        token: 'JWT ' + token,
        redirect: redirect
      })
    })
  })(req, res)
});

router.get('/logout', (req, res) => {
  req.logout()
  return res.status(200).send()
});

router.post('/signup', (req, res) => {
  var errors = req.validationErrors();
  var redirect = req.body.redirect || false;
  console.log(errors);
  
  if (errors) {
    return res.status(400).send({
      success: false,
      authenticated: false,
      msg: errors[0].msg,
      redirect: '/signup'
    })
  }
  var user = new User({
    username: req.body.username,
    password: req.body.password
  })

  User.findOne({ username: req.body.username }, function (err, existingUser) {
    if (err) {
      return res.status(400).send(err)
    }
    if (existingUser) {
      return res.status(400).send({ msg: 'Account with that username address already exists.' })
    }
    user.save(function (err) {
      if (err && err.code === 11000) {
        return res.status(400).send({ msg: 'Account with that username address already exists.' })
      } else if (err && err.name === 'ValidationError') {
        var keys = _.keys(err.errors)
        return res.status(400).send({ msg: err.errors[keys[0]].message })
      } else if (err) {
        next(err)
      } else {
        req.logIn(user, function (err) {
          if (err) {
            return next(err)
          } else {
            delete user['password']
            var token = jwt.sign({
              _id: user._id
            }, config.jwt, {expiresIn: config.tokenexpirationtime})
            res.cookie('token', token)
            res.json({
              success: true,
              authenticated: true,
              user: {
                profile: user.profile,
                roles: user.roles,
                username: user.username,
                _id: user._id
              },
              token: 'JWT ' + token,
              redirect: redirect
            })
          }
        })
      }
    })
  })
});


module.exports = router;
