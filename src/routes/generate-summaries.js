const axios = require('axios');
const OAuth1Signature = require('oauth1-signature');

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


async function createEvaluationSummary(db, evaluations) {
  const evaluation_id = evaluations[0].evaluation_id;
  const evaluatee_canvas_id = evaluations[0].evaluatee_canvas_id;
  const evaluatee_name = evaluations[0].name;

  const discussion_score = evaluations.reduce((acc, eval) => acc + eval.discussion_score, 0) / evaluations.length;
  const on_task_score = evaluations.reduce((acc, eval) => acc + eval.on_task_score, 0) / evaluations.length;
  const ideas_score = evaluations.reduce((acc, eval) => acc + eval.ideas_score, 0) / evaluations.length;
  const work_quality_score = evaluations.reduce((acc, eval) => acc + eval.work_quality_score, 0) / evaluations.length;
  const work_quantity_score = evaluations.reduce((acc, eval) => acc + eval.work_quantity_score, 0) / evaluations.length;
  const communication_score = evaluations.reduce((acc, eval) => acc + eval.communication_score, 0) / evaluations.length;
  const advice_for_evaluatee = evaluations.map(eval => eval.advice_for_evaluatee).join("; ");
  const notes_for_instructor = evaluations.map(eval => eval.notes_for_instructor).join("; ");

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
    await submitGrade(grade, evaluationSummary.result_sourcedid, evaluationSummary.grade_passback_url);
    // Save the updates to the summary in the database
    summary.id = evaluationSummary.id;
    summary.completed = true;
    await db.evaluation_summary.save(summary);
  } catch (exception) {
    console.error("Unable to submit grade");
    console.error(evaluationSummary);
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
  // The body of the grade posting request is an XML document
  // with a specific structure:
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
      <imsx_POXHeader>
        <imsx_POXRequestHeaderInfo>
          <imsx_version>V1.0</imsx_version>
          <imsx_messageIdentifier>999999123</imsx_messageIdentifier>
        </imsx_POXRequestHeaderInfo>
      </imsx_POXHeader>
      <imsx_POXBody>
        <replaceResultRequest>
          <resultRecord>
            <sourcedGUID>
              <sourcedId>${resultSourcedid}</sourcedId>
            </sourcedGUID>
            <result>
              <resultScore>
                <language>en</language>
                <textString>${grade/100}</textString>
              </resultScore>
            </result>
          </resultRecord>
        </replaceResultRequest>
      </imsx_POXBody>  
    </imsx_POXEnvelopeRequest>`;

  // The request must also contain Oauth parameters
  // and a signature to validate it on the LMS side:
  const signature = OAuth1Signature({
    consumerKey: process.env.LTI_CONSUMER_KEY,
    consumerSecret: process.env.LTI_SHARED_SECRET,
    url: gradePassbackUrl,
    method: 'POST',
    queryParams: {} // if you need to post additional query params, do it here
  });

  var response = await axios.request({
    url: gradePassbackUrl,
    params: signature.params,
    method: 'post',
    headers: {'Content-Type': 'application/xml'},
    data: xml,
  });


}