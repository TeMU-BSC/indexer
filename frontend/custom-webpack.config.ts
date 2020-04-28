// JavaScript
// const webpack = require('webpack');

// module.exports = {
//   plugins: [
//     new webpack.DefinePlugin({
//       'STABLE_FEATURE': JSON.stringify(true),
//       'EXPERIMENTAL_FEATURE': JSON.stringify(false)
//     })
//   ]
// };

// TypeScript
import { CustomWebpackBrowserSchema } from '@angular-builders/custom-webpack';
import * as webpack from 'webpack';
import * as pkg from './package.json';

const prefix = 'APP_';
const keys = Object.keys(process.env).filter(key => key.startsWith(prefix));
let env = {};
keys.forEach(key => env[key] = process.env[key]);
console.log('process.env =', process.env);
console.log('env =', env);

export default (config: webpack.Configuration, options: CustomWebpackBrowserSchema) => {
  config.plugins.push(
    new webpack.DefinePlugin({
      // APP_VERSION: JSON.stringify(pkg.version),
      // ENV_VARS: env,
      // ENV_VARS: JSON.stringify(env)
      APP_ENV: env,
      PROCESS_ENV: JSON.stringify(process.env)
    })
  );

  return config;
};
