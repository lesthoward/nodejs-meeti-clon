const path = require('path')
const { nanoid } = require('nanoid')

const multerSingle = (req, res, next, foldername, regex) => {
    const multer = require('multer');
    const multerConfig = {
        limits: { fileSize: 250_000 },
        fileFilter: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            if (extension.match(regex)) {
                cb(null, true);
            } else {
                cb(new Error('NOT_VALID_FORMAT'))
            }
        },
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path.join(__dirname, `../../public/uploads/${foldername}`));
            },
            filename: function (req, file, cb) {
                const filename = file.mimetype.split('/')[1];
                cb(null, `${nanoid(10)}.${filename}`);
            },
        }),
    };
    const upload = multer(multerConfig);

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
}
module.exports = multerSingle

