const express = require('express');
const app = express();

// Define your whitelist and queryAndParseAppSettings function
const global_whitelist = ['key1', 'key2', 'key3'];
const queryAndParseSettings = async (req, keys) => {
  return "OK - matches value in whitelist:" + global_whitelist.join(", ");
};


//Async Middleware that accepts a parameter as a closure
const getSettings = (whitelist) => async (req, res) => {
  const { keys: queryKeys } = req.query;
  const paramKeys = req.params;
  const keys = queryKeys || paramKeys?.keys;

  if (!keys) {
    res.status(400).send('No keys provided');
    return;
  }
  const keyArray = typeof keys === 'string' ? [keys] : keys;
  const invalidKeys = keyArray.filter(key => !whitelist.includes(key));

  if (invalidKeys.length) {
    res.send(`${invalidKeys.join(', ')} not in whitelist`);
    //res.status(400).send(`${invalidKeys.join(', ')} not in whitelist`);
    return;
  }
  const results = await queryAndParseSettings(req, keyArray);

  res.json(results);
};

//Async Middleware with no parameter (global variable instead)
const getSettingsNoParam = async (req, res) => {
  const { keys: queryKeys } = req.query;
  const paramKeys = req.params;
  const keys = queryKeys || paramKeys?.keys;

  if (!keys) {
    res.status(400).send('No keys provided');
    return;
  }
  const keyArray = typeof keys === 'string' ? [keys] : keys;
  const invalidKeys = keyArray.filter(key => !global_whitelist.includes(key));

  if (invalidKeys.length) {
    res.status(400).send(`${invalidKeys.join(', ')} not in whitelist`);
    return;
  }
  const results = await queryAndParseSettings(req, keyArray);

  res.json(results);
};

//Syncronous Middleware that accepts a parameter as a closure
const getSettingsSync = (whitelist) =>  (req, res) => {
  const { keys: queryKeys } = req.query;
  const paramKeys = req.params;
  const keys = queryKeys || paramKeys?.keys;

  if (!keys) {
    res.status(400).send('No keys provided');
    return;
  }
  const keyArray = typeof keys === 'string' ? [keys] : keys;
  const invalidKeys = keyArray.filter(key => !whitelist.includes(key));

  if (invalidKeys.length) {
    res.status(400).send(`${invalidKeys.join(', ')} not in whitelist`);
    return;
  }

  // call the async function via promise
  queryAndParseSettings(req, keyArray)
    .then(results => {
      res.json(results);
    })
    .catch(error => {
      res.status(500).send('Error retrieving settings');
    });
};

//Syncronous Middleware without any parameter (uses global variable instead)
const getSettingsSyncNoParam = (req, res) => {
  const { keys: queryKeys } = req.query;
  const paramKeys = req.params;
  const keys = queryKeys || paramKeys?.keys;

  if (!keys) {
    res.status(400).send('No keys provided');
    return;
  }
  const keyArray = typeof keys === 'string' ? [keys] : keys;
  const invalidKeys = keyArray.filter(key => !global_whitelist.includes(key));

  if (invalidKeys.length) {
    res.status(400).send(`${invalidKeys.join(', ')} not in whitelist`);
    return;
  }

  // call the async function via promise
  queryAndParseSettings(req, keyArray)
    .then(results => {
      res.json(results);
    })
    .catch(error => {
      res.status(500).send('Error retrieving settings');
    });
};


// Use the ASYNC middleware for the /settings route
// 200: http://localhost:3000/settings/key2
// 400: http://localhost:3000/settings/boop
// 400 but Vunlerablility Not Found 🤔: http://localhost:3000/settings/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/settings/:keys', getSettings(global_whitelist));

// Use the ASYNC middleware for the /getSettingsNoParam route
// 200: http://localhost:3000/getSettingsNoParam/key2
// 400: http://localhost:3000/getSettingsNoParam/boop
// 400 Vunlerablility Not Found 🤔: http://localhost:3000/getSettingsNoParam/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/getSettingsNoParam/:keys', getSettingsNoParam);

