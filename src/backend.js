import { decode } from 'html-entities';
import interrogator from './helpers/interrogator.js';
import selectBackend from './helpers/selectBackend.js';
import config from '../config/default.json';
import { parxer, render } from 'pxr';
import parxerPlugins from 'pxr/Plugins';

const environment = 'test';
const Interrogator = interrogator({ config, environment });
const Backend = selectBackend(config);
        
/**
 * If we have matched a path, go and get the content from the backend
 */
export async function backendRequest(request, env, ctx) {

  try {
      let url = new URL(request.url)    
      if(url.pathname === '/favicon.ico') {
        return new Response('Hello');
      }
      
      function getCxAttr(node, name, defaultAttr) {          
        var value = node.attribs[name] || node.attribs['data-' + name];
        if (value) {
          return decode(value);
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

      Interrogator(request);
      config.functions = {selectGoogle: () => {
        // Never select
        return;
      }}
      Backend(request); 

      console.log(request.backend);

      // Now go get the backend content!
      const backendRequest = new Request(request.backend.target)
      const backendFetch = await fetch(backendRequest);
      const backendContent = await backendFetch.text();

      // Create the parxer config now
      const pxrConfig = {
        showErrors: true,
        plugins: [
          parxerPlugins.Url(getCx)
        ],
        variables: request.templateVars
      };

      // Super simple fixed parse - should make parxer async/await
      const parse = () => {
        return new Promise((resolve, reject) => {            
          parxer(pxrConfig, backendContent, function(err, fragmentCount, data) {
            if (err.fragmentErrors) resolve(err)
            else resolve(data);
          })
        })  
      }

      // now parse
      const parsedContent = await parse();
      let newResp = new Response(parsedContent, {
        headers: {
          "Content-Type": "text/html"
        }
      })        
      return newResp;      

    } catch(ex) {
      console.log(ex)
      return new Response('');
    }
}