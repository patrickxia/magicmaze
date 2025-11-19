# `make prod` overwrites the current working tree with the "productionified"
# version of the files. Don't include it in 'all'.
all: tiles

BABEL ?= babel
CWEBP ?= cwebp

.PHONY: tiles prod prodjs

modules/mm-tiles.php: misc/import-csv.php modules/mm-tiles.csv
	php misc/import-csv.php > tmp_csv
	mv tmp_csv modules/mm-tiles.php

tiles: modules/mm-tiles.php

prodjs: magicmaze.js
	git diff-index --quiet HEAD # Check to see if we can cleanly checkout
	$(BABEL) magicmaze.js > a
	mv a magicmaze.js

prodimg: img/dirs.png img/objectives.png img/sprites.png img/t.png
	$(CWEBP) img/dirs.png -lossless -m 6 -q 100 -o img/dirs.png.webp
	$(CWEBP) img/objectives.png -lossless -m 6 -q 100 -o img/objectives.png.webp
	$(CWEBP) img/sprites.png -lossless -m 6 -q 100 -o img/sprites.png.webp
	$(CWEBP) img/t.png -lossless -m 6 -q 100 -o img/t.png.webp

prod: prodjs
