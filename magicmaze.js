/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * MagicMaze implementation : © Patrick Xia <patrick.xia@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

// This is written in JavaScript Standard Style.
// (https://standardjs.com)
// If you are seeing semicolons and bizarre loop variables named _loop#,
// this is because you are reading the babelified version of this source code.
// Please refer to the github for the non-transformed version.

// Define the libraries that the BGA framework gives us to begin with
// and the imports.
/* global $, define, ebg, dojo, g_gamethemeurl, getRoles, _ */
'use strict'

const SECS_TO_MILLIS = 1000.0
const MILLIS_TO_SECS = 0.001

const BORDER_WIDTH = 20
const CELL_SIZE = 54
const MEEPLE_SIZE = 30

const VALID_MOVES = 'WNSERPH'

function toScreenCoords (x, y) {
  // Thanks Sarah Howell (soasrsamh@gmail.com) for the
  // lovely math behind this implementation. Note that this only
  // works for the coordinates of the cell in the top left of every
  // tile.

  // 00 10 20 30
  // 01 11 21 31 41 51 61 71
  // 02 12 22 32 42 52 62 72
  // 03 13 23 33 43 53 63 73
  //             44 54 64 74

  const x0 = Math.floor((y + 4 * x) / 17)
  const y0 = Math.floor((x - 4 * y) / 17)

  const left = 2 * BORDER_WIDTH * x0 + x * CELL_SIZE
  const top = -2 * BORDER_WIDTH * y0 + y * CELL_SIZE

  return [left, top]
}

const mageId = 3
function isMage (tokenId) {
  return tokenId === mageId
}

function createTileEl (tileX, tileY, rot, cssClass, parent) {
  const screenCoords = toScreenCoords(tileX, tileY)
  return dojo.create('div', {
    class: cssClass,
    style: {
      position: 'absolute',
      left: (screenCoords[0] - BORDER_WIDTH) + 'px',
      top: (screenCoords[1] - BORDER_WIDTH) + 'px',
      transform: `rotate(${rot}deg)`
    }
  }, parent)
}

function updateTimer (obj, el) {
  if (!obj.deadline) {
    return
  }

  const deadline = SECS_TO_MILLIS * obj.deadline
  const rawLeft = Math.floor(MILLIS_TO_SECS * (deadline - Date.now()))
  if (rawLeft < -10) {
    obj.refreshDeadline()
  }
  const left = Math.max(0, rawLeft)
  const minutes = Math.floor(left / 60)
  let seconds = left % 60
  if (seconds < 10) seconds = '0' + seconds
  el.textContent = minutes + ':' + seconds
}

function dispatchClick (obj, evt, tileId, relativex, relativey, x, y) {
  obj.onCreateTile(tileId, relativex, relativey)
}

function dispatchMove (obj, tokenId, arr) {
  let arg = {}
  let path = ''
  if (tokenId == null) {
    path = 'magicmaze/magicmaze/notify.html'
    arg = {
      player_id: arr[0]
    }
  } else if (tokenId === -1) {
    path = '/magicmaze/magicmaze/attemptWarp.html'
    arg = {
      x: arr[0],
      y: arr[1]
    }
  } else if (arr.length === 3) {
    path = '/magicmaze/magicmaze/attemptMove.html'
    arg = {
      token_id: tokenId,
      x: arr[0],
      y: arr[1],
      keep_moving: arr[2]
    }
  } else {
    if (arr[0] === 0) {
      path = '/magicmaze/magicmaze/attemptExplore.html'
      arg = {
        token_id: tokenId
      }
      // explore
    } else {
      path = '/magicmaze/magicmaze/attemptEscalator.html'
      arg = {
        token_id: tokenId
      }
    }
  }
  obj.ajaxcall(path,
    arg, this, function (result) {}, function (error) { if (error) console.log(error) })
}

function updateWarpHighlight (dojo, obj) {
  const node = dojo.query('.mm_filterwarp')
  // If spectator or we have the warp ability
  if (!(obj.player_id in obj.abilities) || obj.abilities[obj.player_id].indexOf('P') !== -1) {
    node.style('opacity', '0.0')
    node.style('pointer-events', 'auto')
  } else {
    node.style('opacity', '0.3')
    node.style('pointer-events', 'none')
    node.attr('title', '')
  }
}

