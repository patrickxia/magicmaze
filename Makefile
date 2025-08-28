# `make prod` overwrites the current working tree with the "productionified"
# version of the files. Don't include it in 'all'.
all: tiles

BABEL ?= babel

.PHONY: tiles prod prodjs

modules/mm-tiles.php: misc/import-csv.php modules/mm-tiles.csv
	php misc/import-csv.php > tmp_csv
	mv tmp_csv modules/mm-tiles.php

tiles: modules/mm-tiles.php

prodjs: magicmaze.js
	git diff-index --quiet HEAD # Check to see if we can cleanly checkout
	$(BABEL) magicmaze.js > a
	mv a magicmaze.js

prod: prodjs
