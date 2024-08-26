const axios = require('axios');
const {createEvaluationSummary} = require('../services/grading');

async function submitEvaluation(req, res) {
  const db = req.app.get('db');

  const evaluationData = {
    discussion_score: req.body.discussion_score, 
    on_task_score: req.body.on_task_score, 
    ideas_score: req.body.ideas_score,
    work_quality_score: req.body.on_task_score, 
    work_quantity_score: req.body.work_quality_score, 
    communication_score: req.body.communication_score,
    advice_for_evaluatee: req.body.advice_for_evaluatee,
    notes_for_instructor: req.body.notes_for_instructor,
    completed: true,
    submitted_at: new Date().toUTCString()
  };

  // Save the completed evaluation
  const assignedEvaluation = await db.assigned_evaluations.update(req.body.id, evaluationData);
  
  /*
  // Determine if we have enough to create a summary
  const evaluationsForEvaluatee = await db.assigned_evaluations.find({evaluatee_canvas_id: req.body.evaluatee_canvas_id});
  if(evaluationsForEvaluatee.reduce((complete, eval) => complete && eval, true)) {
    // All evaluations for this evaluatee are in - create the summary
    await createEvaluationSummary(db, evaluationsForEvaluatee);
  }
    */

  res.render('partials/complete-evaluation', {assignedEvaluation});
}

module.exports = submitEvaluation;