function setupAbilities (dojo, obj) {
  $('playerlist').innerText = ''
  for (const playerId in obj.players) {
    const player = obj.players[playerId]
    const parentID = `player_board_${playerId}`
    const els = dojo.query(`#${parentID} .mm_abilityblock`)
    if (els.length === 0) {
      const overallID = `overall_player_board_${playerId}`
      dojo.connect($(overallID), 'ondblclick', this, function (evt) {
        dispatchMove(obj, null, [playerId])
      })

      dojo.query(`#${overallID}`).attr('title', _('Double-click to notify'))

      els[0] = dojo.create('div', {
        class: 'mm_abilityblock'
      }, $(parentID))

      const nameEl = $(`player_name_${playerId}`)
      const notifyEl = dojo.create('div', {
        class: 'mm_notify',
        innerHTML: '←🔔'
      }, nameEl)
      dojo.connect(notifyEl, 'onmouseover', this, function (evt) {
        evt.stopPropagation()
      })
      dojo.connect(notifyEl, 'onclick', this, function (evt) {
        dispatchMove(obj, null, [playerId])
      })
    }
    const playerEl = els[0]
    playerEl.innerText = ''
    const backgroundEl = dojo.create('div', {
      class: 'mm_ability'
    }, playerEl)
    const abilities =
          getRoles(
            Object.keys(obj.players).length,
            player.player_no,
            obj.flips)
    obj.abilities[playerId] = abilities
    for (const ability of abilities) {
      dojo.create('div', {
        class: `mm_ability${ability}`
      }, backgroundEl)
    }
    if (parseInt(obj.attention_pawn) === parseInt(playerId)) {
      dojo.create('div', {
        class: 'mm_redpawn'
      }, playerEl)
    }
  }
  const body = document.getElementsByTagName('body')[0]
  for (const c of VALID_MOVES) {
    const node = dojo.query(`.mm_action${c}`)
    if (!(obj.player_id in obj.abilities) || obj.abilities[obj.player_id].indexOf(c) === -1) {
      node.style('visibility', 'hidden')
      dojo.removeClass(body, `mm_can_${c}`)
    } else {
      node.style('visibility', 'visible')
      dojo.addClass(body, `mm_can_${c}`)
    }
  }

  updateWarpHighlight(dojo, obj)
}

function previewNextTile (obj, dojo, info, onlyLocked) {
  const tileId = parseInt(info.tile_id)
  obj.nextTile = tileId
  // TODO Maybe consider disabling this feature. It makes it much easier.
  obj.previewElements.forEach(function (els, tokenId) {
    if (onlyLocked && !obj.locked.has(tokenId)) {
      return
    }
    if (obj.mageStatus !== 0 && !isMage(tokenId)) {
      return
    }
    for (const el of els) {
      if (obj.mageStatus === 0 && 'mm_magepreview' in el) {
        continue
      }
      const newEl = dojo.create('div', {
        class: `tile${tileId}`
      }, el)
      if ('mm_shadeelement' in el) {
        dojo.style(el.mm_shadeelement, 'visibility', 'hidden')
      }
      dojo.style(newEl, 'transform', `rotate(${el.mm_rot}deg)`)
      dojo.style(newEl, 'opacity', '0.6')
      // Float previews above "draw a tile", because "draw a new tile"
      // actually isn't operable. This situation happens if we start an
      // explore action and somebody else moves a meeple that is eligible for
      // explore at the exact same new tile location.
      dojo.style(el, 'z-index', '1')
    }
  })
}

function placeTile (obj, tile) {
  $('mm_next_explore').innerHTML = ''
  delete obj.nextTile
  obj.locked.clear()
  dojo.query('#mm_next_explore_container').style('visibility', 'hidden')
  const x = parseInt(tile.position_x)
  const y = parseInt(tile.position_y)

  const noMoreTiles = (obj.tilesRemain === 0)

  obj.previewElements.forEach(function (els, tokenId, map) {
    for (const el of els) {
      if (noMoreTiles || el.mm_key === getKey(x, y)) {
        dojo.destroy(el)
        map.delete(tokenId)
      } else {
        // Shade / other nonsense will be regenerated
        el.innerHTML = ''
        dojo.style(el, 'z-index', el.mm_zindex)
      }
    }
  })

  createTileEl(x, y, tile.rotation, `tile${tile.tile_id}`, $('mm_area_scrollable'))
  // TODO should this loop even be here? Could possibly place into createTileEl
  // but it might get written to multiple times.
  const screenCoords = toScreenCoords(x, y)
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      const key = getKey(x + i, y + j)
      const cellLeft = screenCoords[0] + i * CELL_SIZE
      const cellTop = screenCoords[1] + j * CELL_SIZE
      obj.tileIds.set(key, tile.tile_id)
      obj.relativexs.set(key, i)
      obj.relativeys.set(key, j)
      obj.lefts.set(key, cellLeft)
      obj.tops.set(key, cellTop)
    }
  }
}

