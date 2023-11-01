const express = require('express'),
  app = express(),
  axios = require('axios'),
  fs = require('fs');

app.get('/', (req, res) => {
  res.set('Content-Type', 'application/json').send(JSON.stringify([
    {
      "github": "https://github.com/hcs1219/bdfd-api",
      "version": "1.0.0",
      "domain": "bdfd.wiki",
      "protocol": "https"
    },
    {
      "/api": {
        "/bdfd": {
          "/function": {
            "q": "FUNCTION_TAG",
            "(case_sensitive)": "BOOLEAN"
          },
          "/callback": {
            "q": "CALLBACK_NAME",
            "(case_sensitive)": "BOOLEAN"
          }
        },
        "/discord": {
          "PATH": "just the same path with discord api",
          "EXAMPLE": "/v10/users/@me"
        }
      }
    }
  ], null, 2));
});

app.get('/api/bdfd/:x', (req, res, next) => {
  let endpoint = req.path.split('/')[3],
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
      res.json({
        "error": err
      });
    };
  } else {
    next();
  };
});

app.use('/api/discord', (req, res) => {
  try {
    let endpoint = req.path.split('/');
    endpoint.slice(0, 3);
    axios.get(`https://discord.com/api${endpoint.join('/')}`, {
      validateStatus: () => true,
      headers: {
        Authorization: `Bot MTE2ODQ2OTMyOTE0MzE1Njc3Nw.GDVwgt.501Ji8EIat_aL9trmGGGOQ4Ew0q8jYELhdx0E` + 'A'
      }
    }).then(x => {
      res.set('Content-Type', 'application/json').send(JSON.stringify(x.data, null, 2));
    });
  } catch (err) {
    res.json({
      "error": err
    });
  };
});

app.listen(process.env.SERVER_PORT);
