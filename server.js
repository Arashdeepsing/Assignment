// app.js
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import csrf from 'csurf';
import passport from 'passport';
import logger from 'morgan';
import {
  createClient
} from 'redis';
import connectRedis from 'connect-redis';
import connectDB from './db.js';
import User from './userModel.js';

const app = express();
const RedisStore = connectRedis(session);
const redisClient = createClient(process.env.REDIS_URL);

// Connect to MongoDB
connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware with Redis
app.use(session({
  store: new RedisStore({
    client: redisClient
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Passport middleware initialization
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf());

// Attach User model to request object
app.use((req, res, next) => {
  req.User = User;
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/auth', authRouter);

// Error handling
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

export default app;

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});