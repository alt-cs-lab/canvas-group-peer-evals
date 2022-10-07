const canvas = require('../services/canvas-api');

/**
 * Handles an incoming LTI Launch Request
 */
async function launch(req, res) {
  const db = req.app.get('db');
  
  // Get the user info (or save if not in db already)
  const canvasUserId = req.body.custom_canvas_user_id;
  var user = await db.users.findOne({canvas_user_id: canvasUserId});
  if(!user) {
    user = await db.users.save({
      canvas_user_id: canvasUserId,
      name: req.body.lis_person_name_full,
      email: req.body.lis_person_contact_email_primary
    });
  }
  // Add user info to the session
  req.session.user = user;

  // respond based on the role of the user
  if(req.body.roles === 'Instructor') return launchInstructor(req, res);
  if(req.body.roles === 'Learner') return launchLearner(req, res);
  res.status(400).send("Unknown user role");
}

async function launchInstructor(req, res) {
  
  // variables from the body
  const courseId = req.body.custom_canvas_course_id;
  const assignmentId = req.body.custom_canvas_assignment_id;
 
  // variables from the database
  const db = req.app.get('db');
  const evaluation = await db.evaluations.findOne({canvas_assignment_id: req.body.custom_canvas_assignment_id});
  
  if(evaluation) {
    // We want to display student progress
    const assignedEvaluations = await db.assigned_evaluations.find({
      evaluation_id: evaluation.id
    });
    res.render('evaluation-progress', {assignedEvaluations});
  } else {
    // We need the user to select a group category
    const groupCategories = await canvas.getGroupCategories(courseId);
    res.render('select-group-category', {
      groupCategories,
      assignmentId,
      courseId
    });
  }
}

async function launchLearner(req, res) {
  // variables from the body
  const name = req.body.lis_person_name_full;
  const userId = req.body.custom_canvas_user_id;
  const courseId = req.body.custom_canvas_course_id;
  const assignmentId = req.body.custom_canvas_assignment_id;
  const resultSourcedid = req.body.lis_result_sourcedid;
  const outcomeServiceUrl = req.body.lis_outcome_service_url;
console.log('body', req.body);
  // get the evaluation
  const db = req.app.get('db');
  const evaluation = await db.evaluations.findOne({canvas_assignment_id: assignmentId});
  
  // get assigned evaluations for user
  const assignedEvaluations = await db.assigned_evaluations.find({      
    evaluation_id: evaluation.id,
    evaluator_canvas_id: userId
  });

  // get user's evaluation summary
  var evaluationSummary = await db.evaluation_summaries.findOne({
    evaluation_id: evaluation.id,
    evaluatee_canvas_id: userId
  });
  if(!evaluationSummary) {
    // Create one if one does not yet exist
    evaluationSummary = await db.evaluation_summaries.save({
      evaluation_id: evaluation.id,
      evaluatee_canvas_id: userId,
      evaluatee_name: name,
      result_sourcedid: resultSourcedid,
      grade_passback_url: outcomeServiceUrl
    });
  }

  res.render('evaluation', {name, evaluation, assignedEvaluations, evaluationSummary})
}

module.exports = launch;