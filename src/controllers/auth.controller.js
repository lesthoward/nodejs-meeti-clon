const { request, response } = require('express');
const User = require('../models/User');
// const createError = require('http-errors')
const { check, validationResult } = require('express-validator');
const sendMessage = require('../handlers/send-emails');
const { nanoid } = require('nanoid');
const passport = require('passport');
const createError = require('http-errors')
const url = require('url')


const showRegister = (req = request, res = response) => {
	res.render('register', {
		title: 'Crear cuenta',
		user: {},
	});
};

const addUser = async (req = request, res = response) => {
	// Automatically login 
	// let newUser;

	// Confidential URL for email confirmation
	const isValidURL = req.body.email + nanoid(10);
	const user = {
		...req.body,
		isValid: isValidURL,
	};
	const emailURL = `${req.headers.origin}/auth/isValid/${isValidURL}`;
	await check(
		'password-confirmation',
		'Las contraseña tienen que ser iguales'
	)
		.equals(req.body.password)
		.run(req);
	const expressErrors = validationResult(req);

	// Try create an account in the database
	try {
		const newUser = await User.create(user);
	} catch (error) {
		// console.log(error);
		// Catch errors
		const catchErrs = error['errors'].map((err) => err.message);
		// Express validator errors
		const expressErrs = expressErrors.errors.map((err) => err.msg);

		const errsArr = [...catchErrs, ...expressErrs];
		req.flash('errors', errsArr);
		return res.render('register', {
			title: 'Crear cuenta',
			user: req.body,
			messages: req.flash(),
		});
	}
	// Try send email to user from nodemailer service
	const filename = 'account-confirmation';
	try {
		await sendMessage(
			'Correo de confirmación',
			req.body.email.trim(),
			emailURL,
			filename
		);
		req.flash(
			'exito',
			'Te hemos enviado un correo de confirmación, si no lo encuentras busca en tu bandeja de SPAM'
		);
		return res.redirect('/login');
		// Automatically login
		// req.login(newUser, function(err) {
		// 	if(err) {
		// 		console.log(user);
		// 		res.send('No se pudo iniciar sesión');
		// 	} else {
		// 		req.flash('errors', 'Listo tu sesión')
		// 		return res.redirect('/')
		// 	}
		// })

	} catch (error) {
		console.log(error);
		req.flash(
			'errors',
			'Se produjo un error al enviar correo de confirmación, por favor contacte con soporte'
		);
		return res.redirect('/register');
	}
};

const showLogin = (req = request, res = response) => {
	res.render('login', {
		title: 'Iniciar sesión',
	});
};

const accountConfirmation = async (req = request, res = response) => {
	const { url } = req.params;
	const user = await User.findOne({ where: { isValid: url } });
	if (!user) {
		req.flash(
			'errors',
			'El enlace de confirmación no es válido. Si el problema persiste restablece tu contraseña'
		);
		return res.redirect('/register');
	}

	user.isValid = 1;
	user.save();
	req.flash(
		'exito',
		'Bienvenido a nuestra comunidad, gracias por utilizar nuestra plataforma'
	);
	req.logIn()
	// res.redirect('/login');
};

const goAuthenticate = passport.authenticate('local', {
	successRedirect: '/management',
	failureRedirect: '/login',
	badRequestMessage: 'Introduce tus datos en los correspondientes',
	failureFlash: true,
});



// Custom passport to perverse the URLs after logged
const preserveTheLogin = (req = request, res = response, next) => {
	passport.authenticate('local', (err, user, flash) => {
		if (err) return next(createError(500, 'Authentication is not works'))

		if (!user) {
            // Format text when is equals to text below, it is to set my custom message
			flash.message.toLowerCase() === 'missing credentials'
				? (flash.message =
						'Introduce tus datos en campos los correspondientes')
				: flash.message;
			req.flash('errors', flash.message);

            // It is to know where the request is coming
			return res.redirect(req.headers.referer);
		} 
        req.logIn(user, function (err) {
            // Error "Bad Gateway", if some errors occurs when login 
            if(err) return next(createError(502, 'Unable to authenticate'))

			const getURL = url.parse(req.headers.referer).path
			const fullURL = getURL === '/login' ? '/management' : url.parse(req.headers.referer).search.replace('?', '/')
			const redirectURL = req.headers.origin + fullURL
            res.redirect(redirectURL);
        })

	})(req, res, next);
};

const isAuthenticate = (req = request, res = response, next) => {
	if (req.isAuthenticated()) {
		return next();
	}

    const redirectURL =  req.url.replace('/','?')
	return res.redirect(`/login${redirectURL}`);
};

module.exports = {
	showRegister,
	addUser,
	showLogin,
	accountConfirmation,
	goAuthenticate,
	isAuthenticate,
	preserveTheLogin,
};
