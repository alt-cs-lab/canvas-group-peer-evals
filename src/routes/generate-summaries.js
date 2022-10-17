const {createEvaluationSummary} = require('../services/grading');

module.exports = async function generateSummaries(req, res) {
  const db = req.app.get('db');
  const evaluation = await db.evaluations.findOne(req.params.id);

  if(!evaluation) return res.status(404).send("Not Found");
  const assignedEvaluations = await db.assigned_evaluations.find({evaluation_id: evaluation.id});
  var groups = {}
  assignedEvaluations.forEach((eval) => {
    const id = eval.evaluatee_canvas_id
    if(!groups[id]) groups[id] = [];
    groups[id].push(eval);
  });

  for(var group of Object.values(groups)) {
    if(group.reduce((flag, eval) => flag && eval.completed, true)) 
      createEvaluationSummary(db, group);
  }
  
  res.send("OK")
}


