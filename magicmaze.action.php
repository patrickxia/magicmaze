<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * MagicMaze implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * magicmaze.action.php
 *
 * MagicMaze main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/magicmaze/magicmaze/myAction.html", ...)
 *
 */
  
  
  class action_magicmaze extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "magicmaze_magicmaze";
            self::trace( "Complete reinitialization of board game" );
      }
    } 
    
    public function placeTile() {
      self::setAjaxMode();
      // XXX is there injection here? do we guarantee an int?
      $id = self::getArg("tile_id", AT_int, true);
      $x = self::getArg("x", AT_int, true);
      $y = self::getArg("y", AT_int, true);
      $this->game->placeTileFrom($id, $x, $y);
      self::ajaxResponse();
    }

    public function attemptMove() {
      self::setAjaxMode();
      // XXX stop players from warping
      $id = self::getArg("token_id", AT_int, true);
      $x = self::getArg("x", AT_int, true);
      $y = self::getArg("y", AT_int, true);
      $this->game->attemptMove($id, $x, $y);
      self::ajaxResponse();
    }

    public function attemptEscalator() {
      self::setAjaxMode();
      $id = self::getArg("token_id", AT_int, true);
      $this->game->attemptEscalator($id);
      self::ajaxResponse();
    }
    

    public function nuke() {
      self::setAjaxMode();
      $this->game->nukeIt();
      self::ajaxResponse();
    }
  	// TODO: defines your action entry points there


    /*
    
    Example:
  	
    public function myAction()
    {
        self::setAjaxMode();     

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $arg1 = self::getArg( "myArgument1", AT_posint, true );
        $arg2 = self::getArg( "myArgument2", AT_posint, true );

        // Then, call the appropriate method in your game logic, like "playCard" or "myAction"
        $this->game->myAction( $arg1, $arg2 );

        self::ajaxResponse( );
    }
    
    */

  }
  

