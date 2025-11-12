import "@dotenvx/dotenvx/config";

import path from "path";
import express from "express";
import massive from "massive";
import session from "express-session";

import lti from './src/configs/lti.js';
import assignEvaluations from "./src/routes/assign-evaluations.js";
import submitEvaluation from "./src/routes/submit-evaluation.js";
import generateSummaries from "./src/routes/generate-summaries.js";
import evaluationProgress from "./src/routes/evaluation-progress.js";
import studentEvaluation from "./src/routes/student-evaluation.js";

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
  if(trustProxy && trustProxy.length > 0 && trustProxy !== "false") {
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

  app.set('views', path.join(import.meta.dirname, 'src/views'));
  app.set('view engine', 'ejs');

  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => res.send("Hello from Canvas Group Peer Evals!"));

  // Use /launch10 for LTI 1.0 launches
  app.post('/', lti.routers.provider);
  app.post('/assign-evaluations', assignEvaluations);
  app.post('/submit-evaluation', submitEvaluation);
  app.get('/generate-summaries/:id', generateSummaries);

  app.get('/instructor/evaluation-progress', evaluationProgress);
  app.get('/student/evaluation', studentEvaluation);

  app.listen(3000, () => console.log("Listening on port 3000"));

})();


