async function studentEvaluation(req, res) {

  // variables from the body
  const name = req.session.lis_person_name_full;
  const userId = req.session.custom_canvas_user_id;
  const assignmentId = req.session.custom_canvas_assignment_id;
  const resultSourcedid = req.session.lis_result_sourcedid;
  const outcomeServiceUrl = req.session.lis_outcome_service_url;

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
      grade_passback_url: outcomeServiceUrl,
      canvas_assignment_id: assignmentId,
      canvas_consumer_id: req.session.consumerId
    });
  }

  res.render('evaluation', {name, evaluation, assignedEvaluations, evaluationSummary})
  
}

export default studentEvaluation;