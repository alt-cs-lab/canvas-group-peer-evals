import canvas from "../services/canvas-api.js";

async function evaluationProgress(req, res) {
  const courseId = req.session.courseId;
  const assignmentId = req.session.assignmentId;

  // variables from the database
  const db = req.app.get('db');
  const evaluation = await db.evaluations.findOne({canvas_assignment_id: assignmentId});
  
  if(evaluation) {
    // Get all students in the course 
    var students = await canvas.getCourseStudents(courseId);
    var studentMap = {};
    students.forEach(student => {
      student.assignedEvaluations = [];
      studentMap[student.id] = student;
    });

    // We want to display student progress
    const assignedEvaluations = await db.assigned_evaluations.find({
      evaluation_id: evaluation.id
    })
    assignedEvaluations.forEach(ae => {
      if(studentMap[ae.evaluator_canvas_id]) {
        studentMap[ae.evaluator_canvas_id].assignedEvaluations.push(ae);
      } else {
        console.error(`Evaluator ${ae.evaluator_canvas_id} not found`);
      }
    });

    // And provide final evaluations (when available)
    const evaluationSummaries = await db.evaluation_summaries.find({
      evaluation_id: evaluation.id
    });
    evaluationSummaries.forEach(es => {
      if(studentMap[es.evaluatee_canvas_id]) {
        studentMap[es.evaluatee_canvas_id].evaluationSummary = es;
      } else {
        console.error(`Evaluatee ${es.evaluatee_canvas_id} not found`);
      }
    });

    students = Object.values(studentMap);

    res.render('evaluation-progress', {evaluation, assignedEvaluations, students, success: req.flash("success")});
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

export default evaluationProgress;