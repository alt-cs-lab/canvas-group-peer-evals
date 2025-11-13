async function studentEvaluation(req, res) {

  // variables from the LTI launch/session
  const name = req.session.user.name;
  const userId = req.session.user.canvas_user_id;
  const assignmentId = req.session.assignmentId;
  const resultSourcedid = req.session.resultSourcedid;
  const outcomeServiceUrl = req.session.outcomeServiceUrl;
  const assignmentName = req.session.assignmentName;

  // get the evaluation
  const db = req.app.get('db');
  const evaluation = await db.evaluations.findOne({canvas_assignment_id: assignmentId});

  let assignedEvaluations = [];
  let evaluationSummary = null;

  if (evaluation){ 
    // get assigned evaluations for user
    assignedEvaluations = await db.assigned_evaluations.find({      
      evaluation_id: evaluation.id,
      evaluator_canvas_id: userId
    });

    // get user's evaluation summary
    evaluationSummary = await db.evaluation_summaries.findOne({
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
        grade_passback_url: outcomeServiceUrl,
        canvas_assignment_id: assignmentId,
        canvas_assignment_name: assignmentName,
        canvas_consumer_id: req.session.consumerId
      });
    }
  } 

  res.render('evaluation', {name, evaluation, assignedEvaluations, evaluationSummary, assignmentName})
  
}

export default studentEvaluation;