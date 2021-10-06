const { request, response } = require('express');
const { Op } = require('sequelize');
const Category = require('../models/Category');
const Group = require('../models/Group');
const Meeti = require('../models/Meeti');
const User = require('../models/User');

const showHome = async (req = request, res = response, next) => {
	const queries = [
		Meeti.findAll({
			where: {
				date: {
					[Op.gte]: new Date(),
				},
			},
			limit: 3,
			attributes: ['title', 'date', 'slug'],
			include: [
				{
					model: User,
					attributes: ['id', 'name', 'image'],
				},
				{
					model: Group,
					attributes: ['image'],
				},
			],
		}),
        Category.findAll()
	];

	const [lastMeetis, categoryArr] = await Promise.all(queries);

	res.render('homepage', {
		title: 'Meeti',
		lastMeetis,
        categoryArr
	});
};

module.exports = {
	showHome,
};
