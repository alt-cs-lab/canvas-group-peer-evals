// Import Configs
import database from "./database.js";

// Controllers
import LTILaunch from "../routes/lti-launch.js";

// Import LTI Toolkit
import LTIToolkit from "lti-toolkit"

// Initialize LTI Toolkit
const lti = await LTIToolkit({
  database: database,
  handleLaunch: LTILaunch,
  postProviderGrade: () => { return false; },
  vars: {
    domain_name: process.env.DOMAIN_NAME,
    admin_email: process.env.ADMIN_EMAIL,
    deployment_name: process.env.LPP_DEPLOYMENT_NAME,
    deployment_id: process.env.LPP_DEPLOYMENT_ID
  }
});

export default lti;