const { request, response } = require('express');
const { check, validationResult } = require('express-validator');
const fs = require('fs')
const path = require('path');
const Group = require('../models/Group');

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


const showPasswordChanging = (req=request, res=response) => {
	res.render('profile-password-changing', {
		title: 'Cambio de contraseña'
	})
}

const changePassword = async (req=request, res=response) => {
	const {current_password, password} = req.body
	const user = await User.findByPk(req.user.id)
	if(!user.checkPassword(current_password)) {
		req.flash('errors', 'La contraseña actual no coincide')
		return res.redirect('back')
	}


	try {
		await User.update(
			{password},
			{where: 
				{ id:req.user.id },
				individualHooks: true 
			}
		)
		req.flash('exito', 'Haz cambiado tu contraseña correctamente')
		res.redirect('/login')
	} catch (error) {
		req.flash('errors', error.errors.map(error => error.message))
		return res.redirect('/user/password-changing')
	}
}

const showFormImage = async (req=request, res=response) => {
	const user = await User.findByPk(req.user.id)
	res.render('profile-image', {
		title: 'Cambiar imagen de perfil',
		user
	})
}

const logout = (req=request, res=response) => {
	req.logOut()
	req.flash('exito', 'Haz cerrado sesión')
	res.redirect('/')
}

const editImage = async (req=request, res=response) => {
	if(!req.file) {
		req.flash('exito','Tienes que añadir una imagen')
		return res.redirect('back')
	}

	const user = await User.findByPk(req.user.id)
	if(req.file && user.image) {
		fs.unlinkSync(path.join(__dirname, `../../public/uploads/profile/${user.image}`))
	}

	user.image = req.file.filename
	user.save()
	req.flash('exito', 'La imagen se ha subido correctamente')
	res.redirect('/management')
}

const showUserProfile = async (req=request, res=response) => {
	const queries = [
		User.findByPk(req.params.id),
		Group.findAll({where: { userId: req.params.id }})
	]
	const [user, groupArr] = await Promise.all(queries)

	res.render('user-profile', {
		title: 'Perfil de usuario',
		user,
		groupArr
	})
}

module.exports = {
	showProfile,
	editProfile,
	showPasswordChanging,
	changePassword,
	showFormImage,
	logout,
	editImage,
	showUserProfile
};
