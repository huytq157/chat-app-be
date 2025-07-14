import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel, IUser } from "../models/users.models";
import { Types, Document } from "mongoose";

type UserDocument = Document<unknown, {}, IUser> &
  IUser & { _id: Types.ObjectId };

declare global {
  namespace Express {
    interface User extends UserDocument {}
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile: any, done) => {
      try {
        let user = await UserModel.findOne({ googleId: profile.id });
        if (!user) {
          user = await UserModel.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await UserModel.create({
              googleId: profile.id,
              fullname: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0].value,
              username:
                (profile.displayName
                  ? profile.displayName.replace(/\s+/g, "").toLowerCase()
                  : "user") +
                "_" +
                profile.id.slice(-6),
            });
          }
        }

        return done(null, user as UserDocument);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user as UserDocument);
  } catch (err) {
    done(err, null);
  }
});