function drawEscalators (obj) {
  obj.escalators.forEach(function (dst, srcKey) {
    if (obj.escalatorEls.has(srcKey)) {
      return
    }
    const src = splitKey(srcKey)
    const xs = [src[0], dst[0]].sort((a, b) => a - b)
    const ys = [src[1], dst[1]].sort((a, b) => a - b)
    const topLeft = getKey(xs[0], ys[0])
    const left = obj.lefts.get(topLeft) + 0.4 * CELL_SIZE
    const top = obj.tops.get(topLeft) + 0.4 * CELL_SIZE

    // srcX is always least, so if dstY is less than srcY it is nesw
    const dir = (dst[1] < src[1]) ? 'nesw' : 'nwse'

    const el = dojo.create('div', {
      class: `mm_escalator mm_escalator_${dir}`,
      style: {
        position: 'absolute',
        width: `${(xs[1] - xs[0]) * 1.25 * CELL_SIZE}px`,
        height: `${(ys[1] - ys[0]) * 1.25 * CELL_SIZE}px`,
        left: `${left}px`,
        top: `${top}px`
      }
    }, $('mm_area_scrollable_oversurface'))
    obj.escalatorEls.set(srcKey, el)
    dojo.connect(el, 'onclick', obj, function (evt) {
      const eligible = new Set()
      obj.characterLocs.forEach(function (loc, tokenId) {
        if ((loc[0] === dst[0] && loc[1] === dst[1]) ||
        (loc[0] === src[0] && loc[1] === src[1])) {
          eligible.add(tokenId)
        }
      })
      if (eligible.size !== 1) {
        return
      }
      dispatchMove(obj, [...eligible][0], [1])
    })
  })
}

function drawProperties (obj, properties) {
  if (properties.warp) {
    for (const warp of properties.warp) {
      const key = getKey(warp.position_x, warp.position_y)
      if (obj.clickableCells.has(key)) continue
      const cellLeft = obj.lefts.get(key)
      const cellTop = obj.tops.get(key)
      const clickableZone = dojo.create('div', {
        class: 'mm_filterwarp',
        style: {
          position: 'absolute',
          width: CELL_SIZE + 'px',
          height: CELL_SIZE + 'px',
          left: cellLeft + 'px',
          top: cellTop + 'px'
        }
      }, $('mm_area_scrollable_oversurface'))
      let timer
      let prevent = false
      let confirmEl
      const warpFn = function (evt) {
        evt.stopPropagation() // Or we get in a state where we regenerate this element
        clearTimeout(timer)
        prevent = true
        if (confirmEl) {
          dojo.destroy(confirmEl)
        }
        dispatchMove(obj, -1, [warp.position_x, warp.position_y])
      }
      clickableZone.onclick = function (evt) {
        timer = setTimeout(function () {
          if (!(obj.player_id in obj.abilities)) {
            return
          }
          if (obj.abilities[obj.player_id].indexOf('P') === -1) {
            return
          }
          if (!prevent) {
            confirmEl = dojo.create('div', {
              class: 'mm_action',
              style: {
                position: 'absolute',
                width: CELL_SIZE + 'px',
                height: CELL_SIZE + 'px',
                left: cellLeft + 'px',
                top: cellTop + 'px',
                'text-align': 'center',
                'line-height': CELL_SIZE + 'px',
                'font-size': '48px'
              },
              innerHTML: '✔'
            }, $('mm_area_scrollable_oversurface'))
            setTimeout(function () {
              if (confirmEl) {
                dojo.destroy(confirmEl)
              }
            }, 4000)
            dojo.connect(confirmEl, 'onclick', obj, warpFn)
          }
          prevent = false
        }, 250)
      }
      clickableZone.ondblclick = warpFn
      obj.clickableCells.set(key, clickableZone)
    }
  }
  updateWarpHighlight(dojo, obj)

  if (properties.used) {
    for (const used of properties.used) {
      drawUsed(obj, used.position_x, used.position_y)
    }
  }
  if (properties.explore) {
    for (const explore of properties.explore) {
      const key = getKey(explore.position_x, explore.position_y)
      const tokenId = parseInt(explore.token_id)
      const cellLeft = obj.lefts.get(key)
      const cellTop = obj.tops.get(key)
      if (obj.clickableCells.has(key)) continue
      const el = dojo.create('div', {
        style: {
          position: 'absolute',
          width: CELL_SIZE + 'px',
          height: CELL_SIZE + 'px',
          left: cellLeft + 'px',
          top: cellTop + 'px',
          'z-index': 0
        }
      }, $('mm_area_scrollable_oversurface'))

      el.onclick = function (evt) {
        dispatchClick(obj, evt, obj.tileIds.get(key),
          obj.relativexs.get(key), obj.relativeys.get(key), false, false)
      }
      obj.clickableCells.set(key, el)
      obj.explores.set(key, tokenId)
    }
  }
  if (properties.crystal) {
    for (const crystal of properties.crystal) {
      obj.crystals.add(getKey(crystal.position_x, crystal.position_y))
    }
  }
  if (properties.escalator) {
    for (const escalator of properties.escalator) {
      // Canonical element is the one with the lower x
      const oldX = parseInt(escalator.old_x, 10)
      const oldY = parseInt(escalator.old_y, 10)
      const newX = parseInt(escalator.new_x, 10)
      const newY = parseInt(escalator.new_y, 10)

      // Why not just sort? Because < works terribly on arrays.
      let srcX, srcY, dstX, dstY
      if (oldX < newX) {
        srcX = oldX
        srcY = oldY
        dstX = newX
        dstY = newY
      } else {
        srcX = newX
        srcY = newY
        dstX = oldX
        dstY = oldY
      }

      obj.escalators.set(getKey(srcX, srcY), [dstX, dstY])
    }
    drawEscalators(obj)
  }
}

