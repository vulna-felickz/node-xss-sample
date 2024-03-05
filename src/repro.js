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
    res.status(400).send(`${invalidKeys.join(', ')} not in whitelist`);
    return;
  }
  const results = await queryAndParseSettings(req, keyArray);

  res.json(results);
};


// Use the ASYNC middleware for the /settings route
// 200: http://localhost:3000/settings/key2
// 400: http://localhost:3000/settings/boop
// 400 but Vunlerablility Not Found 🤔: http://localhost:3000/settings/%3Cimg%20src=x%20onerror=alert(origin)%3E
app.get('/settings/:keys', getSettings(global_whitelist));


app.listen(3000, function () {
  console.log('App listening on port 3000!');
});

module.exports = app;
