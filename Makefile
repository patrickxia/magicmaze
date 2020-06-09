# `make prod` overwrites the current working tree with the "productionified"
# version of the files. Don't include it in 'all'.
all: tiles

.PHONY: tiles prod prodjs

modules/mm-tiles.php: import-csv.php modules/mm-tiles.csv
	php import-csv.php > modules/mm-tiles.php

tiles: modules/mm-tiles.php

prodjs: magicmaze.js
	git diff-index --quiet HEAD # Check to see if we can cleanly checkout
	babel magicmaze.js > a
	mv a magicmaze.js

prod: prodjs