function drawUsed (obj, x, y) {
  const key = getKey(x, y)
  obj.crystals.delete(key)
  const cellLeft = obj.lefts.get(key)
  const cellTop = obj.tops.get(key)
  dojo.create('div', {
    class: 'mm_used',
    style: {
      left: cellLeft + 'px',
      top: cellTop + 'px'
    }
  }, $('mm_area_scrollable'))
}

function getKey (x, y) {
  return `${x}_${y}`
}

function splitKey (x) {
  return x.split('_', 2).map(function (x) { return parseInt(x, 10) })
}

function toZoomLevel (ratio) {
  return Math.log(ratio) / Math.log(1.1)
}

function toZoomRatio (level) {
  return Math.pow(1.1, level)
}

function clampLevel (level) {
  // 4 is roughly 2x, -14 is roughly 25%
  return Math.min(4, Math.max(-14, level))
}

// NB this map looks different than the PHP one because the PHP one maps tile -> tile
// whereas we're mapping meeple_loc -> new_tile_loc
function computeNewTileLoc (obj, exploreX, exploreY) {
  const key = getKey(exploreX, exploreY)
  const newTileLoc = new Map([
    ['2_0', [-1, -4]],
    ['3_2', [1, -1]],
    ['1_3', [-2, 1]],
    ['0_1', [-4, -2]]
  ])
  const newTileRot = new Map([
    ['2_0', 0],
    ['3_2', 90],
    ['1_3', 180],
    ['0_1', -90]
  ])
  const relativeloc = getKey(obj.relativexs.get(key), obj.relativeys.get(key))
  const dx = newTileLoc.get(relativeloc)
  if (dx === undefined) {
    throw new Error(`internal error: explore on unexpected space ${relativeloc}`)
  }
  const newx = exploreX + dx[0]
  const newy = exploreY + dx[1]
  if (obj.tileIds.has(getKey(newx, newy))) {
    return [false, 0, 0, 0]
  }
  const rot = newTileRot.get(relativeloc)
  if (rot === undefined) {
    throw new Error(`internal error: explore on unexpected space ${relativeloc}`)
  }
  return [true, newx, newy, rot]
}

function destroyPreviews (obj, tokenId) {
  if (obj.previewElements.has(tokenId)) {
    // If two meeples can explore in the same location, we'll just
    // overlap two divs and only one will be deleted.
    for (const el of obj.previewElements.get(tokenId)) {
      dojo.destroy(el)
    }
    obj.previewElements.delete(tokenId)
  }
}

