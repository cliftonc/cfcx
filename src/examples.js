/**
 * Here we will serve stuff we can use to test / provide examples.
 **/
import { AutoRouter, error, html } from 'itty-router'

let defaultBackend = `
  <html>
    <h1>HELLO WORLD!</h1>
    <p>The following come via parsing of "cx-url" attributes dynamically:</p>            
    <div cx-url='https://www.example.com' cx-timeout='10000'></div>          
  </html>`;

let diffBackend = `
  <html>
    <h1>WHAT WIZZARDRY IS THIS?</h1>    
    <div cx-url='https://www.noordhoff.nl' cx-timeout='10000'></div>          
  </html>`;

const router = AutoRouter({ base: '/example', format: html })
  .get('/', () => '<h1>From here you can see examples!</h1>')
  .get('/backend', () => defaultBackend)
  .get('/backend-diff', () => diffBackend)
  .get('*', () => error(404))

export default { ...router }
