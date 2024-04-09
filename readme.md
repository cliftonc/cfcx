# Cloudflare compoxure worker

Experimenting to see if I can run some parts (or all) of compoxure as a cloudflare worker, but replacing redis with the CF cache and removing a lot of things.

Deployed here:  https://cx-production.clifton-a1f.workers.dev/

Notes:
- IT WORKS!
- Added a test app as workers cant call themselves easily: https://cfcx-pages.pages.dev/
- Its all callback based, really needs to be modernised.
- `cx-url` works, but I need to reimplement:
	- [ ] error handling
	- [ ] caching
	- [ ] pass through logic
- `cx-if`, `cx-test` work
- `cx-slots` needs to be reimplemented
- Won't re-implement all the bundle and asset mgmt connected to Bosco.
- figure out how to test performance
- Given worker services (where workers can call each other by RPC), this could be a good way to do composition ... e.g `cx-worker="WORKER.path"`