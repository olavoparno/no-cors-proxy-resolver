const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");

const myLimit =
  typeof process.argv[2] != "undefined" ? process.argv[2] : "100kb";

const app = express();

app.use(bodyParser.json({ limit: myLimit }));

app.all("*", function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    req.header("access-control-request-headers")
  );

  if (req.method === "OPTIONS") {
    res.send();
  } else {
    const {
      ["target-url"]: targetURL,
      ["redirect-all"]: redirectAll,
      ["Authorization"]: authorization,
      ["accept"]: accept,
      ["content-type"]: contentType,
      ...restHeaders
    } = req.headers;
    let proxyHeaders = {
      authorization,
      accept,
      contentType,
    };
    if (redirectAll) {
      proxyHeaders = { ...proxyHeaders, ...restHeaders };
    }
    if (!targetURL) {
      res.send(500, {
        error: "There is no Target-URL header in the request",
      });
      return;
    }
    request(
      {
        url: targetURL + req.url,
        method: req.method,
        json: req.body,
        headers: proxyHeaders,
      },
      function (error, response) {
        if (error) {
          console.error("error: " + response.statusCode);
        }
      }
    ).pipe(res);
  }
});

app.set("port", process.env.PORT || 8081);

app.listen(app.get("port"), function () {
  console.log("Proxy server listening on port " + app.get("port"));
});
