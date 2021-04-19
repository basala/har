import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { UserEntity } from 'src/entity';
import { getMongoRepository } from 'typeorm';
import { AuthResponse } from '../types';

passport.use(
    new LocalStrategy(async (username, password, done) => {
        const user = await getMongoRepository(UserEntity).findOne({ username });

        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }

        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    })
);

export const authenticateLocal = (req): Promise<AuthResponse<UserEntity>> =>
    new Promise((resolve, reject) => {
        passport.authenticate('local', (err, data, info) => {
            if (err) {
                reject(err);
            }

            resolve({ data, info });
        })(req);
    });
