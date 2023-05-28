require('dotenv').config();
const routes = require('./routes');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use('/', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))



//const token = jwt.sign('cassio', process.env.JWT_SECRET);
//console.log(token)
app.listen(8080);