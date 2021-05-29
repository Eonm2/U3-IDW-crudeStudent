const bodyparser = require('body-parser');
const bodyParser = require('body-parser');
const express = require('express');

const students = require('./router/students.router')();
let app = express();

app.use(bodyparser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/students', students);
module.exports = app;