const { request, response } = require('express');
const Category = require('../models/Category');
const Group = require('../models/Group');
const { check, validationResult } = require('express-validator');
const path = require('path');
const { nanoid } = require('nanoid');
const fs = require('fs')
const { v4: uuid } = require('uuid')
const createError = require('http-errors')
const { Op } = require('sequelize')


const multer = require('multer');
const multerConfig = {
	limits: { fileSize: 250_000 },
    fileFilter: (req, file, cb) => {
		const extension = file.mimetype.split('/')[1];
		if (extension.match(/(jpg|png|jpeg)$/)) {
			cb(null, true);
		} else {
            cb(new Error('NOT_VALID_FORMAT'))
		}
	},
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, path.join(__dirname, '../../public/uploads/group/'));
		},
		filename: function (req, file, cb) {
			const filename = file.mimetype.split('/')[1];
			cb(null, `${nanoid(10)}.${filename}`);
		},
	}),
};
const upload = multer(multerConfig);

const showFormGroup = async (req = request, res = response) => {
	const categories = await Category.findAll();

	res.render('form-group', {
		title: 'Crear un nuevo grupo',
		categories,
	});
};

const createGroup = async (req = request, res = response) => {
	// Foreign key cannot be validate, because of this I use express validator
	const group = req.body;
	const rules = [
		check('category', 'Defina una categoría de grupo').not().equals('none'),
		check('name').escape(),
		check('url').escape(),
	];
	await Promise.all(rules.map((validation) => validation.run(req)));
	const expressErrs = validationResult(req);

    // Image validation
    if(req.file) {
        group.image = req.file.filename
    }

	try {
		await Group.create({
			...group,
            id: uuid(),
			userId: req.user.id,
			categoryId: req.body.category,
		});

		req.flash('exito', `Se ha creado el grupo de ${req.body.name}`);
        res.redirect('/management');
	} catch (error) {
        // console.log(error)
        // Remove image on error
        if(req.file) {
            fs.unlinkSync(path.join(__dirname, `../../public/uploads/group/${req.file.filename}`))
        }

		// Express validator, automatically rejects the trycatch
		const expErrs = expressErrs.errors.map((err) => err.msg);
		let errArr = expErrs;

		// Sequelize errors
		if (error.errors) {
            const errCatch = error.errors.map((err) => err.message);
			// Join de catch and express validator messages if errors.length exists
			errArr = [...errCatch, ...expErrs];
		}

		req.flash('errors', errArr);
		res.redirect(req.originalUrl);
	}
};

const uploadImage = (req = request, res = response, next) => {
	upload.single('image')(req, res, function (error) {
		if (error instanceof multer.MulterError) {
			if (error.code === 'LIMIT_FILE_SIZE') {
				req.flash(
					'errors',
					'El archivo no corresponde a un peso permitido (150kb)'
				);
				return res.redirect('back');
			}

			req.flash(
				'errors',
				'Se produjo un error al subir el archivo (instanceof Multer Error)'
			);
			return res.redirect('back');
		} else if (error) {
			if(error.message === 'NOT_VALID_FORMAT') {
                req.flash('errors', 'La imagen no cumple con los formatos permitidos (jpg,png,jpeg)')
                return res.redirect('back')
            }
			req.flash(
				'errors',
				'Ha ocurrido un error al subir el archivo: Multer Error (ELSE)'
			);
			return res.redirect('/');
		}
		// If everything goes well then continue
		next()
	});
};

const showEdit = async (req = request, res = response) => {
	const [group, categories] = await Promise.all([
		Group.findByPk(req.params.groupID),
		Category.findAll()
	])

	res.render('form-edit-group', {
		title: group.name,
		group,
		categories
	})
}

const editGroup = async (req = request, res = response) => {
	const group = await Group.findOne({
		where: {
			id: req.params.groupID,
			userId: req.user.id
		}
	})
	if(!group) return next(createError(402, 'No tienes permisos para editar este grupo'))

	// Update all object, not matter wether or not is changes 
	await Group.update(
		req.body,
		{ where: {
			id: req.params.groupID
			}
		}
	)
	// group.save()
	req.flash('exito', 'Se han guardado los cambios')
	res.redirect('/management')
}

const showEditImage = async (req = request, res = response) => {
	const group = await Group.findByPk(req.params.groupID)
	res.render('form-edit-image', {
		title: 'Editar imagen de grupo',
		group
	})
}

const editImage = async (req = request, res = response) => {
	const group = await Group.findByPk(req.params.groupID)
	if(!group) return next(createError(402, 'Operación no autorizada (EDIT IMAGE)'))

	const groups = await Group.findAll()

	if(!req.file) {
		req.flash('errors','Añade una imagen')
		return res.redirect('back')
	} else {
		fs.unlinkSync(path.join(__dirname,`../../public/uploads/group/${group.image}`))
		group.image = req.file.filename
		group.save()
		req.flash('exito', 'Imagen almacenada correctamente')
		res.redirect('/management')
	}
}

module.exports = {
	showFormGroup,
	createGroup,
	uploadImage,
	showEdit,
	editGroup,
	showEditImage,
	editImage
}