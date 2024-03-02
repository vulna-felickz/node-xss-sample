const express = require('express');
const app = express();

// Define your whitelist and queryAndParseAppSettings function
const whitelist = ['key1', 'key2', 'key3'];
const queryAndParseAppSettings = async (req, keys) => {
  // Replace this with your own logic
  return keys.reduce((acc, key) => {
    acc[key] = `value-${key}`;
    return acc;
  }, {});

};


const getApplicationSettings = (whitelist) => async (req, res) => {
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
  const results = await queryAndParseAppSettings(req, keyArray);

  res.json(results);
};


// Use the middleware for the /settings route
// Works: http://localhost:3000/settings/key2
// Fails: http://localhost:3000/settings/boop
// Vunlerablility: http://localhost:3000/settings/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/settings/:keys', getApplicationSettings(whitelist));


app.listen(3000, function () {
  console.log('App listening on port 3000!');
});

module.exports = app;