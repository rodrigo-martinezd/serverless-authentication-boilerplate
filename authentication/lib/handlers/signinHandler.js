'use strict';

// Config
require('dotenv').config();
const slsAuth = require('serverless-authentication');
const config = slsAuth.config;
const utils = slsAuth.utils;

// Providers
const facebook = require('serverless-authentication-facebook');
const google = require('serverless-authentication-google');
const microsoft = require('serverless-authentication-microsoft');
const customGoogle = require('../custom-google');

// Common
const cache = require('../storage/cacheStorage');

const redirectProxyCallback = require('../helpers').redirectProxyCallback;

/**
 * Sign In Handler
 * @param event
 * @param callback
 */
function signinHandler(event, context) {
  const providerConfig = config(event);
  // console.log('signinHandler PC', event, providerConfig);
  cache.createState()
    .then((state) => {
      switch (event.provider) {
        case 'facebook':
          facebook.signinHandler(providerConfig, { scope: 'email', state },
            (err, data) => redirectProxyCallback(context, data));
          break;
        case 'google':
          google.signinHandler(providerConfig, { scope: 'profile email', state },
            (err, data) => redirectProxyCallback(context, data));
          break;
        case 'microsoft':
          microsoft.signinHandler(providerConfig, { scope: 'wl.basic wl.emails', state },
            (err, data) => redirectProxyCallback(context, data));
          break;
        case 'custom-google':
          // See ./customGoogle.js
          customGoogle.signinHandler(providerConfig, { state },
            (err, data) => redirectProxyCallback(context, data));
          break;
        default:
          utils.errorResponse({
            error: `Invalid provider: ${event.provider}` },
            providerConfig,
            (err, data) => redirectProxyCallback(context, data)
          );
      }
    })
    .catch((error) =>
      utils.errorResponse(
        { error },
        providerConfig,
        (err, data) => redirectProxyCallback(context, data)
      ));
}

exports = module.exports = signinHandler;
