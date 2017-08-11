// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var cors = require('cors');
var request = require('request');
var $ = require('jquery');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  restAPIKey: process.env.REST_API_KEY || '',
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// middleware
app.use(cors());

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

// new endpoint example for student projects
app.get('/proxy', function(req, res) {
  // res.send(req.query.camera);

  // do a request inside the get and return the results to your FEE project
  // var params = {
  //   api_key: 'XiPVohbJ1czo1N4Czgvs87NBaWCJMwr4V6P7Q8M4',
  //   rover: req.query.rover,
  //   camera: req.query.camera,
  //   sol: req.query.sol
  // }

  // set options for request
  // var options = {
  //   url: 'https://api.nasa.gov/mars-photos/api/v1/rovers?',
  //   body: $.param(params)
  // }

  request('https://api.nasa.gov/mars-photos/api/v1/rovers?api_key=XiPVohbJ1czo1N4Czgvs87NBaWCJMwr4V6P7Q8M4&rover=Opportunity&sol=2000&camera=RHAZ+(Rear+Hazard)', function (error, response, body) {
    response.send('here i am');
  });
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
