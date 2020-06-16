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

// Define the libraries that the BGA framework gives us to begin with
// and the imports.
/* global $, define, ebg, dojo, g_gamethemeurl, getRoles, _ */

const SECS_TO_MILLIS = 1000.0
const MILLIS_TO_SECS = 0.001

const BORDER_WIDTH = 20
const CELL_SIZE = 54
const MEEPLE_SIZE = 30

const VALID_MOVES = 'WNSERPH'

function toScreenCoords (x, y) {
  // Thanks Sarah Howell (soasrsamh@gmail.com) for the
  // lovely math behind this implementation. Note that this only
  // works for each start tile.

  // 00 10 20 30
  // 01 11 21 31 41 51 61 71
  // 02 12 22 32 42 52 62 72
  // 03 13 23 33 43 53 63 73
  //             44 54 64 74

  var x0 = Math.floor((y + 4 * x) / 17)
  var y0 = Math.floor((x - 4 * y) / 17)

  var left = 2 * BORDER_WIDTH * x0 + x * CELL_SIZE
  var top = -2 * BORDER_WIDTH * y0 + y * CELL_SIZE

  return [left, top]
}

function updateTimer (obj, el) {
  if (!obj.deadline) {
    return
  }

  const serverDeadline = $('reflexiontime_value').innerText
  if (serverDeadline.length > 0) {
    el.textContent = serverDeadline
    return
  }

  // In single-player mode we can't just crib off of the UI.
  const deadline = SECS_TO_MILLIS * obj.deadline
  const left = Math.max(0, Math.floor(MILLIS_TO_SECS * (deadline - Date.now())))
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
  } else if (arr.length === 2) {
    path = '/magicmaze/magicmaze/attemptMove.html'
    arg = {
      token_id: tokenId,
      x: arr[0],
      y: arr[1]
    }
  } else {
    if (arr[0] === 0) {
      path = '/magicmaze/magicmaze/attemptExplore.html'
      arg = {
        token_id: tokenId
      }
      // explore
    } else {
      // warp
      path = '/magicmaze/magicmaze/attemptEscalator.html'
      arg = {
        token_id: tokenId
      }
    }
  }
  obj.ajaxcall(path,
    arg, this, function (result) {
      console.log(result)
    }, function (error) { console.log(error) })
}

