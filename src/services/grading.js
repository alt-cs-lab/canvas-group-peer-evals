import session from 'express-session';
import lti from '../configs/lti.js';
// const OAuth1Signature = require('oauth1-signature');

async function createEvaluationSummary(db, evaluations) {
  const evaluation_id = evaluations[0].evaluation_id;
  const evaluatee_canvas_id = evaluations[0].evaluatee_canvas_id;
  const evaluatee_name = evaluations[0].evaluatee_name;

  const discussion_score = evaluations.reduce((acc, evaluation) => acc + evaluation.discussion_score, 0) / evaluations.length;
  const on_task_score = evaluations.reduce((acc, evaluation) => acc + evevaluational.on_task_score, 0) / evaluations.length;
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
    // result = submitGrade(grade, evaluationSummary.result_sourcedid, evaluationSummary.grade_passback_url);
    const gradeObj = {
      user_id: evaluatee_name,
      assignment_id: evaluationSummary.canvas_assignment_id,
      lms_grade_id: evaluationSummary.result_sourcedid,
      score: grade / 100
    }

    const assignment = {
      course: {
        consumer_id: evaluationSummary.canvas_consumer_id
      },
      grade_url: evaluationSummary.grade_passback_url
    }

    // Unused for LTI 1.0 but required by the function
    const consumerUser = {
      id: evaluatee_canvas_id
    }

    const result = await lti.controllers.lti.postGrade(gradeObj, assignment, consumerUser)
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

async function submitGrade(grade, resultSourcedid, gradePassbackUrl){


  return lti.controllers.lti.postGrade(grade, assignment, consumerUser)
  // // The body of the grade posting request is an XML document
  // // with a specific structure:
  // const xml = `<?xml version="1.0" encoding="UTF-8"?>
  //   <imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
  //     <imsx_POXHeader>
  //       <imsx_POXRequestHeaderInfo>
  //         <imsx_version>V1.0</imsx_version>
  //         <imsx_messageIdentifier>999999123</imsx_messageIdentifier>
  //       </imsx_POXRequestHeaderInfo>
  //     </imsx_POXHeader>
  //     <imsx_POXBody>
  //       <replaceResultRequest>
  //         <resultRecord>
  //           <sourcedGUID>
  //             <sourcedId>${resultSourcedid}</sourcedId>
  //           </sourcedGUID>
  //           <result>
  //             <resultScore>
  //               <language>en</language>
  //               <textString>${grade/100}</textString>
  //             </resultScore>
  //           </result>
  //         </resultRecord>
  //       </replaceResultRequest>
  //     </imsx_POXBody>  
  //   </imsx_POXEnvelopeRequest>`;

  // // The request must also contain Oauth parameters
  // // and a signature to validate it on the LMS side:
  // const signature = OAuth1Signature({
  //   consumerKey: process.env.LTI_CONSUMER_KEY,
  //   consumerSecret: process.env.LTI_SHARED_SECRET,
  //   url: gradePassbackUrl,
  //   method: 'POST',
  //   queryParams: {} // if you need to post additional query params, do it here
  // });

  // var response = await axios.request({
  //   url: gradePassbackUrl,
  //   params: signature.params,
  //   method: 'post',
  //   headers: {'Content-Type': 'application/xml'},
  //   data: xml,
  // });
}

export default createEvaluationSummary;