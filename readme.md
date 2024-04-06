# Cloudflare compoxure worker

Experimenting to see if I can run some parts (or all) of compoxure as a cloudflare worker, but replacing redis with the CF cache.

Deployed here:  https://cx.clifton-a1f.workers.dev/

Notes:
- Can't use hogan / templates as CF does not allow dynamic functions to be created.
	- Need a solution (regex?) e.g. `let inject = (str, obj) => str.replace(/\${(.*?)}/g, (x,g)=> obj[g]);`
- Its all callback based :| 
