/**
 * @file Express request logger middleware
 * @author Russell Feldhausen <russfeld@ksu.edu>
 * @exports requestLogger middleware
 */

// Import Libraries
import morgan from "morgan";

// Import logger configuration
import logger from "../configs/logger.js";

// Override morgan stream method to use our custom logger
const stream = {
  write: (message) => {
    // log using the 'http' severity
    logger.http(message.trim());
  },
};

// Log Format - dev
// :method :url :status :res[content-length] - :response-time ms
// See https://github.com/expressjs/morgan?tab=readme-ov-file#api
const requestLogger = morgan("dev", { stream });

export default requestLogger;
