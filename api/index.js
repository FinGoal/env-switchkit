require('dotenv').config();
import routes from './routes'; // Endpoints
const express = require('express'); // API 
// const morgan = require('morgan'); // Logging  

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan("dev")); // dev version of logger - just for simpler debugging. 
app.use(routes);

export default {
  path: '/api', // Note that all of this routes through the /api parameter to avoid conflicting with frontend routes.
  handler: app,
}
