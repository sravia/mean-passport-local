var LocalStrategy = require('passport-local').Strategy
var mongoose = require('mongoose')

exports.serializeUser = function (user, done) {
  process.nextTick(function () {
    done(null, user.id)
  })
}
exports.deserializeUser = function (id, done) {
  var User = mongoose.model('users')
  User.findOne({
    _id: id
  }, '-password', function (err, user) {
    done(err, user)
  })
}
exports.passportStrategy = new LocalStrategy({ usernameField: 'username' }, function (username, password, done) {
  var User = mongoose.model('users');
  username = username.toLowerCase();
  User.findOne({
    username: username
  }, function (err, user) {
    if (err) {
      console.log('passport: Error ' + err);
      return done(err);
    }
    if (!user) {
      console.log('passport: username ' + username + ' not found')
      return done(null, false, {
        message: 'username ' + username + ' not found'
      })
    }
    user.comparePassword(password, function (err, isMatch) {
      if (err) {
        return done(err)
      }
      if (isMatch) {
        console.log('passport: Login isMatch')
        return done(null, user)
      } else {
        console.log('passport: Invalid username or Password')
        return done(null, false, { message: 'Invalid username or password.' })
      }
    })
  })
})
