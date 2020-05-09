/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * MagicMaze implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * magicmaze.js
 *
 * MagicMaze user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

const BORDER_WIDTH = 20;
const CELL_SIZE = 54;
const IMAGE_SIZE = 256;

function toScreenCoords(x, y) {
  // Thanks Sarah Howell (soasrsamh@gmail.com) for the
  // lovely math behind this implementation.

  // 00 10 20 30
  // 01 11 21 31 41 51 61 71
  // 02 12 22 32 42 52 62 72
  // 03 13 23 33 43 53 63 73
  //             44 54 64 74

  var x0 = ((y+4*x) / 17) | 0;
  var cellsX = (x + 1) % 4;
  var extraBordersX = 0;
  var y0 = ((x-4*y) / 17) | 0;
  var cellsY = (y + 1) % 4;
  var extraBordersY = 0;
  var left = 2 * BORDER_WIDTH * x0 + x * CELL_SIZE;
  var top = -2 * BORDER_WIDTH * y0 + y * CELL_SIZE;

  return [left, top];
}

function dispatchClick(obj, evt, tileId, relativex, relativey, x, y) {
  obj.onCreateTile(tileId, relativex, relativey);
}

function placeTile(obj, tile) {
  const x = parseInt(tile["position_x"]);
  const y = parseInt(tile["position_y"]);
  const screenCoords = toScreenCoords(x, y)
  const newTile = dojo.create("div", {
    "class": `tile${tile["tile_id"]}`,
    style: {
      position: "absolute",
      left: (screenCoords[0] - BORDER_WIDTH) + "px",
      top: (screenCoords[1] - BORDER_WIDTH) + "px",
      transform: "rotate(" + tile["rotation"] + "deg)",
    }
  }, $('area_scrollable'));
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      var clickableZone = dojo.create("div", {
        "class": "debug",
        style: {
          position: "absolute",
          width: CELL_SIZE + "px",
          height: CELL_SIZE + "px",
          left: (screenCoords[0] + CELL_SIZE * i) + "px",
          top: (screenCoords[1] + CELL_SIZE * j) + "px"
        }
      }, $('area_scrollable_oversurface'))
      clickableZone.onclick = function(evt) {
        dispatchClick(obj, evt,
          tile["tile_id"], i, j, i + x, j + y);
      };
    }
  }
}

