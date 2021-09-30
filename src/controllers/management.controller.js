const { request, response } = require('express');
const { Op } = require('sequelize')
const Group = require('../models/Group');
const Meeti = require('../models/Meeti');
const moment = require('moment')


const showPanel = async (req = request, res = response) => {
    const searches = [
        Group.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'ASC']],
        }),
        Meeti.findAll({
            where: { 
                userId: req.user.id,
                date: {
                    [Op.gte]: moment(new Date()).format('YYYY-MM-DD')
                }
            },
            order: [['createdAt', 'ASC']],
        }),
        Meeti.findAll({
            where: { 
                userId: req.user.id,
                date: {
                    [Op.lt]: moment(new Date()).format('YYYY-MM-DD')
                }
            },
            order: [['createdAt', 'ASC']],
        })
    ]
    const [groups, meetis, prevMeetis] = await Promise.all(searches)

	res.render('management-panel', {
		title: 'Panel de administración',
		groups,
		meetis,
        moment,
        prevMeetis
	});
};

module.exports = {
	showPanel,
};
