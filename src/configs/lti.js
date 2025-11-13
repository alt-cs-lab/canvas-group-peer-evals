/**
 * @file Configuration information for LTI Toolkit
 * @author Russell Feldhausen <russfeld@ksu.edu>
 * @exports lti an LTI Toolkit instance configured for this app
 */

// Import Configs
import database from "./database.js";
import logger from "./logger.js";

// Controllers
import LTILaunch from "../routes/lti-launch.js";

// Import LTI Toolkit
import LTIToolkit from "lti-toolkit"

// Initialize LTI Toolkit
const lti = await LTIToolkit({
  domain_name: process.env.DOMAIN_NAME,
  logger: logger,
  database: database,
  provider: {
    handleLaunch: LTILaunch,
    key: process.env.LTI_CONSUMER_KEY,
    secret: process.env.LTI_SHARED_SECRET
  }
});

export default lti;