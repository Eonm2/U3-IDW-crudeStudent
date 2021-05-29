const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
            maxLength: 50,
            uppercase: true
        },
        lastname: {
            type: String,
            required: true,
            maxLength: 50,
            uppercase: true
        },
        curp: {
            type: String,
            required: true,
            uppercase: true,
            match: /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/
        },
        create_date: {
            required: true,
            type: Date,
            default: Date.now()
        },
        controlnumber: {
            type: String,
            required: true,
            unique: true
        },
        grade: {
            type: Number,
            required: true
        },
        carrer: {
            type: String,
            required: true,
            enum: {
                values: ['ISC', 'IGE', 'IM', 'IC'],
                message: '{VALUE} No es una carrera valida'
            }
        }
    }

);
const studentModel = mongoose.model('Student', schema, 'student');
module.exports = studentModel;