/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
const { parxer, render } = require('pxr');

export default {
	async fetch(request, env, ctx) {
	  const parse = () => {
	  	return new Promise((resolve, reject) => {
		  	let input = "<html><h1>HELLO WORLD!</h1></html>";
		  	parxer({}, input, function(err, fragmentCount, data) {	        			  		
		  	 	if(err.fragmentErrors) resolve(err)
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