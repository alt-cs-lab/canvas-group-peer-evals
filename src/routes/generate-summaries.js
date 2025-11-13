import createEvaluationSummary from '../services/grading.js';

export default async function generateSummaries(req, res) {
  const db = req.app.get('db');
  const evaluation = await db.evaluations.findOne(req.params.id);

  if(!evaluation) return res.status(404).send("Not Found");
  const assignedEvaluations = await db.assigned_evaluations.find({evaluation_id: evaluation.id});
  var groups = {}
  assignedEvaluations.forEach((an_evaluation) => {
    const id = an_evaluation.evaluatee_canvas_id
    if(!groups[id]) groups[id] = [];
    groups[id].push(an_evaluation);
  });

  for(var group of Object.values(groups)) {
    const completed = group.filter(an_evaluation => an_evaluation.completed);
    if(completed.length > 0) {
      createEvaluationSummary(db, completed);
    }
  }
  
  req.flash("success", "Evaluation summaries generation successful! Wait a few moments for grades to be posted back to Canvas, and then refresh this page");
  res.redirect('/instructor/evaluation-progress');
}


