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

function toScreenCord(int xcoord, int ycoord) {
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
        var startTile = dojo.create("div", {
          "class": "tile1",
          style: {
            position: "absolute",
            top: "0px",
            left: "0px",
          }
        }, $('area_scrollable'));
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
            transform: "rotate(180deg)"
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
        }, $('area_scrollable'));


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
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );

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