// Use the SYNCRONOUS middleware for the /settingsSync route
// 200: http://localhost:3000/settingsSync/key2
// 400: http://localhost:3000/settingsSync/boop
// 400 Vunlerablility Not Found 🤔: http://localhost:3000/settingsSync/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/settingsSync/:keys', getSettingsSync(global_whitelist));

// Use the SYNCRONOUS middleware for the /settingsSyncNoParam route
// 200: http://localhost:3000/settingsSyncNoParam/key2
// 400: http://localhost:3000/settingsSyncNoParam/boop
// 400 Vunlerablility Not Found 🤔: http://localhost:3000/settingsSyncNoParam/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/settingsSyncNoParam/:keys', getSettingsSyncNoParam);




// OTHER TESTING - Everything was fine
// // Vulnerability: http://localhost:3000/echo/%3Cimg%20src=x%20onerror=alert(origin)%3E
// app.get('/echo/:message', (req, res) => {
//   const { message } = req.params;
//   res.send(message);
// });

// const echo2 = (req, res) => {
//   const { message } = req.params;
//   res.send(message);
// };

// // Vulnerability: http://localhost:3000/echo2/%3Cimg%20src=x%20onerror=alert(origin)%3E
// app.get('/echo2/:message', echo2);


// const echo3 = (req, res) => {
//   const { message } = req.params;

//   const messageArray = typeof message === 'string' ? [message] : message;
//   // use the filter method on a list of defined strings "test" and "test2" to check if the message is in the list, otherwise return the message
//   var notmatch = messageArray.filter((test) => !test.includes("test") && !test.includes("test2") );

//   res.send("notmatch: " + notmatch + " message: " + message);
// };

// // NotVulnerable: http://localhost:3000/echo3/test
// // NotVulnerable: http://localhost:3000/echo3/abcd
// // Vulnerability: http://localhost:3000/echo3/%3Cimg%20src=x%20onerror=alert(origin)%3E
// app.get('/echo3/:message', echo3);

const echo4 = (unusedparam) => (req, res) => {
  const { keys: queryKeys } = req.query;
  const paramKeys = req.params;
  const message = queryKeys || paramKeys?.keys;

  if (!message) {
    res.status(400).send('No keys provided');
    return;
  }

  const messageArray = typeof message === 'string' ? [message] : message;
  // use the filter method on a list of defined strings "test" and "test2" to check if the message is in the list, otherwise return the message
  var notmatch = messageArray.filter((test) => !test.includes("test") && !test.includes("test2") );

  if (notmatch.length) {
    res.send("notmatch: " + notmatch + " message: " + message);
    return;
  }

  res.send("OK! Whitelist:"+unusedparam);
};

const echo4Async = (unusedparam) => async (req, res) => {
  const { keys: queryKeys } = req.query;
  const paramKeys = req.params;
  const message = queryKeys || paramKeys?.keys;

  if (!message) {
    res.status(400).send('No keys provided');
    return;
  }

  const messageArray = typeof message === 'string' ? [message] : message;
  // use the filter method on a list of defined strings "test" and "test2" to check if the message is in the list, otherwise return the message
  // const
  const notmatch = messageArray.filter((test) => !test.includes("test") && !test.includes("test2") );

  if (notmatch.length) {
    return res.status(400).send("notmatch: " + notmatch + " message: " + message);
    //return;
  }

  res.send("OK! Whitelist:"+unusedparam);
};

// OK - in whitelist: http://localhost:3000/echo4/test
// NOT - in whitelist: http://localhost:3000/echo4/abcd
// Vulnerability: http://localhost:3000/echo4/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/echo4/:keys', echo4(global_whitelist));

// OK - in whitelist: http://localhost:3000/echo4Async/test
// NOT - in whitelist: http://localhost:3000/echo4Async/abcd
// Vulnerability: http://localhost:3000/echo4Async/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/echo4Async/:keys', echo4Async(global_whitelist));

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});

module.exports = app;
