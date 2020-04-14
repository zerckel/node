const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  mail: String,
  password: String,
  token: String
  // Nous pouvons implémenter des TTL
}, {collection: 'users'})

userSchema.methods.validPassword = function(password) {
  return this.password === password
}

const User = mongoose.model('User', userSchema)
module.exports = User