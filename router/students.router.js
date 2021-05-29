const router = require('express').Router();

const mongoose = require('mongoose');
var status = require('http-status')

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/students', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Student = require('../models/students.model');

module.exports = () => {
    //*Metodo para insertar------------------------------------------------------
    router.post("/", (req, res) => {
        var student = req.body;
        Student.create(student)
            .then((data) => {
                //console.log(data);
                res.json({
                    code: status.OK,
                    msg: "Se insertó correctamente",
                    data: data,
                });
                //console.log(res);
            })
            .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Ocurrió un error",
                    err: err.name,
                    detail: err.message,
                });
            });
    });
    //*Método para borrar------------------------------------------------------------
    router.delete("/:ControlNumber", (req, res) => {
        Student.deleteOne({ controlnumber: req.params.ControlNumber })
            .then((data) => {
                res.json({
                    code: status.OK,
                    msg: "Se eliminó correctamente",
                    date: data,
                });
            })
            .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Error en la peticion",
                    err: err.name,
                    detail: err.message,
                });
            });
    });
    //*Método para consulta general---------------------------------------------- 
    router.get("/", (req, res) => {
        Student.find({})
            .then((student) => {
                res.json({
                    code: status.OK,
                    msg: "Consulta correcta",
                    data: student,
                });
            })
            .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Error en la petición",
                    err: err.name,
                    detail: err.message,
                });
            });
    });

    //*Método para consultar por numero de control------------------------------
    router.get("/:ControlNumber", (req, res) => {
        Student.findOne({ controlnumber: req.params.ControlNumber })
            .then((student) => {
                if (student == null)
                    res.json({
                        code: status.NOT_FOUND,
                        msg: "Numero de control no encontrado",
                    });
                else
                    res.json({
                        code: status.OK,
                        msg: "Consulta correcta",
                        data: student,
                    });
            })
            .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Error en la petición",
                    err: err.name,
                    detail: err.message,
                });
            });
    });

    //*Metodo para actualizar por número de control ------------------------------------
    router.put("/:ControlNumber", (req, res) => {
        Student.updateOne(
            { controlnumber: req.params.ControlNumber },
            { $set: { grade: req.body.grade } },
            { new: true }
        )
            .then((Student) => {
                if (Student)
                    res.json({
                        code: status.OK,
                        msg: "Actualizado correctamente",
                        data: Student,
                    });
                else
                    res.status(status.BAD_REQUEST).json({
                        code: status.BAD_REQUEST,
                        msg: "No se pudo actualizar",
                    });
            })
            .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Error en la petición",
                    err: err.name,
                    detail: err.message,
                });
            });
    });

    //*Estadistica de estudiantes hombres y mujeres por carrera 
    router.get("/Consulta/HombresMujeres", (req, res) => {
        Student.aggregate([
            {
                $match: { curp: /^.{10}[h,H].*/ },
            },
            {
                $group: {
                    _id: "$carrer",
                    count: { $sum: 1 },
                },
            },
        ])
            .then((hombre) => {
                Student.aggregate([
                    {
                        $match: { curp: /^.{10}[m,M].*/ },
                    },
                    {
                        $group: {
                            _id: "$carrer",
                            count: { $sum: 1 },
                        },
                    },
                ])
                    .then((mujer) => {
                        res.json({
                            code: status.OK,
                            msg: "Resultados",
                            Hombres: hombre,
                            Mujeres: mujer,
                        });
                    })
                    .catch((err) => {
                        res.status(status.BAD_REQUEST).json({
                            code: status.BAD_REQUEST,
                            msg: "Error en la petición",
                            err: err.name,
                            detail: err.message,
                        });
                    });
            })
            .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Error en la petición",
                    err: err.name,
                    detail: err.message,
                })
            })
    });

    //Estadistica de alumnos foraneos 
    router.get("/Consulta/Foraneos", (req, res) => {
        Student.aggregate([
            {
                $match: { curp: /^.{11}nt.*/ig },
            },
            {
                $group: {
                    _id: "$carrer",
                    count: { $sum: 1 },
                },
            },
        ])
            .then((local) => {
                Student.aggregate([
                    {
                        $match: { curp: /^.{11}(?!(nt)).*/ig },
                    },
                    {
                        $group: {
                            _id: "$carrer",
                            count: { $sum: 1 },
                        },
                    },
                ])
                    .then((foraneo) => {
                        res.json({
                            code: status.OK,
                            msg: "Resultados",
                            DeNayarit: local,
                            Foraneos: foraneo,
                        })
                    })
                    .catch((err) => {
                        res.status(status.BAD_REQUEST).json({
                            code: status.BAD_REQUEST,
                            msg: "Error en la petición",
                            err: err.name,
                            detail: err.message,
                        })
                    })
            })
            .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Error en la petición",
                    err: err.name,
                    detail: err.message,
                })
            })
    });

    //Estadistica estudiantes aprobados 
    router.get("/Consulta/Aprobacion", (req, res) => {
        Student.aggregate([
            {
                $match: { grade: { $gte: 70 } },
            },
            {
                $group: {
                    _id: "$carrer",
                    count: { $sum: 1 },
                },
            },
        ])
            .then((aprobado) => {
                Student.aggregate([
                    {
                        $match: { grade: { $lt: 70 } },
                    },
                    {
                        $group: {
                            _id: "$carrer",
                            count: { $sum: 1 },
                        },
                    },
                ])
                    .then((reprobado) => {
                        res.json({
                            code: status.OK,
                            msg: "Resultados",
                            NoAprobados: reprobado,
                            Aprobados: aprobado,
                        })
                    })
                    .catch((err) => {
                        res.status(status.BAD_REQUEST).json({
                            code: status.BAD_REQUEST,
                            msg: "Error en la petición",
                            err: err.name,
                            detail: err.message,
                        })
                    })
            })
            .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Error en la petición",
                    err: err.name,
                    detail: err.message,
                })
            })
    });


    //Estadística de estudiantes mayores y menores de edad por carrera 
    router.get("/Consulta/Edades", (req, res) => {
        Student.aggregate([
            { $match: { curp: /(.{4}[0-9][0-9][0-9][0-9][0-9][0-9].{6}[0-9][0-9])|(.{4}[0][0-3][0-9][0-9][0-9][0-9].{6}[A-Z,a-z][0-9])/ } },
            { $group: { _id: "$carrer", count: { $sum: 1 } } },
        ])
            .then((mayor) => {
                Student.aggregate([
                    { $match: { curp: /^(?!((.{4}[0-9][0-9][0-9][0-9][0-9][0-9].{6}[0-9][0-9])|(.{4}[0][0-3][0-9][0-9][0-9][0-9].{6}[A-Z,a-z][0-9])))/ } },
                    { $group: { _id: "$carrer", count: { $sum: 1 } } },
                ])
                    .then((menor) => {
                        res.json({
                            code: status.OK,
                            msg: "Estadistica edades",
                            Mayores: mayor,
                            Menores: menor,
                        });
                    })
                    .catch((err) => {
                        res.status(status.BAD_REQUEST).json({
                            code: status.BAD_REQUEST,
                            msg: "Error en la petición",
                            err: err.name,
                            detail: err.message,
                        });
                    });
            })
            .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Error en la petición",
                    err: err.name,
                    detail: err.message,
                });
            });
    });

    return router;
}/*Llave finaaal-----------------------------*/