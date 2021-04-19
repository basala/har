import { UserEntity } from '@entity';
import { sign } from 'jsonwebtoken';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { getMongoRepository } from 'typeorm';
import { AuthResponse } from '../types';

const JWT_SECRET = 'har-jwt-secret';

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_SECRET,
            algorithms: ['HS256'],
        },
        async (payload, done) => {
            const currentUser = await getMongoRepository(UserEntity).findOne({
                _id: payload._id,
            });

            if (!currentUser) {
                return done(null, false, { message: 'Unvalid token.' });
            }

            return done(null, currentUser);
        }
    )
);

export const generateToken = async (user: UserEntity): Promise<string> => {
    return sign(
        {
            _id: user._id,
            username: user.username,
        },
        JWT_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: '7d',
        }
    );
};

export const authenticateJWT = (req): Promise<AuthResponse<UserEntity>> =>
    new Promise((resolve, reject) => {
        passport.authenticate('jwt', (err, data, info) => {
            if (err) {
                reject(err);
            }

            resolve({ data, info });
        })(req);
    });
