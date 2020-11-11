import { Connection, createConnection, getManager } from 'typeorm';
const exec = require('child_process').exec;
let connection: Connection;
export const initDbCheck = async () => {
  connection = await createConnection();
  const manager = getManager();
  let migrations;
  try {
    migrations = await manager.query('SELECT * FROM migrations');
  } catch (err) {
    if (err) {
      console.error(err);
    }
    // tslint:disable-next-line: no-console
    console.info('Initial migration not found. Running generating initial migration.');
    // If the migrations table does not exist, run the migration:init script
    // to create schema
    exec('npm run migration:init', (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        terminate();
      }
      // tslint:disable-next-line: no-console
      console.log(stdout);
      exec('npm run migration:run', (runErr) => {
        if (runErr) {
          console.error(err);
          terminate();
        }
        // tslint:disable-next-line: no-console
        console.info('Initial migration has been generated successfully.  Running initial migration.');
        // tslint:disable-next-line: no-console
        console.log(stdout);
        terminate();
      });
    });
  }
  if (migrations) {
    migrations = migrations.map((x) => x.name);
    // If the CreateDatabase migration exists skip migration:generate
    // else run the migration:generate script
    if (migrations[0].includes('CreateDatabase')) {
      // tslint:disable-next-line: no-console
      console.info(`Initial migration ${migrations[0]} exists. Skipping migration:init script`);
    }
    // If the init migration was already created check to see
    // if there has been an update to the database
    // If there was a DB update, run the migration
    exec('npm run migration:generate', (err) => {
      if (err) {
        // tslint:disable-next-line: no-console
        console.info('No database updates detected');
        terminate();
      }
      // tslint:disable-next-line: no-console
      exec('npm run migration:run', (runErr, runStdout) => {
        // tslint:disable-next-line: no-console
        console.info('Database updates detected. Running generated migrations');
        if (runErr) {
          console.error(err);
          terminate();
        }
        // tslint:disable-next-line: no-console
        console.log(runStdout);
        terminate();
      });
    });
  }
};

const terminate = () => {
  connection.close();
  process.exit();
};

initDbCheck();
