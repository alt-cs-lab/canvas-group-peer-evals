const lti = require('ims-lti');

module.exports = (req, res, next) => {

  // Should have oauth_consumer_key 
  const key = process.env.CLIENT_KEY;
  const secret = process.env.SHARED_SECRET;

  // Check validity of lti launch request
  const provider = new lti.Provider(key, secret);
  provider.valid_request(req, (err, isValid) => {
    if(err || !isValid) {
      console.error(err);
      res.status(401).send("Unauthorized");
      return;
    };
    next();
  });
}