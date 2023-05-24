const routes = require('./routes');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

app.use(express.json());
app.use('/', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(8080);