function drawMagePreviews (obj) {
  if (obj.tilesRemain === 0) {
    return
  }
  obj.previewElements.set(mageId, [])
  for (const key of obj.explores.keys()) {
    const [exploreX, exploreY] = splitKey(key)
    const [ok, newX, newY, rot] = computeNewTileLoc(obj, exploreX, exploreY)
    if (!ok) continue
    // TODO perhaps "mage preview tile" css class
    const el = createTileEl(newX, newY, 0, 'mm_preview_tile', $('mm_area_scrollable_oversurface'))
    el.mm_key = key
    el.mm_rot = rot
    el.mm_magepreview = true

    dojo.create('div', {
      class: 'mm_shade_preview'
    }, el)

    const srcTileID = obj.tileIds.get(key)
    const newRelativeX = obj.relativexs.get(key)
    const newRelativeY = obj.relativeys.get(key)
    dojo.connect(el, 'onclick', el, function (evt) {
      if (obj.mageStatus !== 0) {
        obj.onCreateTile(srcTileID, newRelativeX, newRelativeY)
      } else {
        dispatchMove(obj, mageId, [0])
      }
    })
    // Lower the priority of mage explores. We want regular explores to be used
    // before mage explores when clicking on the map. Note that there could exist
    // regular explore / regular explore conflicts as well; those are resolved
    // arbitrarily.
    dojo.style(el, 'z-index', '-1')
    obj.mm_zindex = -1
    obj.previewElements.get(mageId).push(el)
  }
}

function placeCharacter (obj, info) {
  const x = parseInt(info.position_x)
  const y = parseInt(info.position_y)
  const tokenId = parseInt(info.token_id)
  obj.characterLocs.set(tokenId, [x, y])
  const key = getKey(x, y)
  const top = obj.tops.get(key)
  const left = obj.lefts.get(key)
  const adjust = (CELL_SIZE - MEEPLE_SIZE) / 2
  obj.rescale(1.0)
  obj.slideToObjectPos(`mm_token${info.token_id}`,
    'mm_area_scrollable_oversurface',
    left + adjust,
    top + adjust,
    /* duration */ 200).play()
  obj.rescale()
  destroyPreviews(obj, tokenId)

  if (obj.tilesRemain === 0) {
    return
  }
  if (isMage(tokenId) && obj.crystals.has(key)) {
    obj.drawingMagePreviews = true
    drawMagePreviews(obj)
    return
  }
  if (isMage(tokenId)) {
    obj.drawingMagePreviews = false
  }
  if (obj.explores.get(key) === tokenId) {
    const [ok, newX, newY, rot] = computeNewTileLoc(obj, x, y)
    if (!ok) return
    const el = createTileEl(newX, newY, 0, 'mm_preview_tile', $('mm_area_scrollable_oversurface'))
    el.mm_key = getKey(newX, newY)
    el.mm_rot = rot
    obj.mm_zindex = 0
    dojo.connect(el, 'onclick', obj, function (evt) {
      dispatchMove(obj, tokenId, [0])
    })
    obj.previewElements.set(tokenId, [el])
  }
}

function fromEntries (iterable) {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val
    return obj
  }, {})
}

function filterZombies (obj) {
  return fromEntries(Object.entries(obj).filter(function (pair) { return !pair[1].player_zombie }))
}

