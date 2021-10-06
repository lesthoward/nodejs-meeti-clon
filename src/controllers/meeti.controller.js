const { Sequelize } = require('sequelize');

const { request, response } = require('express');
const { check, validationResult } = require('express-validator');
const { v4: uuid } = require('uuid');
const createError = require('http-errors');
const Meeti = require('../models/Meeti');
const Group = require('../models/Group');
const User = require('../models/User');
const moment = require('moment');
const Category = require('../models/Category');
const Comment = require('../models/Comment');

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
	const meeti = await Meeti.findOne({ where: { id: req.params.id } });

	if (!meeti) {
		return createError(
			404,
			'La página que estás buscando no pudo ser encontrada'
		);
	}
	res.render('meeti-form-delete', {
		title: 'Eliminar Meeti',
		meeti,
	});
};

const deleteMeeti = async (req = request, res = response) => {
	try {
		await Meeti.destroy({
			where: { id: req.params.id, userId: req.user.id },
		});
		req.flash('exito', 'Eliminado correctamente');
		return res.redirect('/management');
	} catch (error) {
		createError(404, 'La página que estás buscando no pudo ser encontrada');
	}
};

// Front-End

const showSingleMeeti = async (req = request, res = response) => {
	const meeti = await Meeti.findOne({
		where: {
			slug: req.params.slug,
		},
		include: [
			{
				model: User,
				attributes: ['id', 'name', 'image'],
			},
			{
				model: Group,
				attributes: ['id', 'image', 'name'],
			},
		],
	});
	if (!meeti) {
		return createError(404, 'La página que estás buscando no existe');
	}

	const commentArr = await Comment.findAll({
		where: { meetiId: meeti.id },
		include: [
			{
				model: User
			},
			{
				model: Meeti
			}
		]
	});

	res.render('meeti-singlepage', {
		title: meeti.title,
		meeti,
		moment,
		commentArr,
	});
};

const newAssistant = async (req = request, res = response) => {
	const { assistantState } = req.body;
	if (assistantState === 'confirm') {
		await Meeti.update(
			{
				members: Sequelize.fn(
					'array_append',
					Sequelize.col('members'),
					req.user.id
				),
			},
			{ where: { slug: req.params.slug } }
		);
		return res.send('Has confirmado tu asistencia');
	}

	await Meeti.update(
		{
			members: Sequelize.fn(
				'array_remove',
				Sequelize.col('members'),
				req.user.id
			),
		},
		{ where: { slug: req.params.slug } }
	);
	res.send('Has cancelado tu asistencia');
};

const showAssistant = async (req = request, res = response) => {
	const uniqMeeti = await Meeti.findOne({
		where: {
			slug: req.params.slug,
		},
		attributes: ['members'],
	});

	const assistantsArr = await User.findAll({
		where: {
			id: uniqMeeti.members,
		},
		attributes: ['name', 'image'],
	});

	res.render('meeti-assistants', {
		title: 'Lista de asistentes',
		assistantsArr,
	});
};

const showByCategory = async (req = request, res = response) => {
	const category = await Category.findOne({
		where: { slug: req.params.category },
		attributes: ['id', 'name'],
	});
	const meetiArr = await Meeti.findAll({
		include: [
			{
				model: Group,
				where: { categoryId: category.id },
			},
			{
				model: User,
			},
		],
	});

	res.render('meeti-by-category', {
		title: `Categoría: ${category.name}`,
		category,
		meetiArr,
		moment,
	});
};

const addComment = async (req = request, res = response) => {
	await Comment.create({
		message: req.body.comment,
		userId: req.user.id,
		meetiId: req.params.id,
	});

	res.redirect('back');
};

const deleteComment = async (req = request, res = response) => {
	const comment = await Comment.findByPk(req.body.commentID)
	const meeti = await Meeti.findByPk(comment.meetiId)

	if(comment.userId === req.user.id || meeti.userId === req.user.id) {
		await comment.destroy()
	}
	res.send('OK');
};

module.exports = {
	showForm,
	expressValidator,
	newMeeti,
	showFormEdit,
	editMeeti,
	showFormDelete,
	deleteMeeti,
	showSingleMeeti,
	newAssistant,
	showAssistant,
	showByCategory,
	addComment,
	deleteComment,
};
