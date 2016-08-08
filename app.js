/**
 * Copyright 2014, 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express         = require('express'),
    app             = express(),
    errorhandler    = require('errorhandler'),
    bluemix         = require('./config/bluemix'),
    watson          = require('watson-developer-cloud'),
    path            = require('path'),
    // environmental variable points to demo's json config file
    extend          = require('util')._extend,
    bodyparser      = require('body-parser');

// For local development, put username and password in config
// or store in your environment
var config = {
  version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
  username: '69a0fc58-aec5-461a-a71e-e146d262dd6d',
  password: 'w47iPeTyKJ8L'
};
//Patrick - begin
//app.use('body-parser');
app.set('view engine', 'jade');
app.get('/', function (req, res) {
 res.render('index');
});

var credentialsPI = extend({
  version: 'v2',
  username: '4ecf51b2-0338-42d9-81c2-2578cd286ac9',
  password: '2cLAKdHxKm10'
}, bluemix.getServiceCreds('personality_insights')); // VCAP_SERVICES

// Create the service wrapper
var personalityInsights = watson.personality_insights(credentialsPI);

// 1. Check if we have a captcha and reset the limit
// 2. pass the request to the rate limit
app.post('/', function(req, res, next) {
    personalityInsights.profile(req.body, function(err, profile) {
      if (err)
        return next(err);
      else
        return res.json(profile);
    });
});
//Patrick - end

// if bluemix credentials exists, then override local
var credentials = extend(config, bluemix.getServiceCreds('speech_to_text'));
var authorization = watson.authorization(credentials);

// Setup static public directory
app.use(express.static(path.join(__dirname , './public')));

// Get token from Watson using your credentials
app.get('/token', function(req, res) {
  authorization.getToken({url: credentials.url}, function(err, token) {
    if (err) {
      console.log('error:', err);
      res.status(err.code);
    }

    res.send(token);
  });
});

// Add error handling in dev
if (!process.env.VCAP_SERVICES) {
  app.use(errorhandler());
}
var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);