import { describe, it, expect } from "vitest";
import interrogator from '../src/helpers/interrogator.js';
import config from '../config/default.json';

describe("Interrogator", () => {  
  it("can initiate it", async () => {  
  	const environment = 'test';  	
  	const Interrogator = interrogator({ config, environment });
  	const request = new Request("http://localhost:8787/google?param=test&search=false",
      {
       headers: {
        "x-test": "awesome"
       } 
      });
  	const data = Interrogator(request);    
  	expect(data["param:param"]).toEqual("test")
    expect(data["header:x-test"]).toEqual("awesome")
    expect(data["env:name"]).toEqual("test")
   });
});