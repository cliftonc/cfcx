import _ from 'lodash';

export default function interrogator({ config, cdn, environment }) {

  config = config || {
      urls: [
        { pattern: '.*', names: [] }
      ], servers: {}
    };

  if (config.urls) {
    config.urls = config.urls.map(function (url) {
      url.regexp = new RegExp(url.pattern);
      return url;
    });
  }

  environment = { name: environment || process.env.NODE_ENV || 'development' };

  function flatten(variables, type, key, value) {
    variables[type + ':' + key] = value;
    variables[type + ':' + key + ':encoded'] = encodeURIComponent(value);
  }

  function interrogatePath(path) {
    var matches = _.map(config.urls, function (url) {
      var match = url.regexp.exec(path);
      if (!match) { return {}; }
      return _.zipObject(url.names, _.tail(match, 1));
    });

    var parameters = {};
    _.forEach(matches, function (match) {
      _.forEach(match, function (value, key) {
        parameters[key] = value;
      });
    });

    return parameters;
  }

  const interrogateRequest = function (req) {
    var parsedUrl = new URL(req.url);
    var templateParams = interrogatePath(parsedUrl.pathname);
    var queryParams = parsedUrl.searchParams;
    
    let params = {}
    for (const key of parsedUrl.searchParams.keys()) {
      if (typeof req.headers.get(key) != "function") {
        params[key] = parsedUrl.searchParams.get(key);
      }
    }

    let headers = {}
    for (const key of req.headers.keys()) {
      if (typeof req.headers.get(key) != "function") {
        headers[key] = req.headers.get(key);
      }
    }    
    
    var requestVariables = {};
    var requestConfig = {
      param: _.assignIn(params, templateParams),
      url: parsedUrl,
      query: parsedUrl.query,
      cookie: req.cookies,
      header: headers,
      server: config.servers,
      env: environment
    };

    _.forIn(requestConfig, function (values, type) {
      _.forIn(values, function (value, key) {
        flatten(requestVariables, type, key, value);
      });
    });

    req.templateVars = requestVariables;

    return requestVariables
  };

  return interrogateRequest;

};
