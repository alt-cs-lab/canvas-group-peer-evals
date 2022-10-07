const lti = require('ims-lti');

module.exports = (req, res, next) => {

  // Should have oauth_consumer_key 
  const key = req.body.oauth_consumer_key;
  if(!key)
  {
    console.error("Request missing oauth_consumer_key");
    return res.status(401).send("Unauthorized");
  }
    
  // Find the secret corresponding to the oauth_consumer_key
  // from the database, i.e.:
  // SELECT secret FROM organization WHERE KEY = key;
  const secret = "Gatekeeper";
  if(!secret)
  {
    console.error(`Unknown consumer key attempted: ${key}`)
    return res.status(401).send("Unauthorized");
  }
  
  // Override the protocol to reflect https
  req.connection.encrypted = true;

  // Check validity of lti launch request
  const provider = new lti.Provider(key, secret);
  provider.valid_request(req, (err, isValid) => {
    if(err || !isValid) {
      console.error(err);
      res.status(401).send("Unauthorized");
      return;
    };
    next();
  })
}