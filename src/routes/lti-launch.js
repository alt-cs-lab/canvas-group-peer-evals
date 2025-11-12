import canvas from "../services/canvas-api.js";

  /**
   * Handle an LTI Launch
   *
   * @param {Object} launchData - the data for the launch
   * @param {Object} consumer - the LTI consumer
   * @param {Object} req - Express request object
   */
async function launch(launchData, consumer, req) {
  const db = req.app.get('db');
  
  // Get the user info (or save if not in db already)
  const canvasUserId = launchData.user_lis_id ;
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
  if(launchData.user_roles === 'Instructor') return launchInstructor(launchData, req);
  if(launchData.user_roles === 'Learner') return launchLearner(launchData, consumer, req);
  res.status(400).send("Unknown user role");
}

async function launchInstructor(launchData, req) {
  
  // variables from the body
  req.session.courseId = launchData.course_id;
  req.session.assignmentId = launchData.assignment_id;

  return "/instructor/evaluation-progress";
 
  // // variables from the database
  // const db = req.app.get('db');
  // const evaluation = await db.evaluations.findOne({canvas_assignment_id: assignmentId});
  
  // if(evaluation) {
  //   // Get all students in the course 
  //   var students = await canvas.getCourseStudents(courseId);
  //   var studentMap = {};
  //   students.forEach(student => {
  //     student.assignedEvaluations = [];
  //     studentMap[student.id] = student;
  //   });

  //   // We want to display student progress
  //   const assignedEvaluations = await db.assigned_evaluations.find({
  //     evaluation_id: evaluation.id
  //   })
  //   assignedEvaluations.forEach(ae => {
  //     if(studentMap[ae.evaluator_canvas_id]) {
  //       studentMap[ae.evaluator_canvas_id].assignedEvaluations.push(ae);
  //     } else {
  //       console.error(`Evaluator ${ae.evaluator_canvas_id} not found`);
  //     }
  //   });

  //   // And provide final evaluations (when available)
  //   const evaluationSummaries = await db.evaluation_summaries.find({
  //     evaluation_id: evaluation.id
  //   });
  //   evaluationSummaries.forEach(es => {
  //     if(studentMap[es.evaluatee_canvas_id]) {
  //       studentMap[es.evaluatee_canvas_id].evaluationSummary = es;
  //     } else {
  //       console.error(`Evaluatee ${es.evaluatee_canvas_id} not found`);
  //     }
  //   });

  //   students = Object.values(studentMap);

  //   res.render('evaluation-progress', {evaluation, assignedEvaluations, students});
  // } else {
  //   // We need the user to select a group category
  //   const groupCategories = await canvas.getGroupCategories(courseId);
  //   res.render('select-group-category', {
  //     groupCategories,
  //     assignmentId,
  //     courseId
  //   });
  // }
}

async function launchLearner(launchData, consumer, req) {
  // variables from the body
  req.session.assignmentId = launchData.assignment_id;
  req.session.resultSourcedid = launchData.outcome_id;
  req.session.outcomeServiceUrl = launchData.outcome_url;
  req.session.consumerId = consumer.id;

  return "/student/evaluation";
  
  // // get the evaluation
  // const db = req.app.get('db');
  // const evaluation = await db.evaluations.findOne({canvas_assignment_id: assignmentId});
  
  // // get assigned evaluations for user
  // const assignedEvaluations = await db.assigned_evaluations.find({      
  //   evaluation_id: evaluation.id,
  //   evaluator_canvas_id: userId
  // });

  // // get user's evaluation summary
  // var evaluationSummary = await db.evaluation_summaries.findOne({
  //   evaluation_id: evaluation.id,
  //   evaluatee_canvas_id: userId
  // });
  // if(!evaluationSummary) {
  //   // Create one if one does not yet exist
  //   evaluationSummary = await db.evaluation_summaries.save({
  //     evaluation_id: evaluation.id,
  //     evaluatee_canvas_id: userId,
  //     evaluatee_name: name,
  //     result_sourcedid: resultSourcedid,
  //     grade_passback_url: outcomeServiceUrl
  //   });
  // }

  // res.render('evaluation', {name, evaluation, assignedEvaluations, evaluationSummary})
}

export default launch;