define([
  'dojo', 'dojo/_base/declare',
  'ebg/core/gamegui',
  'ebg/counter',
  'ebg/scrollmap',
  g_gamethemeurl + 'modules/mm-playerability.js' // eslint-disable-line camelcase
],
function (dojo, declare) {
  return declare('bgagame.magicmaze', ebg.core.gamegui, {
    constructor: function () {
      this.lefts = new Map()
      this.tops = new Map()
      this.tileIds = new Map()
      this.relativexs = new Map()
      this.relativeys = new Map()
      this.crystals = new Set()
      this.explores = new Map()
      this.escalators = new Map()
      this.escalatorEls = new Map()
      this.previewElements = new Map() // coord key -> dom element
      this.clickableCells = new Map()
      this.visualCells = new Map()
      this.scrollmap = new ebg.scrollmap() // eslint-disable-line new-cap
      this.locked = new Set()
      this.characterLocs = new Map()
      this.displayedSteal = false
      this.displayedEscape = false
      this.lastRefreshDeadline = 0
      this.zoomLevel = 0
      this.drawingMagePreviews = false
    },

    setup: function (gamedatas) {
      const game = this

      this.abilities = []
      this.players = filterZombies(gamedatas.players)
      // Setting up player boards
      if (gamedatas.attention_pawn) {
        this.attention_pawn = parseInt(gamedatas.attention_pawn)
      }
      if (parseInt(this.player_id) === this.attention_pawn) {
        dojo.query('#mm_border').style('visibility', 'visible')
      }

      this.flips = gamedatas.flips
      this.tilesRemain = parseInt(gamedatas.tiles_remain, 10)

      if (gamedatas.time_left) {
        this.deadline = (Date.now() / 1000.0) + parseFloat(gamedatas.time_left)
        setTimeout(() => game.refreshDeadline(), 3000)
      }

      this.scrollmap.create(
        $('mm_area_container'),
        $('mm_area_scrollable'),
        $('mm_area_surface'),
        $('mm_area_scrollable_oversurface')
      )
      this.scrollmap.setupOnScreenArrows(150)
      for (const key in gamedatas.tiles) {
        placeTile(this, gamedatas.tiles[key])
      }

      drawProperties(this, gamedatas.properties)
      for (const key in gamedatas.tokens) {
        placeCharacter(this, gamedatas.tokens[key])
        const tokenId = gamedatas.tokens[key].token_id
        if (gamedatas.tokens[key].locked === '1') {
          this.locked.add(parseInt(tokenId, 10))
        }
        const base = `#mm_control${tokenId} `
        dojo.connect(document.querySelector(base + '> .mm_actionN'), 'onclick', this, function (evt) {
          // up
          dispatchMove(this, tokenId, [0, -1, evt.shiftKey])
        })
        dojo.connect(document.querySelector(base + '> .mm_actionW'), 'onclick', this, function (evt) {
          // left
          dispatchMove(this, tokenId, [-1, 0, evt.shiftKey])
        })
        dojo.connect(document.querySelector(base + '> .mm_actionE'), 'onclick', this, function (evt) {
          // right
          dispatchMove(this, tokenId, [1, 0, evt.shiftKey])
        })
        dojo.connect(document.querySelector(base + '> .mm_actionS'), 'onclick', this, function (evt) {
          // down
          dispatchMove(this, tokenId, [0, 1, evt.shiftKey])
        })
        dojo.connect(document.querySelector(base + '> .mm_actionH'), 'onclick', this, function (evt) {
          // explore
          dispatchMove(this, tokenId, [0])
        })
        dojo.connect(document.querySelector(base + '> .mm_actionR'), 'onclick', this, function (evt) {
          // escalator
          dispatchMove(this, tokenId, [1])
        })
        dojo.connect(document.querySelector(base + '> .mm_actionP'), 'onclick', this, function (evt) {
          const el = dojo.query('.mm_filterwarp')
          el.style('animation', 'none')
          setTimeout(function () {
            el.style('animation', 'mm_inverseblink 0.3s')
            el.style('animation-iteration-count', 2)
          }, 0)
        })

        const base2 = `#mm_token${tokenId}`

        dojo.connect(document.querySelector(base2 + '> .mm_actionN'), 'onclick', this, function (evt) {
          // up
          dispatchMove(this, tokenId, [0, -1, evt.shiftKey])
        })
        dojo.connect(document.querySelector(base2 + '> .mm_actionW'), 'onclick', this, function (evt) {
          // left
          dispatchMove(this, tokenId, [-1, 0, evt.shiftKey])
        })
        dojo.connect(document.querySelector(base2 + '> .mm_actionE'), 'onclick', this, function (evt) {
          // up
          dispatchMove(this, tokenId, [1, 0, evt.shiftKey])
        })
        dojo.connect(document.querySelector(base2 + '> .mm_actionS'), 'onclick', this, function (evt) {
          // down
          dispatchMove(this, tokenId, [0, 1, evt.shiftKey])
        })
      }
      dojo.connect($('mm_movetop'), 'onclick', this, 'onMoveTop')
      dojo.connect($('mm_moveleft'), 'onclick', this, 'onMoveLeft')
      dojo.connect($('mm_moveright'), 'onclick', this, 'onMoveRight')
      dojo.connect($('mm_movedown'), 'onclick', this, 'onMoveDown')
      dojo.connect($('mm_area_container'), 'onwheel', this, 'onWheel')
      dojo.connect($('mm_zoom_in'), 'onclick', this, 'onZoomIn')
      dojo.connect($('mm_zoom_reset'), 'onclick', this, 'onZoomReset')
      dojo.connect($('mm_zoom_out'), 'onclick', this, 'onZoomOut')
      dojo.connect($('mm_zoom_fit'), 'onclick', this, 'onZoomFit')

      const objEl = dojo.query('#mm_objectives_container')
      dojo.connect($('mm_objectives_container'), 'onclick', this, function (evt) {
        objEl.style('visibility', 'hidden')
      })

      this.mageStatus = parseInt(gamedatas.mage_status, 10)
      // Needs to be after placeCharacter
      if (gamedatas.next_tile) {
        previewNextTile(this, dojo, gamedatas.next_tile, /* onlyLocked= */true)
      }

      // This needs to access some properties created earlier, do this as late as possible.
      setupAbilities(dojo, this)
      // Setup game notifications to handle (see "setupNotifications" method below)
      this.setupNotifications()

      window.setInterval(function () { updateTimer(game, $('mm_timer_numbers')) }, 500)
    },

    onMoveTop: function (evt) {
      evt.preventDefault()
      this.scrollmap.scroll(0, 300)
    },
    onMoveLeft: function (evt) {
      evt.preventDefault()
      this.scrollmap.scroll(300, 0)
    },
    onMoveRight: function (evt) {
      evt.preventDefault()
      this.scrollmap.scroll(-300, 0)
    },
    onMoveDown: function (evt) {
      evt.preventDefault()
      this.scrollmap.scroll(0, -300)
    },
    onWheel: function (evt) {
      if (evt.ctrlKey) {
        // either a pinch event or a whole-page zoom event (hitting the ctrl key while scrolling)
        // either way, ignore it
        return
      }
      if (evt.wheelDeltaY) {
        if (Math.abs(evt.wheelDeltaY) !== 120) {
          // mouse wheels have exactly 120 for delta, everything else
          // does not. TODO: replace this with debounce for trackpad
          return
        }
      } else {
        // firefox: doesn't set wheelDeltaY, but does set the deltaMode to 1
        if (evt.deltaMode === 0) {
          return
        }
      }
      if (evt.deltaY < 0) {
        this.onZoomIn(evt)
      } else {
        this.onZoomOut(evt)
      }
    },
    onZoomIn: function (evt) {
      evt.preventDefault()
      this.zoomLevel += 1
      this.zoomLevel = clampLevel(this.zoomLevel)
      this.rescale()
    },
    onZoomOut: function (evt) {
      evt.preventDefault()
      this.zoomLevel -= 1
      this.zoomLevel = clampLevel(this.zoomLevel)
      this.rescale()
    },
    onZoomFit: function (evt) {
      const containerStyle = dojo.getComputedStyle(dojo.byId('mm_area_container'))
      const viewWidth = parseInt(containerStyle.width, 10)
      const viewHeight = parseInt(containerStyle.height, 10)
      let minX, minY, maxX, maxY
      dojo.query('#mm_area_scrollable > div').forEach(function (el) {
        if (!el.className.startsWith('tile')) {
          return
        }
        const x = parseInt(dojo.getStyle(el, 'left'), 10)
        const y = parseInt(dojo.getStyle(el, 'top'), 10)
        const height = parseInt(dojo.getStyle(el, 'height'), 10)
        const width = parseInt(dojo.getStyle(el, 'width'), 10)
        if (minX === undefined || x < minX) {
          minX = x
        }
        if (maxX === undefined || (x + width) > maxX) {
          maxX = x + width
        }
        if (minY === undefined || y < minY) {
          minY = y
        }
        if (maxY === undefined || (y + height) > maxY) {
          maxY = y + height
        }
      })
      const widthRequired = maxX - minX
      const heightRequired = maxY - minY
      const ratio = Math.min(viewWidth / widthRequired, viewHeight / heightRequired)
      const centerX = (maxX + minX) * 0.5
      const centerY = (minY + maxY) * 0.5
      const debugString = `${minX} ${minY} ${maxX} ${maxY} ${viewWidth} ${viewHeight}`
      if (isNaN(ratio)) {
        throw new Error(`error determining view ratio; ${debugString}`)
      }
      // Don't allow zoom in as part of this operation
      this.zoomLevel = Math.min(0, clampLevel(toZoomLevel(ratio)))
      this.rescale()

      // Center the view
      if (isNaN(centerX) || isNaN(centerY)) {
        throw new Error(`could not determine center; ${debugString}`)
      }

      const newRatio = toZoomRatio(this.zoomLevel)
      const newX = -(centerX * newRatio - viewWidth * 0.5)
      const newY = -(centerY * newRatio - viewHeight * 0.5)

      for (const element of ['mm_area_scrollable', 'mm_area_scrollable_oversurface']) {
        dojo.query('#' + element).style('left', `${newX}px`)
        dojo.query('#' + element).style('top', `${newY}px`)
      }
    },
    onZoomReset: function (evt) {
      evt.preventDefault()
      this.zoomLevel = 0
      this.rescale()
    },
    rescale: function (zoomRatio) {
      if (zoomRatio === undefined) {
        zoomRatio = toZoomRatio(this.zoomLevel)
      }
      // You need to set these individually. If these divs are in a div that sets a transform, the mouse
      // coordinates are all screwy and it will break click+drag.
      for (const element of ['mm_area_scrollable', 'mm_area_scrollable_oversurface']) {
        dojo.query('#' + element).style('transform', 'scale(' + zoomRatio + ')')
      }
    },
    /// ////////////////////////////////////////////////
    /// / Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    //

    onEnteringState: function (stateName, args) {
      const el = dojo.query('#mm_objectives_container')
      switch (stateName) {
        case 'steal_loud':
        case 'steal_quiet':
          if (!this.displayedSteal) {
            this.displayedSteal = true
            el.style('visibility', 'visible')
            setTimeout(function () {
              el.style('visibility', 'hidden')
            }, 4500)
          }
          break
        case 'escape_loud':
        case 'escape_quiet':
          if (!this.displayedEscape) {
            this.displayedEscape = true
            el.style('visibility', 'visible')
            el.style('transform', 'rotateY(180deg)')
            setTimeout(function () {
              el.style('visibility', 'hidden')
            }, 4500)
            dojo.query('.mm_abilityP').forEach(function (node, index, arr) {
              node.innerText = ''
              dojo.create('div', {
                class: 'mm_crossout'
              }, node)
            }
            )
          }
      }
      const bEl = dojo.query('#mm_talk_border')
      if (stateName.includes('loud')) {
        bEl.style('visibility', 'visible')
      } else {
        bEl.style('visibility', 'hidden')
      }
    },

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState: function (stateName) {
      switch (stateName) {
        case 'dummmy':
          break
      }
    },

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons: function (stateName, args) {},

    /// ////////////////////////////////////////////////
    /// / Player's action

    onCreateTile: function (tileID, x, y) {
      // TODO checkAction
      this.ajaxcall('/magicmaze/magicmaze/placeTile.html',
        {
          tile_id: tileID,
          x: x,
          y: y,
          lock: true
        }, this, function (result) {
        }, function (error) { if (error) { console.log(error) } })
    },

    refreshDeadline: function () {
      // Stop refreshing after we've lost.
      if (this.tableresults !== undefined) {
        return
      }
      // Don't hammer the server if somehow the response is slow.
      if (Date.now() / 1000.0 - this.lastRefreshDeadline > 3) {
        this.lastRefreshDeadline = Date.now() / 1000.0
        this.ajaxcall('/magicmaze/magicmaze/refreshDeadline.html', {}, this, function () {}, function () {})
      }
    },

    /// ////////////////////////////////////////////////
    /// / Reaction to cometD notifications

    notif_tileAdded: function (notif) {
      this.tilesRemain = parseInt(notif.args.tiles_remain, 10)
      this.mageStatus = parseInt(notif.args.mage_status, 10)
      placeTile(this, notif.args)
      drawProperties(this, notif.args.clickables)
      if (this.drawingMagePreviews) {
        destroyPreviews(this, mageId)
        drawMagePreviews(this)
      }
    },
    notif_tokenMoved: function (notif) {
      placeCharacter(this, notif.args)
    },
    notif_nextTile: function (notif) {
      this.mageStatus = parseInt(notif.args.mage_status, 10)
      previewNextTile(this, dojo, notif.args, /* onlyLocked= */false)
    },
    notif_newDeadline: function (notif) {
      if (notif.args.time_left) {
        this.deadline = (Date.now() / 1000.0) + parseFloat(notif.args.time_left)
      }
      if (notif.args.flips) {
        this.flips = notif.args.flips
        setupAbilities(dojo, this)
      }
    },
    notif_newZombie: function (notif) {
      this.players = filterZombies(notif.args.players)
      setupAbilities(dojo, this)
    },
    notif_newUsed: function (notif) {
      drawUsed(this, notif.args.x, notif.args.y)
      if (isMage(parseInt(notif.args.token_id, 10))) {
        this.drawingMagePreviews = false
      }
    },
    notif_attention: function (notif) {
      this.attention_pawn = notif.args.player_id
      setupAbilities(dojo, this)
      const el = dojo.query('#mm_border')
      if (parseInt(notif.args.player_id) === parseInt(this.player_id)) {
        el.style('animation', 'none')
        setTimeout(function () {
          el.style('visibility', 'visible')
          el.style('animation', 'mm_blink 0.3s')
          el.style('animation-iteration-count', 10)
        }, 0)
      } else {
        el.style('visibility', 'hidden')
      }
    },
    setupNotifications: function () {
      dojo.subscribe('tileAdded', this, 'notif_tileAdded')
      dojo.subscribe('tokenMoved', this, 'notif_tokenMoved')
      dojo.subscribe('nextTile', this, 'notif_nextTile')
      dojo.subscribe('newDeadline', this, 'notif_newDeadline')
      dojo.subscribe('newZombie', this, 'notif_newZombie')
      dojo.subscribe('newUsed', this, 'notif_newUsed')
      dojo.subscribe('attention', this, 'notif_attention')
    }
  })
})
