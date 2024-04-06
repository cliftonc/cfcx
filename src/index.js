const { parxer, render } = require('pxr');
const parxerPlugins = require('pxr/Plugins');
const htmlEntities = require('html-entities');

export default {
  async fetch(request, env, ctx) {

    let url = new URL(request.url)    
    if(url.pathname === '/favicon.ico') {
      return new Response('');
    }

    if(url.pathname === '/') {

      function getCxAttr(node, name, defaultAttr) {
        var value = node.attribs[name] || node.attribs['data-' + name];
        if (value) {
          return htmlEntities.decode(value);
        }
        return defaultAttr === undefined ? false : defaultAttr;
      }

      const getCx = (fragment, next) => {
        var cxUrl = getCxAttr(fragment, 'cx-url');
        // Fetch honors cache headers automagically
        fetch(cxUrl, {
          headers: {
            "X-Source": "Cloudflare-Workers",
          },
        }).then((resp) => {        
          resp.text().then((content) => {
            return next(null, content)
          })
        });
      }

      // Config should come via the Backends eventually
      const config = {
        showErrors: true,
        plugins: [
          parxerPlugins.Url(getCx)
        ],
        variables: {
          domain: "www.example.com"
        }
      };

      // Super simple fixed parse
      const parse = () => {
        return new Promise((resolve, reject) => {
          // Content should come via the backend
          let input = `<html>
            <h1>HELLO WORLD!</h1>
            <p>The following come via parsing of "cx-url" attributes dynamically:</p>            
            <div cx-url='https://\${domain}'></div>          
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
    }

    return new Response('');
  },
};
