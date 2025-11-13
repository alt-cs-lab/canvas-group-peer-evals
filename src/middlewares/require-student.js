/**
 * Middleware to require that the user is a student
 * @file Express require student middleware
 * @author Russell Feldhausen <russfeld@ksu.edu>
 * @exports requireStudent middleware
 */
export default function requireStudent(req, res, next) {
  if (req.session && req.session.user && req.session.role === 'Learner') {
    next();
  } else {
    res.status(403).send('Forbidden: Student access required');
  }
}