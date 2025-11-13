/**
 * Middleware to require that the user is a student
 * @file Express require student middleware
 * @author Russell Feldhausen <russfeld@ksu.edu>
 * @exports requireInstructor middleware
 */
export default function requireInstructor(req, res, next) {
  if (req.session && req.session.user && req.session.role === 'Instructor') {
    next();
  } else {
    res.status(403).send('Forbidden: Instructor access required');
  }
}