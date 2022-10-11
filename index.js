require('dotenv').config();

const path = require('path');
const express = require('express');
const massive = require('massive');
const session = require('express-session');
const bodyParser = require('body-parser');

var app = express();

(async() => {

  // Set up the database
  const db = await massive({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    scripts: './queries'
  });
  await db.init();
  app.set('db', db);

  // Set up the proxy
  var trustProxy = process.env.TRUST_PROXY; 
  if(trustProxy) {
    // The 'trust proxy' setting can either be a boolean
    // (blanket trust any proxy) or a specific ip address
    if(trustProxy === "true") app.set('trust proxy', true);
    else app.set('trust proxy', trustProxy);
  }

  // Set up sessions
  app.use(session({
    secret: process.env.SESSION_KEY || 'saxophonecat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
  }));

  app.set('views', path.join(__dirname, 'src/views'));
  app.set('view engine', 'ejs');

  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/', (req, res) => res.send("Hello"));

  app.post('/', require('./src/middleware/verify-lti-launch'), require('./src/routes/lti-launch.js'));
  app.post('/assign-evaluations', require('./src/routes/assign-evaluations'));
  app.post('/submit-evaluation', require('./src/routes/submit-evaluation'));

  app.listen(3000, () => console.log("Listening on port 3000"));

})();


