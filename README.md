# magicmaze

## Building the js for production

I use some things that aren't compatible with all browsers, so you need to `make prodjs`
(in a clean repo; it will try to check) which will format everything with Babel. 

I'm using 6.26.0 as of this writing, but it doesn't matter as long as the polyfills make
it in to the file.

This will _overwrite_ magicmaze.js (which is kind of a bizarre option but I think something
about my sftp setup made this make sense) with the production js. Upload that to the
studio, then `git reset --hard` to get back to "development mode."

Yes, this means you need to make a commit every time you upload to the studio, but that's
good hygiene anyway.

