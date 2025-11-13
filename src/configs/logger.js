/**
 * @file Configuration information for Winston logger
 * @author Russell Feldhausen <russfeld@ksu.edu>
 * @exports logger a Winston logger object
 */

// Import libraries
import winston from "winston";
import { format } from "winston";

// Extract format options
const { combine, timestamp, printf, colorize, align, errors } = winston.format;

/**
 * Custom formatter for Sequelize Logs
 */
const sequelizeErrors = format((info) => {
  // Adapted from https://github.com/sequelize/sequelize/issues/14807#issuecomment-1853514339
  if (info instanceof Error && info.name.startsWith("Sequelize")) {
    if (info.parent) {
      let { message } = info.parent;
      if (info.sql) {
        message += "\nSQL: " + info.sql;
      }

      if (info.parameters) {
        const stringifiedParameters = JSON.stringify(info.parameters);
        if (
          stringifiedParameters !== "undefined" &&
          stringifiedParameters !== "{}"
        ) {
          message += "\nParameters: " + stringifiedParameters;
        }
      }
      // Stack is already included in the error
      // message += "\n" + info.stack;

      // Update the message
      info.message = info.message += "\n" + message;
    }
  }
  return info;
});

/**
 * Determines the correct logging level based on the Node environment
 *
 * @returns {string} the desired log level
 */
function level() {
  /* c8 ignore start */
  if (process.env.LOG_LEVEL) {
    if (process.env.LOG_LEVEL === "0" || process.env.LOG_LEVEL === "error") {
      return "error";
    }
    if (process.env.LOG_LEVEL === "1" || process.env.LOG_LEVEL === "warn") {
      return "warn";
    }
    if (process.env.LOG_LEVEL === "2" || process.env.LOG_LEVEL === "info") {
      return "info";
    }
    if (process.env.LOG_LEVEL === "3" || process.env.LOG_LEVEL === "http") {
      return "http";
    }
    if (process.env.LOG_LEVEL === "4" || process.env.LOG_LEVEL === "verbose") {
      return "verbose";
    }
    if (process.env.LOG_LEVEL === "5" || process.env.LOG_LEVEL === "lti") {
      return "lti";
    }
    if (process.env.LOG_LEVEL === "6" || process.env.LOG_LEVEL === "debug") {
      return "debug";
    }
    if (process.env.LOG_LEVEL === "7" || process.env.LOG_LEVEL === "sql") {
      return "sql";
    }
    if (process.env.LOG_LEVEL === "8" || process.env.LOG_LEVEL === "silly") {
      return "silly";
    }
  }
  return "http";
  /* c8 ignore end */
}

// Custom logging levels for the application
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  lti: 5,
  debug: 6,
  sql: 7,
  silly: 8,
};

// Custom colors
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "white",
  verbose: "cyan",
  lti: "magenta",
  debug: "blue",
  sql: "gray",
  silly: "gray",
};

winston.addColors(colors);

// Creates the Winston instance with the desired configuration
const logger = winston.createLogger({
  // call `level` function to get default log level
  level: level(),
  levels: levels,
  // Format configuration
  // See https://github.com/winstonjs/logform
  format: combine(
    sequelizeErrors(),
    errors({ stack: true }),
    colorize({ all: true }),
    //shortFormat(),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    align(),
    printf(
      (info) =>
        `[${info.timestamp}] ${info.level}: ${info.stack ? info.message + "\n" + info.stack : info.message}`,
    ),
  ),
  // Output configuration
  transports: [new winston.transports.Console()],
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

export default logger;
