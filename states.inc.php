<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * MagicMaze implementation : © Patrick Xia <patrick.xia@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * states.inc.php
 *
 * MagicMaze game states description
 */

/*
   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).

//    !! It is not a good idea to modify this file when a game is running !!
*/

$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        'name' => 'gameSetup',
        'description' => '',
        'type' => 'manager',
        'action' => 'stGameSetup',
        'transitions' => array('' => 2),
    ),

    2 => array(
            'name' => 'steal_loud',
            'description' => clienttranslate('Steal the items!'),
            'descriptionmyturn' => clienttranslate('Steal the items!'),
            'type' => 'multipleactiveplayer',
            'updateGameProgression' => true,
            'possibleactions' => array('talk', 'move', 'warp', 'steal', 'lose'),
            // I'm not convinced you can steal the items and remain in the loud state.
            'transitions' => array('talk' => 2, 'move' => 3, 'warp' => 3, 'steal' => 5,  'lose' => 99),
    ),

    3 => array(
            'name' => 'steal_quiet',
            'description' => clienttranslate('Quietly steal the items!'),
            'descriptionmyturn' => clienttranslate('Quietly steal the items!'),
            'type' => 'multipleactiveplayer',
            'possibleactions' => array('talk', 'move', 'warp', 'steal', 'lose'),
            'transitions' => array('talk' => 2, 'move' => 3, 'warp' => 3, 'steal' => 5,  'lose' => 99),
    ),

    4 => array(
            'name' => 'escape_loud',
            'description' => clienttranslate('Escape with the items!'),
            'descriptionmyturn' => clienttranslate('Escape with the items!'),
            'type' => 'multipleactiveplayer',
            'updateGameProgression' => true,
            'possibleactions' => array('talk', 'move', 'win', 'lose'),
            'transitions' => array('talk' => 4, 'move' => 5, 'win' => 99,  'lose' => 99),
    ),

    5 => array(
            'name' => 'escape_quiet',
            'description' => clienttranslate('Quietly escape with the items!'),
            'descriptionmyturn' => clienttranslate('Quietly escape with the items!'),
            'type' => 'multipleactiveplayer',
            'possibleactions' => array('talk', 'move', 'win', 'lose'),
            'transitions' => array('move' => 5, 'talk' => 4, 'win' => 99,  'lose' => 99),
    ),

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    99 => array(
        'name' => 'gameEnd',
        'description' => clienttranslate('End of game'),
        'type' => 'manager',
        'action' => 'stGameEnd',
        'args' => 'argGameEnd',
    ),

);
