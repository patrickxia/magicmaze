# `make prod` overwrites the current working tree with the "productionified"
# version of the files. Don't include it in 'all'.
all: tiles

BABEL ?= babel
# cwebp 1.6.0 for reproducibility; binaries at
# https://storage.googleapis.com/downloads.webmproject.org/releases/webp/index.html
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

# By default, boardgamearena uses lossy (!) webp compression, which causes
# noticeable artifacting on the sprites and the tiles. Generate webp files
# for them so that this doesn't happen to us.
img/%.png.webp: img/%.png
	$(CWEBP) $< -lossless -m 6 -q 100 -o $@

prodimg: img/dirs.png.webp img/objectives.png.webp img/sprites.png.webp img/t.png.webp

prod: prodjs prodimg
