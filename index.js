import "@dotenvx/dotenvx/config";

import path from "path";
import express from "express";
import massive from "massive";
import flash from "connect-flash";

// Import configuration
import lti from './src/configs/lti.js';
import logger from "./src/configs/logger.js";
import sessions from "./src/configs/sessions.js";

// Import routes
import assignEvaluations from "./src/routes/assign-evaluations.js";
import submitEvaluation from "./src/routes/submit-evaluation.js";
import generateSummaries from "./src/routes/generate-summaries.js";
import evaluationProgress from "./src/routes/evaluation-progress.js";
import studentEvaluation from "./src/routes/student-evaluation.js";

// Import middlewares
import requestLogger from "./src/middlewares/request-logger.js";
import requireInstructor from "./src/middlewares/require-instructor.js";
import requireStudent from "./src/middlewares/require-student.js";

var app = express();

(async() => {

  // Set up the database
  const db = await massive({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // scripts: './queries'
  });
  await db.init();
  await db.reload();
  logger.info("Database connected");
  logger.info(db.listTables());
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
  app.use(sessions);
  app.use(flash());

  app.set('views', path.join(import.meta.dirname, 'src/views'));
  app.set('view engine', 'ejs');

  app.use(express.urlencoded({ extended: true }));

  // Use middlewares
  app.use(requestLogger);

  // Basic route
  app.get('/', (req, res) => res.send("Hello from Canvas Group Peer Evals! Access this tool through Canvas to get started."));

  // Use /launch10 for LTI 1.0 launches
  app.use('/', lti.routers.provider);

  // Instructor routes
  app.post('/instructor/assign-evaluations', requireInstructor, assignEvaluations);
  app.get('/instructor/generate-summaries/:id', requireInstructor, generateSummaries);
  app.get('/instructor/evaluation-progress', requireInstructor, evaluationProgress);

  // Student routes
  app.get('/student/evaluation', requireStudent, studentEvaluation);
  app.post('/student/submit-evaluation', requireStudent, submitEvaluation);

  app.listen(3000, () => console.log("Listening on port 3000"));

})();


