const passport = require('passport');

const authenticate = passport.authenticate('bearer', { session: false });

module.exports = authenticate;
