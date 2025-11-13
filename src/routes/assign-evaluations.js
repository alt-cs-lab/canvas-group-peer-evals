/**
 * @file Route handler to assign peer evaluations
 * @author Russell Feldhausen <russfeld@ksu.edu>
 * @exports assignEvaluations function to handle assigning evaluations
 */

import canvas from "../services/canvas-api.js";

async function assignEvaluations(req, res) {

  // Extract data from request body
  const courseId = req.body.course_id;
  const assignmentId = req.body.assignment_id;
  const groupCategoryId = req.body.group_category_id;
  const groupCategoryName = req.body.group_category_name;
  
  const groups = await canvas.getGroupsInGroupCategory(groupCategoryId);
  var assignedEvaluations = [];

  const db = req.app.get('db');
  await db.withTransaction(async tx => {   
    const evaluation = await tx.evaluations.save({
      canvas_assignment_id: assignmentId,
      canvas_course_id: courseId, 
      canvas_group_category_id: groupCategoryId,
      canvas_group_category_name: groupCategoryName
    });
    for(const group of groups) {
      for(const evaluator of group.users) {
        for(const evaluatee of group.users) {
          if(evaluator.id != evaluatee.id) {
            var assignedEvaluation = await tx.assigned_evaluations.save({
              evaluation_id: evaluation.id,
              evaluator_canvas_id: parseInt(evaluator.id),
              evaluator_name: evaluator.name,
              evaluatee_canvas_id: parseInt(evaluatee.id),
              evaluatee_name: evaluatee.name,
              completed: false
            });
            assignedEvaluations.push(assignedEvaluation);
            console.log('ae1', assignedEvaluations);
          }
        }
      }
    }
  }, {
    tag: 'assigning evaluations',
    mode: new db.pgp.txMode.TransactionMode({
      tiLevel: db.pgp.txMode.isolationLevel.serializable
    })
  });

  req.flash("success", "Peer evaluations assigned successfully!");
  res.redirect('/instructor/evaluation-progress');
}

export default assignEvaluations;