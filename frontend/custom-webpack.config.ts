/**
 * Custom webpack configuration to enable system environment variables, such as the API URL for
 * development or production.
 *
 * References:
 * https://www.npmjs.com/package/@angular-builders/custom-webpack#custom-webpack-config-function
 * https://medium.com/@hughblue/reading-system-environment-variables-from-angular-part-2-a63368e591b4
 * https://developer.okta.com/blog/2019/12/09/angular-webpack
 */

// JavaScript version (must have the .js file extension)
// const webpack = require('webpack');

// module.exports = {
//   plugins: [
//     new webpack.DefinePlugin({
//       'STABLE_FEATURE': JSON.stringify(true),
//       'EXPERIMENTAL_FEATURE': JSON.stringify(false)
//     })
//   ]
// };

// TypeScript version (must have the .ts file extension)
import { CustomWebpackBrowserSchema } from '@angular-builders/custom-webpack';
import * as webpack from 'webpack';
import * as pkg from './package.json';

// Filter only the environment variables starting by a given prefix
// const prefix = 'APP_';
// const keys = Object.keys(process.env).filter(key => key.startsWith(prefix));
// let env = {};
// keys.forEach(key => env[key] = process.env[key]);
// console.log('process.env =', process.env);
// console.log('env =', env);

export default (config: webpack.Configuration, options: CustomWebpackBrowserSchema) => {
  config.plugins.push(
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(pkg.version),
      // APP_ENV: env,
      PROCESS_ENV: JSON.stringify(process.env)
    })
  );

  return config;
};