define([
  "dojo","dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
  "ebg/scrollmap"
],
  function (dojo, declare) {
    return declare("bgagame.magicmaze", ebg.core.gamegui, {
      constructor: function(){
        this.scrollmap = new ebg.scrollmap();
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

      setup: function( gamedatas )
      {
        console.log( "Starting game setup" );

        const game = this;
        $('nuke').onclick = function(evt) {
          game.ajaxcall("/magicmaze/magicmaze/nuke.html", {}, this, function(res){
            location.reload();
          }, function(error){});
        };

        // Setting up player boards
        for( var player_id in gamedatas.players )
        {
          var player = gamedatas.players[player_id];

          // TODO: Setting up players boards if needed
        }

        // TODO: Set up your game interface here, according to "gamedatas"

        this.scrollmap.create(
          $('area_container'),
          $('area_scrollable'),
          $('area_surface'),
          $('area_scrollable_oversurface')
        );
        this.scrollmap.setupOnScreenArrows(150);
        for (var key in gamedatas.tiles) {
          placeTile(this, gamedatas.tiles[key]);
        }
        /*
       var tile2 = dojo.create("div", {
          "class": "tile2",
          style: {
            position: "absolute",
            top: "-256px",
            left: "64px",
            //transform: "rotate(180deg)"
          }
        }, $('area_scrollable'));
        var tile3 = dojo.create("div", {
          "class": "tile3",
          style: {
            position: "absolute",
            top: "256px",
            left: "-64px",
            y
          }
        }, $('area_scrollable'));
        var tile4 = dojo.create("div", {
          "class": "tile4",
          style: {
            position: "absolute",
            top: "64px",
            left: "256px",
            transform: "rotate(90deg)"
          }
        }, $('area_scrollable'));
        var tile5 = dojo.create("div", {
          "class": "tile5",
          style: {
            position: "absolute",
            top: "320px",
            left: "192px",
            transform: "rotate(90deg)"
          }
        }, $('area_scrollable'));*/


        //$('area_scrollable').append(startTile).css('background-image', "url('img/1.jpg')").css('width', '256px').css('height', '256px');


        dojo.connect( $('movetop'), 'onclick', this, 'onMoveTop' );
        dojo.connect( $('moveleft'), 'onclick', this, 'onMoveLeft' );
        dojo.connect( $('moveright'), 'onclick', this, 'onMoveRight' );
        dojo.connect( $('movedown'), 'onclick', this, 'onMoveDown' );

        // Setup game notifications to handle (see "setupNotifications" method below)
        this.setupNotifications();

        console.log( "Ending game setup" );
      },

      onMoveTop : function( evt )
      {
        console.log( "onMoveTop" );        
        evt.preventDefault();
        this.scrollmap.scroll( 0, 300 );
      },
      onMoveLeft : function( evt )
      {
        console.log( "onMoveLeft" );        
        evt.preventDefault();
        this.scrollmap.scroll( 300, 0 );
      },
      onMoveRight : function( evt )
      {
        console.log( "onMoveRight" );        
        evt.preventDefault();
        this.scrollmap.scroll( -300, 0 );
      },
      onMoveDown : function( evt )
      {
        console.log( "onMoveDown" );        
        evt.preventDefault();
        this.scrollmap.scroll( 0, -300 );
      },


      ///////////////////////////////////////////////////
      //// Game & client states

      // onEnteringState: this method is called each time we are entering into a new game state.
      //                  You can use this method to perform some user interface changes at this moment.
      //
      onEnteringState: function( stateName, args )
      {
        console.log( 'Entering state: '+stateName );

        switch( stateName )
        {

            /* Example:

            case 'myGameState':

            // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );

                break;
                */


          case 'dummmy':
            break;
        }
      },

      // onLeavingState: this method is called each time we are leaving a game state.
      //                 You can use this method to perform some user interface changes at this moment.
      //
      onLeavingState: function( stateName )
      {
        console.log( 'Leaving state: '+stateName );

        switch( stateName )
        {

            /* Example:

            case 'myGameState':

            // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );

                break;
                */


          case 'dummmy':
            break;
        }               
      }, 

      // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
      //                        action status bar (ie: the HTML links in the status bar).
      //        
      onUpdateActionButtons: function( stateName, args )
      {
        console.log( 'onUpdateActionButtons: '+stateName );

        if( this.isCurrentPlayerActive() )
        {            
          switch( stateName )
          {
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

      ///////////////////////////////////////////////////
      //// Utility methods

      /*

            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.

*/


      ///////////////////////////////////////////////////
      //// Player's action

      /*

            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).

            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server

*/
      onCreateTile: function(tile_id, x, y) {
        // TODO checkAction
        this.ajaxcall("/magicmaze/magicmaze/placeTile.html",
        {tile_id: tile_id,
        x: x,
      y:y}, this, function(result) {
        console.log(result);
      }, function (error) { console.log(error); });
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


      ///////////////////////////////////////////////////
      //// Reaction to cometD notifications

      /*
            setupNotifications:

            In this method, you associate each of your game notifications with your local method to handle it.

            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your magicmaze.game.php file.

*/
        notif_tileAdded: function(notif) {
          console.log(notif);
          placeTile(this, notif.args);
        },
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );
            dojo.subscribe('tileAdded', this, 'notif_tileAdded');

      // TODO: here, associate your game notifications with local methods

      // Example 1: standard notification handling
      // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );

      // Example 2: standard notification handling + tell the user interface to wait
      //            during 3 seconds after calling the method in order to let the players
      //            see what is happening in the game.
      // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
      // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
      // 
    },  

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
   });             
});
