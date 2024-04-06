const { parxer, render } = require('pxr');
const parxerPlugins = require('pxr/Plugins');
const htmlEntities = require('html-entities');

export default {
  async fetch(request, env, ctx) {

    function getCxAttr(node, name, defaultAttr) {
      var value = node.attribs[name] || node.attribs['data-' + name];
      if (value) {
        return htmlEntities.decode(value);
      }
      return defaultAttr === undefined ? false : defaultAttr;
    }

    const getCx = (fragment, next) => {
      var cxUrl = getCxAttr(fragment, 'cx-url');
      // Here we would actually go and get the content / cache it etc.
      return next(null, cxUrl);
    }

    // Config should come via the Backends
    const config = {
      showErrors: true,
      plugins: [
        parxerPlugins.Url(getCx)
      ]
    };

    // Super simple fixed parse
    const parse = () => {
      return new Promise((resolve, reject) => {
        // Content should come via the backend
        let input = `<html>
          <h1>HELLO WORLD!</h1>
          <p>The following come via parsing of "cx-url" attributes dynamically:</p>
          <div cx-url='https://www.google.com'></div>
          <div cx-url='https://www.infinitaslearning.com'></div>
        </html>`;
        parxer(config, input, function(err, fragmentCount, data) {
          if (err.fragmentErrors) resolve(err)
          else resolve(data);
        })
      })
    }
    let newResp = new Response(await parse(), {
      headers: {
        "Content-Type": "text/html"
      }
    })
    return newResp;
  },
};
