const express = require('express')
const app = express()
const helmet = require('helmet')
const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({extended: false})
const mongoose = require('mongoose')
const User = require('./models/user.js')
const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'antoinecarbonnel@gmail.com',
    pass: 'Pi3.141592'
  }
});

mongoose.set('useFindAndModify', false)
mongoose.connect('mongodb+srv://antoine:FQ3AwHvukTIIbLOQ@cluster0-jlwog.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'ERROR: CANNOT CONNECT TO MONGO-DB'))
db.once('open', () => {
  console.log('SUCCESS: CONNECTED TO MONGO-DB')
})

app.use(helmet())
app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static('public'))

app.use(session({
  secret: 'la k-pop cest pour les salopes',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done)=> {
  done(null,user)
})

passport.deserializeUser((user, done)=> {
  done(null,user)
})

passport.use(new LocalStrategy({
          usernameField: 'mail'
        },
        (mail, password, done) => {
          User.findOne({ mail: mail }, (err, user) => {
            if (err) {
              return done(err)
            }
            // Return if user not found in database
            if (!user) {
              return done(null, false, {
                message: 'Mail not found'
              })
            }
            // Return if password is wrong
            if (!user.validPassword(password)) {
              return done(null, false, {
                message: 'Password is wrong'
              })
            }
            // If credentials are correct, return the user object
            return done(null, user)
          })
        }
))


app.get('/', (req, res) => {
  res.render('signin.pug')
})
app.get('/signup', (req, res) => {
  res.render('signup.pug')
})

app.post('/signup', urlencodedParser, async (req, res) => {
  const {mail, password} = req.body
  try {
    const existingUser = await User.findOne({mail})
    if (existingUser) return res.status(500).send(`Le nom ${existingUser.mail} est déjà utilisé`)
  } catch (error) {
    res.status(500).send(`Erreur du serveur `)
  }

  try {
    let token = Math.random().toString(36).substr(2)
    const newUser = new User({token, mail, password})
    const savedUser = await newUser.save()
    const mailOptions = {
      from: '"Webstart" <webstart@mail.com>', // sender address
      to: newUser.mail, // list of receivers
      subject: 'valider la connexion', // Subject line
      html: '<a href="http://localhost:3000/confirm?token=' + newUser.token + '">Cliquez sur le lien pour confirmer </a>'// plain text body
    }
    await transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log(err)
    })
    if (newUser) res.status(201).send(`Un
    email
    a
    été
    envoyé
    à ${newUser.mail}
  `)
  } catch (err) {
    return res.status(500).send('Erreur du serveur.')
  }

})

app.get('/confirm', async (req, res) => {
  try {
    const {token} = req.query
    const {mail, password} = await User.findOneAndDelete({token}).select('mail password')
    const newUser = new User({mail, password})
    const savedUser = await newUser.save()
    res.redirect('/users')
  } catch (err) {
    res.status(500).send('Erreur pour utilisateur.')
  }
})

app.get('/users', async (req, res) => {
  try{

  } catch (error) {
    res.status(500).send('Erreur pour utilisateur.')
  }
})

app.post('/', urlencodedParser, passport.authenticate('local', {
  successRedirect: '/user',
  failureRedirect: '/'
}))

app.listen(3000, () => console.log('SERVEUR LANCé SUR LE PORT 3000'))