var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');


var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Coleccion no valida',
            error: {
                message: 'las colecciones validas son ' + tiposValidos.join(', ')
            }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'no selecciono nada',
            error: { message: 'no selecciono nada' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extenciones manejamos
    var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extencionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extension no valida',
            error: { message: 'las extensiones validas son ' + extencionesValidas.join(', ') }
        });
    }

    // Nombre archivo personalizado

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal 
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err

            });

        }

        subirPorTipo(tipo, id, nombreArchivo, res)

    });

});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error subiendo tipo',
                    errors: err
                });

            }

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'usuario no existe' }
                });
            }

            // Si existen, elimina la imagen anterior
            var pathViejo = './uploads/usuarios/' + usuario.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error subiendo tipo',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'medico no existe',
                    errors: { message: 'medico no existe' }
                });
            }

            // Si existen, elimina la imagen anterior
            var pathViejo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathViejo) && medico.img.length > 0) {
                fs.unlinkSync(pathViejo);

            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {

                res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });

    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error subiendo tipo',
                    errors: err
                });
            }

            if (!hospital) {
                fs.unlinkSync(path);
                return res.status(400).json({
                    ok: false,
                    mensaje: 'hospital no existe',
                    errors: { message: 'hospital no existe' }
                });
            }

            // Si existen, elimina la imagen anterior
            var pathViejo = './uploads/hospitales/' + hospital.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {

                res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });

    }
}

module.exports = app;