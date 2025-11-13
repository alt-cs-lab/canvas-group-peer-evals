import lti from '../configs/lti.js';

async function createEvaluationSummary(db, evaluations) {
  const evaluation_id = evaluations[0].evaluation_id;
  const evaluatee_canvas_id = evaluations[0].evaluatee_canvas_id;
  const evaluatee_name = evaluations[0].evaluatee_name;

  const discussion_score = evaluations.reduce((acc, evaluation) => acc + evaluation.discussion_score, 0) / evaluations.length;
  const on_task_score = evaluations.reduce((acc, evaluation) => acc + evaluation.on_task_score, 0) / evaluations.length;
  const ideas_score = evaluations.reduce((acc, evaluation) => acc + evaluation.ideas_score, 0) / evaluations.length;
  const work_quality_score = evaluations.reduce((acc, evaluation) => acc + evaluation.work_quality_score, 0) / evaluations.length;
  const work_quantity_score = evaluations.reduce((acc, evaluation) => acc + evaluation.work_quantity_score, 0) / evaluations.length;
  const communication_score = evaluations.reduce((acc, evaluation) => acc + evaluation.communication_score, 0) / evaluations.length;
  const advice_for_evaluatee = evaluations.map(evaluation => evaluation.advice_for_evaluatee).join("; ");
  const notes_for_instructor = evaluations.map(evaluation => evaluation.notes_for_instructor).join("; ");

  var grade = 100;
  grade += scoreToPenalty(discussion_score);
  grade += scoreToPenalty(on_task_score);
  grade += scoreToPenalty(ideas_score);
  grade += scoreToPenalty(work_quality_score);
  grade += scoreToPenalty(work_quantity_score);
  grade += scoreToPenalty(communication_score);
  if(grade < 0) grade = 0;

  // Retrieve the summary from the database
  const evaluationSummary = await db.evaluation_summaries.findOne({
    evaluatee_canvas_id: evaluatee_canvas_id,
    evaluation_id: evaluation_id
  });

  if(!evaluationSummary) return;

  // Create the summary data
  var summary = {
    evaluation_id,
    evaluatee_canvas_id,
    evaluatee_name,
    discussion_score,
    on_task_score,
    ideas_score,
    work_quality_score,
    work_quantity_score,
    communication_score,
    advice_for_evaluatee,
    notes_for_instructor
  };

  // Submit the finalized grade
  try {
    const gradeObj = {
      consumer_id: evaluationSummary.canvas_consumer_id,
      grade_url: evaluationSummary.grade_passback_url,
      lms_grade_id: evaluationSummary.result_sourcedid,
      score: grade / 100,
      debug: {
        user: evaluatee_name,
        user_id: evaluatee_canvas_id,
        assignment_id: evaluationSummary.canvas_assignment_id,
        assignment: evaluationSummary.canvas_assignment_name,
      }
    };

    const result = await lti.controllers.lti.postGrade(gradeObj)
    if(result) {
      // Save the updates to the summary in the database
      summary.id = evaluationSummary.id;
      summary.completed = true;
      await db.evaluation_summaries.save(summary);
    } else {
      console.error("Unable to submit grade");
      console.error(summary);
    }
  } catch (exception) {
    console.error("Unable to submit grade");
    console.error(summary);
    console.error(exception);
  }
}

function scoreToPenalty(score){
  if(score > 7) return 0;
  if(score > 5) return -10;
  if(score > 3) return -20;
  return -30;
}

export default createEvaluationSummary;