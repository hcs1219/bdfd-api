const express = require('express'),
  app = express(),
  axios = require('axios'),
  fs = require('fs'),
  Log = (req, res) => {
    console.log(`\n\x1b[4m%s\x1b[0m\n\x1b[34m%s\x1b[0m: \x1b[33m${req.method} \x1b[0n\x1b[${res.statusCode < 400?'32':'41'}m%s\x1b[0m`, new Date(), req.headers['x-forwarded-for'] || req.socket.remoteAddress, req.originalUrl);
  };

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  Log(req, res);
});

fs.readdirSync('./highlight').forEach(x => {
  app.get(`/highlight/${x}`, (req,res) => {
    res.sendFile(__dirname + '/highlight' + x);
  });
});

app.get('/api', (req, res) => {
  res.set('Content-Type', 'application/json').send(JSON.stringify({
    "/function": {
      "q": "FUNCTION_TAG",
      "(case_sensitive)": "BOOLEAN"
    },
    "/callback": {
      "q": "CALLBACK_NAME",
      "(case_sensitive)": "BOOLEAN"
    }
  }, null, 2));
  Log(req, res);
});

app.get('/api/:x', (req, res) => {
  let endpoint = req.path.split('/')[2],
    params = req.query;
  if (endpoint == 'function' || endpoint == 'callback') {
    try {
      let arr,
        case_sensitive = params.case_sensitive || 'true';
      if (!params || params.q == '' || params.q == '$') return res.json([]);
      axios.get(`https://botdesignerdiscord.com/public/api/${endpoint}_list`).then(x => {
        if (case_sensitive == 'true') {
          arr = x.data.filter(y => y[endpoint == 'function'?'tag':'name']?.startsWith(params.q));
        } else {
          arr = x.data.filter(y => y[endpoint == 'function'?'tag':'name']?.toLowerCase().startsWith(params.q?.toLowerCase()));
        };
        res.set('Content-Type', 'application/json').send(JSON.stringify(arr, null, 2));
      });
    } catch (err) {
      console.log(err);
    };
  };
  Log(req, res);
});

app.use('/api/discord', (req, res) => {
  try {
    let endpoint = req.path.split('/');
    endpoint.slice(0, 3);
    axios.get(`https://discord.com/api${endpoint.join('/')}`, {
      validateStatus: () => true,
      headers: {
        Authorization: `Bot ${process.env.TOKEN}`
      }
    }).then(x => {
      res.set('Content-Type', 'application/json').send(JSON.stringify(x.data, null, 2));
    });
  } catch (err) {
    console.log(err);
  };
  Log(req, res);
});

let listener = app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server Running on port: ${listener.address().port}`);
});
