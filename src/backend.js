import { decode } from 'html-entities';
import interrogator from './helpers/interrogator.js';
import selectBackend from './helpers/selectBackend.js';
import { parxer, render } from 'pxr';
import parxerPlugins from 'pxr/Plugins';
import localConfig from '../config/local.json';
import productionConfig from '../config/production.json';

/**
 * If we have matched a path, go and get the content from the backend
 */
export async function backendRequest(request, env, ctx) {  

  const environment = env.ENVIRONMENT;
  const config = environment === 'production' ? productionConfig : localConfig;
  const Interrogator = interrogator({ config, environment });  
  const Backend = selectBackend(config);

  try {
     
      function getCxAttr(node, name, defaultAttr) {          
        var value = node.attribs[name] || node.attribs['data-' + name];
        if (value) {
          return decode(value);
        }
        return defaultAttr === undefined ? false : defaultAttr;
      }


      const getSlot = (fragment, next) => {
        var slotName = getCxAttr(fragment, 'cx-define-slot');
        var content = templateVars.slots[slotName];
        parxer(getParxerOpts(0), content, function (parxerErr, fragmentCount, newContent) {
          if (parxerErr && parxerErr.content) {
            return next(parxerErr, content);
          }
          return next(null, newContent);
        });
      }

      const getCx = (fragment, next) => {
        var cxUrl = getCxAttr(fragment, 'cx-url');
        // Fetch honors cache headers automagically
        fetch(cxUrl, {
          headers: {
            "X-Source": "Cloudflare-Workers",
          },
        }).then((resp) => {
          if(resp.status != 200) {            
            if(request.backend.quietFailure) {
              return next(null, '');
            } else {
              return next(`Error: ${resp.status}!`)              
            }
          }
          resp.text().then((content) => {
            return next(null, content)
          })
        });
      }

      Interrogator(request);
      config.functions = {selectGoogle: () => {
        // Never select for now
        return;
      }}
      Backend(request); 

      // Now go get the backend content
      let incomingUrl = new URL(request.url);
      const targetUrl = request.backend.target + (request.backend.dontPassUrl ? '' : incomingUrl.pathname);      
      console.log(targetUrl);
      const backendRequest = new Request(targetUrl);
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
            if (err.fragmentErrors) {
              console.log(err)
            }
            return resolve(data);
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