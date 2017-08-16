var bcrypt = require('bcrypt-nodejs')
var crypto = require('crypto')
var mongoose = require('mongoose')
var validate = require('mongoose-validator')

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  tokens: {
    type: Array
  },
  roles: {
    type: Array,
    default: []
  }
})

userSchema.pre('save', function (next) {
  var user = this
  user.wasNew = user.isNew 
  if (!user.isModified('password')) {
    return next()
  }
  if (user.isModified('password')) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err)
      }
      bcrypt.hash(user.password, salt, null, function (err, hash) {
        if (err) {
          return next(err)
        }
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  var user = this
  bcrypt.compare(candidatePassword, this.password, function (err, res) {
    if (res) {
      user.lastLoggedIn = Date.now()
      user.save(function (err) {
        if (err)console.log(err, 'err')
      })
    }
    cb(err, res)
  })
}

module.exports = mongoose.model('users', userSchema);
