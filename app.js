if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const serverless = require('serverless-http');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const campgroundsRoute = require('./routes/campgrounds');
const reviewsRoute = require('./routes/reviews');
const usersRoute = require('./routes/users');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

const router = express.Router();

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const sessionOptions = {
	store: MongoStore.create({
		mongoUrl: dbUrl,
		touchAfter: 24 * 60 * 60,
		crypto: {
			secret,
		},
	}),
	name: 'session', // cookie name if you dont want to use the default name
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

app.use(session(sessionOptions));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(
	mongoSanitize({
		replaceWith: '_',
	})
);
// Helmet config
const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://cdn.jsdelivr.net/',
	'https://unpkg.com/',
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net/',
	'https://unpkg.com/',
];
const connectSrcUrls = [
	'https://unpkg.com/',
	'https://mt3.google.com/',
	'https://mt0.google.com/',
	'https://mt1.google.com/',
	'https://mt2.google.com/',
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://unpkg.com/',
				'https://mt3.google.com/',
				'https://mt0.google.com/',
				'https://mt1.google.com/',
				'https://mt2.google.com/',
				'https://images.unsplash.com/',
				'https://res.cloudinary.com/',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use((req, res, next) => {
	// Store the url they are upon requesting is user logged in
	if (
		!['/login', '/logout', '/register', '/js/', '/css'].some((url) =>
			req.originalUrl.includes(url)
		)
	) {
		req.session.returnTo = req.originalUrl;
	}

	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use('/', usersRoute);
app.use('/campgrounds', campgroundsRoute);
app.use('/campgrounds/:id/reviews', reviewsRoute);

app.get('/', function (req, res) {
	res.render('home');
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	const { status = 500, message = 'Something went wrong' } = err;
	res.status(status).render('error', { err });
	// const { status = 500, message = "Something went wrong" } = err;
	// res.status(status).send(message);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port: ${port}`));