function updateWarpHighlight (dojo, obj) {
  const node = dojo.query('.mm_filterwarp')
  // If spectator or we have the warp ability
  if (!(obj.player_id in obj.abilities) || obj.abilities[obj.player_id].indexOf('P') !== -1) {
    node.style('opacity', '0.0')
    node.style('pointer-events', 'auto')
    node.attr('title', _('double-click to warp'))
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
    const playerEl = dojo.create('div', {
      innerHTML: `${player.player_name}: `
    }, $('playerlist'))
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
        class: 'redpawn'
      }, playerEl)
    }
    playerEl.ondblclick = function (evt) {
      dispatchMove(obj, null, [playerId])
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

function previewNextTile (obj, dojo, info) {
  const tileId = parseInt(info.tile_id)
  dojo.create('div', {
    class: `tile${tileId}`
  }, $('mm_next_explore'))
  dojo.query('#mm_next_explore_container').style('visibility', 'visible')
}

function placeTile (obj, tile) {
  $('mm_next_explore').innerHTML = ''
  dojo.query('#mm_next_explore_container').style('visibility', 'hidden')
  const x = parseInt(tile.position_x)
  const y = parseInt(tile.position_y)
  const screenCoords = toScreenCoords(x, y)
  dojo.create('div', {
    class: `tile${tile.tile_id}`,
    style: {
      position: 'absolute',
      left: (screenCoords[0] - BORDER_WIDTH) + 'px',
      top: (screenCoords[1] - BORDER_WIDTH) + 'px',
      transform: 'rotate(' + tile.rotation + 'deg)'
    }
  }, $('mm_area_scrollable'))
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

function drawProperties (obj, properties) {
  if (properties.warp) {
    for (let i = 0; i < properties.warp.length; ++i) {
      const warp = properties.warp[i]
      const key = getKey(warp.position_x, warp.position_y)
      // XXX: this doesn't work
      // if (key in obj.clickableCells) continue
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
      clickableZone.ondblclick = function (evt) {
        dispatchMove(obj, -1, [warp.position_x, warp.position_y])
      }
      obj.clickableCells.set(key, clickableZone)
    }
  }
  updateWarpHighlight(dojo, obj)

  if (properties.used) {
    for (let i = 0; i < properties.used.length; ++i) {
      const used = properties.used[i]
      drawUsed(obj, used.position_x, used.position_y)
    }
  }
  if (properties.explore) {
    for (let i = 0; i < properties.explore.length; ++i) {
      const explore = properties.explore[i]
      const key = getKey(explore.position_x, explore.position_y)
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
    }
  }
}

function drawUsed (obj, x, y) {
  const key = getKey(x, y)
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

function placeCharacter (obj, info) {
  const x = parseInt(info.position_x)
  const y = parseInt(info.position_y)
  const key = getKey(x, y)
  const top = obj.tops.get(key)
  const left = obj.lefts.get(key)
  const el = $(`mm_token${info.token_id}`)
  const adjust = (CELL_SIZE - MEEPLE_SIZE) / 2
  el.style.left = `${left + adjust}px`
  el.style.top = `${top + adjust}px`
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
      this.clickableCells = new Map()
      this.visualCells = new Map()
      this.scrollmap = new ebg.scrollmap() // eslint-disable-line new-cap
    },

    /*
            setup:

            This method must set up the game user interface according to current game situation specified
            in parameters.

            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)

            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
            */

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

      // TODO: Set up your game interface here, according to "gamedatas"
      if (gamedatas.deadline) {
        this.deadline = gamedatas.deadline
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
      if (gamedatas.next_tile) {
        previewNextTile(this, dojo, gamedatas.next_tile)
      }

      for (const key in gamedatas.tokens) {
        placeCharacter(this, gamedatas.tokens[key])
        const tokenId = gamedatas.tokens[key].token_id
        const base = `#mm_control${tokenId} `
        dojo.connect(document.querySelector(base + '> .mm_actionN'), 'onclick', this, function (evt) {
          // up
          dispatchMove(this, tokenId, [0, -1])
        })
        dojo.connect(document.querySelector(base + '> .mm_actionW'), 'onclick', this, function (evt) {
          // left
          dispatchMove(this, tokenId, [-1, 0])
        })
        dojo.connect(document.querySelector(base + '> .mm_actionE'), 'onclick', this, function (evt) {
          // right
          dispatchMove(this, tokenId, [1, 0])
        })
        dojo.connect(document.querySelector(base + '> .mm_actionS'), 'onclick', this, function (evt) {
          // down
          dispatchMove(this, tokenId, [0, 1])
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
          dispatchMove(this, tokenId, [0, -1])
        })
        dojo.connect(document.querySelector(base2 + '> .mm_actionW'), 'onclick', this, function (evt) {
          // left
          dispatchMove(this, tokenId, [-1, 0])
        })
        dojo.connect(document.querySelector(base2 + '> .mm_actionE'), 'onclick', this, function (evt) {
          // up
          dispatchMove(this, tokenId, [1, 0])
        })
        dojo.connect(document.querySelector(base2 + '> .mm_actionS'), 'onclick', this, function (evt) {
          // down
          dispatchMove(this, tokenId, [0, 1])
        })
      }
      dojo.connect($('mm_movetop'), 'onclick', this, 'onMoveTop')
      dojo.connect($('mm_moveleft'), 'onclick', this, 'onMoveLeft')
      dojo.connect($('mm_moveright'), 'onclick', this, 'onMoveRight')
      dojo.connect($('mm_movedown'), 'onclick', this, 'onMoveDown')

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

    /// ////////////////////////////////////////////////
    /// / Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState: function (stateName, args) {
      switch (stateName) {
        case 'escape_loud':
        case 'escape_quiet':
          dojo.query('.mm_abilityP').forEach(function (node, index, arr) {
            node.innerText = ''
            dojo.create('div', {
              class: 'mm_crossout'
            }, node)
          }
          )
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
    onUpdateActionButtons: function (stateName, args) {
      console.log('onUpdateActionButtons: ' + stateName)

      if (this.isCurrentPlayerActive()) {
        switch (stateName) {
          /*
                 Example:

                 case 'myGameState':

              // Add 3 action buttons in the action status bar:

                    this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' );
                    this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' );
                    this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' );
                    break;
                    */
        }
      }
    },

    /// ////////////////////////////////////////////////
    /// / Utility methods

    /*

            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.

*/

    /// ////////////////////////////////////////////////
    /// / Player's action

    /*

            Here, you are defining methods to handle player's action (ex: results of mouse click on
            game objects).

            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server

*/
    onCreateTile: function (tileID, x, y) {
      // TODO checkAction
      this.ajaxcall('/magicmaze/magicmaze/placeTile.html',
        {
          tile_id: tileID,
          x: x,
          y: y,
          lock: true
        }, this, function (result) {
          console.log(result)
        }, function (error) { console.log(error) })
    },
    /* Example:

        onMyMethodToCall1: function( evt )
        {
            console.log( 'onMyMethodToCall1' );

      // Preventing default browser reaction
            dojo.stopEvent( evt );

      // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/magicmaze/magicmaze/myAction.html", {
                                                                    lock: true,
                                                                    myArgument1: arg1,
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 },
                         this, function( result ) {

      // What to do after the server call if it succeeded
      // (most of the time: nothing)

                         }, function( is_error) {

      // What to do after the server call in anyway (success or failure)
      // (most of the time: nothing)

                         } );
        },

*/

    /// ////////////////////////////////////////////////
    /// / Reaction to cometD notifications

    /*
            setupNotifications:

            In this method, you associate each of your game notifications with your local method to handle it.

            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your magicmaze.game.php file.

*/
    notif_tileAdded: function (notif) {
      placeTile(this, notif.args)
      drawProperties(this, notif.args.clickables)
    },
    notif_tokenMoved: function (notif) {
      placeCharacter(this, notif.args)
    },
    notif_nextTile: function (notif) {
      previewNextTile(this, dojo, notif.args)
    },
    notif_newDeadline: function (notif) {
      if (notif.args.deadline) {
        this.deadline = notif.args.deadline
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

      // TODO: here, associate your game notifications with local methods

      // Example 1: standard notification handling
      // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );

      // Example 2: standard notification handling + tell the user interface to wait
      //            during 3 seconds after calling the method in order to let the players
      //            see what is happening in the game.
      // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
      // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
      //
    }

    // TODO: from this point and below, you can write your game notifications handling methods

    /*
        Example:

        notif_cardPlayed: function( notif )
        {
            console.log( 'notif_cardPlayed' );
            console.log( notif );

      // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call

      // TODO: play the card in the user interface.
        },

*/
  })
})
