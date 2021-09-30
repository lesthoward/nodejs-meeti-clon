const { request, response } = require('express');
const { check, validationResult } = require('express-validator');
const { v4: uuid } = require('uuid');
const Meeti = require('../models/Meeti');
const Group = require('../models/Group');
const createError = require('http-errors');

const showForm = async (req = request, res = response, next) => {
	const groups = await Group.findAll({ where: { userId: req.user.id } });

	res.render('meeti-form', {
		title: 'Crear nuevo meeti',
		groups,
	});
};

const expressValidator = async (req = request, res = response, next) => {
	const rules = [
		check('groupId').notEmpty().withMessage('Tienes que elegir un grupo'),
		check('title')
			.notEmpty()
			.withMessage('Coloque el nombre de meeti correctamente')
			.escape(),
		check('date')
			.notEmpty()
			.withMessage('Elige la fecha del evento para dar a conocer')
			.escape(),
		check('time')
			.notEmpty()
			.withMessage('La hora del evento es importante')
			.escape(),
		check('description')
			.notEmpty()
			.withMessage('Haz un resumen del evento')
			.isLength(0, 100)
			.withMessage('La descripción es demasiado larga'),
		check('address')
			.notEmpty()
			.withMessage('Elige correctamente el lugar del evento')
			.escape(),
	];
	await Promise.all(rules.map((validator) => validator.run(req)));
	const expErrs = validationResult(req);

	const errorsArr = [];

	if (!expErrs.isEmpty()) {
		expErrs
			.array({ onlyFirstError: true })
			.map((error) => errorsArr.push(error.msg));
	}

	if (errorsArr.length) {
		req.flash('errors', errorsArr);
		return res.redirect(req.originalUrl);
	}

	// Goes well
	next();
};

const newMeeti = async (req = request, res = response, next) => {
	try {
		const newMeeti = {
			id: uuid(),
			...req.body,
			userId: req.user.id,
		};
		await Meeti.create(newMeeti);
		req.flash('exito', 'Meeti creado correctamente');
		return res.redirect('/management');
	} catch (error) {
		req.flash('errors', `Ha ocurrido un error: ${error.message}`);
		res.redirect(req.originalUrl);
	}
};

const showFormEdit = async (req = request, res = response) => {
	const queries = [
		Group.findAll({ where: { userId: req.user.id } }),
		Meeti.findByPk(req.params.id),
	];
	const [groups, meeti] = await Promise.all(queries);
	if (!groups || !meeti) {
		createError(404, 'Operación no válida');
	}

	res.render('meeti-form-edit', {
		title: `Editar meeti: ${meeti.title}`,
		groups,
		meeti,
	});
};

const editMeeti = async (req = request, res = response) => {
	try {
		await Meeti.update(req.body, {
			where: {
				id: req.params.id,
				userId: req.user.id,
			},
		});
		req.flash('exito', 'Meeti editado correctamente');
		res.redirect('/management');
	} catch (error) {
		createError(401, 'Operación no válida');
	}
};

const showFormDelete = async (req = request, res = response) => {
	const meeti = await Meeti.findOne({ where:{id: req.params.id}})

	if(!meeti) {
		return createError(404, 'La página que estás buscando no pudo ser encontrada')
	}
	res.render('meeti-form-delete', {
		title: 'Eliminar Meeti',
		meeti
	});
};

const deleteMeeti = async (req = request, res = response) => {
	try {
		await Meeti.destroy({ where: { id: req.params.id, userId: req.user.id } });
		req.flash('exito', 'Eliminado correctamente');
		return res.redirect('/management');
	} catch (error) {
		createError(404, 'La página que estás buscando no pudo ser encontrada');
	}
};

module.exports = {
	showForm,
	expressValidator,
	newMeeti,
	showFormEdit,
	editMeeti,
	showFormDelete,
	deleteMeeti,
};
