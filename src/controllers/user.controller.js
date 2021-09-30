const { request, response } = require('express');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

const showProfile = async (req = request, res = response) => {
	const user = await User.findByPk(req.user.id);

	res.render('profile-form-edit', {
		title: 'Edición de perfil',
		user,
	});
};

const editProfile = async (req = request, res = response) => {
	const rules = [
		check('name', 'Coloque un nombre de perfil')
            .trim()
			.notEmpty()
			.matches(/^[a-zA-Z]+$/)
            .withMessage('El nombre solo puede contenedor letras')
            // .matches(/\s$/)
            // .withMessage('Elimine los espacios en blanco')
			.escape(),
		check('email', 'Ingrese un correo válido').isEmail().escape(),
	];

	await Promise.all(rules.map((validator) => validator.run(req)));
	const expErrs = validationResult(req);
	if (!expErrs.isEmpty()) {
		req.flash(
			'errors',
			expErrs.array().map((error) => error.msg)
		);
		return res.redirect('back');
	}
	// If everything goes well
	const user = await User.findByPk(req.user.id);
	const { name, description, email } = req.body;
	user.name = name;
	user.description = description;
	user.email = email;
	user.save();
	req.flash('exito', 'Perfil editado correctamente');
	return res.redirect('/management');
	res.json(req.user);
};

module.exports = {
	showProfile,
	editProfile,
};
