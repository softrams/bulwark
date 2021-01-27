const dotenv = require('dotenv');
const fs = require('fs');
import * as path from 'path';
const { writeFile } = require('fs');

export const setEnv = () => {
  if (fs.existsSync(path.join(__dirname, '../../.env'))) {
    const envPath = fs.readFileSync(path.join(__dirname, '../../.env'));
    // tslint:disable-next-line: no-console
    console.log('A .env file has been found found and will now be parsed.');
    // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
    const envConfig = dotenv.parse(envPath);
    if (envConfig) {
      for (const key in envConfig) {
        if (envConfig.hasOwnProperty(key)) {
          process.env[key] = envConfig[key];
        }
      }
      // tslint:disable-next-line: no-console
      console.log('The provided .env file has been parsed successfully.');
    }
    let targetPath: string;
    let isProduction: boolean;
    let apiUrl: string;

    if (process.env.NODE_ENV === 'production') {
      isProduction = true;
      apiUrl = `${process.env.PROD_IP}:${process.env.PORT}/api`;
      targetPath = path.join(
        __dirname,
        '../../frontend/src/environments/environment.prod.ts'
      );
    } else {
      isProduction = false;
      apiUrl = `${process.env.DEV_IP}:${process.env.PORT}/api`;
      targetPath = path.join(
        __dirname,
        '../../frontend/src/environments/environment.ts'
      );
    }

    // we have access to our environment variables
    // in the process.env object thanks to dotenv
    const environmentFileContent = `
        export const environment = {
           production: ${isProduction},
           apiUrl: "${apiUrl}",
        };
        `;

    // write the content to the respective file
    writeFile(targetPath, environmentFileContent, (err) => {
      if (err) {
        console.error(err);
      }
      console.info(`Wrote ${environmentFileContent} to ${targetPath}`);
      return;
    });
  } else {
    // tslint:disable-next-line: no-console
    console.info(
      'A .env file was not found. Attempting to fetch values from existing environment variables.'
    );
  }
};
