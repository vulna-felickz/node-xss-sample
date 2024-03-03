const express = require('express');
const app = express();

// Define your whitelist and queryAndParseAppSettings function
const whitelist = ['key1', 'key2', 'key3'];
const queryAndParseSettings = async (req, keys) => {
  // // Replace this with your own logic, this is vulnerable to Remote property injection but should be gaurded by the whitelist check.
  // return keys.reduce((acc, key) => {
  //   acc[key] = `value-${key}`;
  //   return acc;
  // }, {});
  return "doesnt matter";
};


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
    res.status(400).send(`${invalidKeys.join(', ')} not in whitelist`);
    return;
  }
  const results = await queryAndParseSettings(req, keyArray);

  res.json(results);
};


// Use the middleware for the /settings route
// Works: http://localhost:3000/settings/key2
// Fails: http://localhost:3000/settings/boop
// Vunlerablility Not Found 🤔: http://localhost:3000/settings/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/settings/:keys', getSettings(whitelist));

// Vulnerable: http://localhost:3000/echo/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/echo/:message', (req, res) => {
  const { message } = req.params;
  res.send(message);
});

const echo2 = (req, res) => {
  const { message } = req.params;
  res.send(message);
};

// Vulnerable: http://localhost:3000/echo2/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/echo2/:message', echo2);


const echo3 = (req, res) => {
  const { message } = req.params;

  const messageArray = typeof message === 'string' ? [message] : message;
  // use the filter method on a list of defined strings "test" and "test2" to check if the message is in the list, otherwise return the message
  var notmatch = messageArray.filter((test) => !test.includes("test") && !test.includes("test2") );

  res.send("notmatch: " + notmatch + " message: " + message);
};

// NotVulnerable: http://localhost:3000/echo3/test
// NotVulnerable: http://localhost:3000/echo3/abcd
// Vulnerable: http://localhost:3000/echo3/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/echo3/:message', echo3);

const echo4 = (req, res) => {
  const { keys: queryKeys } = req.query;
  const paramKeys = req.params;
  const message = queryKeys || paramKeys?.keys;

  const messageArray = typeof message === 'string' ? [message] : message;
  // use the filter method on a list of defined strings "test" and "test2" to check if the message is in the list, otherwise return the message
  var notmatch = messageArray.filter((test) => !test.includes("test") && !test.includes("test2") );

  res.send("notmatch: " + notmatch + " message: " + message);
};

// NotVulnerable: http://localhost:3000/echo4/test
// NotVulnerable: http://localhost:3000/echo4/abcd
// Vulnerable: http://localhost:3000/echo4/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/echo4/:keys', echo4);

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});

module.exports = app;
