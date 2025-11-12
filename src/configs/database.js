/**
 * @file Configuration information for Sequelize database ORM
 * @author Russell Feldhausen <russfeld@ksu.edu>
 * @exports sequelize a Sequelize instance
 */

// Import libraries
import Sequelize from "sequelize";
import sequelizeNoUpdateAttributes from "sequelize-noupdate-attributes";

// Create Sequelize instance
const sequelize = new Sequelize({
  // Supports "sqlite" or "postgres"
  dialect: "postgres",
  // Used by Postgres
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "postgres",
  pool: { max: 1, idle: Infinity, maxUses: Infinity },
});

sequelizeNoUpdateAttributes(sequelize);

export default sequelize;
