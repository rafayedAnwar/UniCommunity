const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const user = require('../Models/user_model')

const BRACU_DOMAIN = 'g.bracu.ac.bd'

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const foundUser = await user.findById(id)
        done(null, foundUser)
    } catch (error) {  
        done(error, null)
    }
})

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our db
        const userEmail = profile.emails[0].value
        if (!userEmail.endsWith(`@${BRACU_DOMAIN}`)) {
            console.log('Unauthorized domain login attempt:', userEmail)
            return done(null, false, { message: 'Unauthorized domain, use your BRACU mail' })
        }
        const currentUser = await user.findOne({ googleId: profile.id })
        if (currentUser) {
            // already have this user
            return done(null, currentUser)
        } else {
            // if not, create user in our db
            const newUser = await new user({
                googleId: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                photo: profile.photos[0].value
            }).save()
            return done(null, newUser)
        }

    }
))

module.exports = passport