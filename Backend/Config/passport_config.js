const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const user = require("../Models/user_model");
const { checkSignupBadge } = require("../Controllers/badge_utils");

const BRACU_DOMAIN = "g.bracu.ac.bd";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const foundUser = await user.findById(id);
    done(null, foundUser);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      passReqToCallback: true,
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:1760/api/auth/google/callback",
    },
    async (req, accessToken, refreshToken, profile, done) => {
      // check if user already exists in our db
      const userEmail = profile.emails[0].value;

      // Debug: Log what Google returns
      console.log("Google Profile Data:", {
        id: profile.id,
        email: userEmail,
        photos: profile.photos,
        hasPhotos: !!profile.photos,
        photoUrl: profile.photos?.[0]?.value,
      });

      if (!userEmail.endsWith(`@${BRACU_DOMAIN}`)) {
        console.log("Unauthorized domain login attempt:", userEmail);
        return done(null, false, {
          message: "Unauthorized domain, use your BRACU mail",
        });
      }

      const photoUrl =
        profile.photos && profile.photos[0] ? profile.photos[0].value : null;

      let currentUser = await user.findOne({ googleId: profile.id });
      if (currentUser) {
        // already have this user
        // Update photo if available from Google
        if (photoUrl) {
          currentUser.photo = photoUrl;
        }
        // Store refresh token if we received a new one (prompt consent may be required)
        if (refreshToken) {
          currentUser.googleRefreshToken = refreshToken;
        }
        await currentUser.save();
        console.log("Updated user photo:", photoUrl);
        // Award signup badge if not already earned
        await checkSignupBadge(currentUser._id);
        return done(null, currentUser);
      } else {
        // if not, create user in our db
        const newUser = await new user({
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          photo: photoUrl || "",
          googleRefreshToken: refreshToken,
        }).save();
        console.log("Created new user with photo:", photoUrl);
        // Award signup badge
        await checkSignupBadge(newUser._id);
        return done(null, newUser);
      }
    }
  )
);

module.exports = passport;
