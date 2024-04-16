const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
	res.render('users/register');
};

module.exports.createUser = async (req, res, next) => {
	try {
		const { username, email, password } = req.body;
		const user = new User({ username, email });
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, (err) => {
			if (err) return next(err);
			req.flash('success', `Welcome ${username} to Yelp Camp!`);
			res.redirect('/campgrounds');
		});
	} catch (e) {
		req.flash('error', e.message);
		res.redirect('/register');
	}
};

module.exports.renderLogin = (req, res) => {
	res.render('users/login');
};

module.exports.login = (req, res, next) => {
	const returnTo = req.session.returnTo || '/campgrounds';
	req.flash('success', `Welcome back to Yelp Camp!`);
	res.redirect(returnTo);
};

module.exports.logout = (req, res) => {
	req.logout(function (err) {
		req.flash('success', 'You have logged out.');
		res.redirect('/campgrounds');
		if (err) {
			return next(err);
		}
	});
};
