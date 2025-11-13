  /**
   * Handle an LTI Launch
   *
   * @param {Object} launchData - the data for the launch
   * @param {Object} consumer - the LTI consumer object
   * @param {Object} req - Express request object
   */
async function launch(launchData, consumer, req) {
  const db = req.app.get('db');
  
  // Get the user info (or save if not in db already)
  const canvasUserId = launchData.custom.canvas_user_id;
  var user = await db.users.findOne({canvas_user_id: canvasUserId});
  if(!user) {
    user = await db.users.save({
      canvas_user_id: canvasUserId,
      name: launchData.user_name,
      email: launchData.user_email
    });
  }
  // Add user info to the session
  req.session.user = user;

  // respond based on the role of the user
  if(launchData.user_roles === 'Instructor'){
    // Store role in session
    req.session.role = 'Instructor';
    return launchInstructor(launchData, req);
  }
  if(launchData.user_roles === 'Learner') {
    // Store role in session
    req.session.role = 'Learner';
    return launchLearner(launchData, consumer, req);
  }
  res.status(400).send("Unknown user role");
}

async function launchInstructor(launchData, req) {
  // store variables from the LTI launch in the session
  req.session.courseId = launchData.custom.canvas_course_id;
  req.session.assignmentId = launchData.assignment_id;

  // LTI Toolkit requires a return value here as a redirect URL
  return "/instructor/evaluation-progress";
}

async function launchLearner(launchData, consumer, req) {
  // store variables from the LTI launch in the session
  req.session.assignmentId = launchData.assignment_id;
  req.session.resultSourcedid = launchData.outcome_id;
  req.session.outcomeServiceUrl = launchData.outcome_url;
  req.session.consumerId = consumer.id;
  req.session.assignmentName = launchData.assignment_name;

  // LTI Toolkit requires a return value here as a redirect URL
  return "/student/evaluation";
}

export default launch;