<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * MagicMaze implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * MagicMaze game options description
 *
 * In this file, you can define your game options (= game variants).
 *
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in magicmaze.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 */
$game_options = array(
    100 => array(
        'name' => totranslate('Time limit'),
        'values' => array(
            10 => array('name' => totranslate('Original time limits')),
            20 => array('name' => totranslate('Extended time limits for online play')),
            30 => array('name' => totranslate('Very relaxed time limits to explore with')),
        ),
    ),
    // 101 is reserved for possibly the 1a/1b split
    102 => array(
       'name' => totranslate('Tile set'),
       'values' => array(
           0 => array('name' => totranslate('The base game (1a, 2-12)')),
           10 => array('name' => totranslate('The mage special ability (1b, 2-15)')),
           20 => array('name' => totranslate('The barbarian special ability (1b, 2-17)'), 'nobeginner' => true),
           30 => array('name' => totranslate('The full game (1b, 2-19)'), 'nobeginner' => true),
           40 => array('name' => totranslate('The full game plus a few more tiles (1b, 2-22)'), 'nobeginner' => true),
           50 => array('name' => totranslate('Every single tile available (1b, 2-24)'), 'nobeginner' => true),
       ),
    ),

    /*

    // note: game variant ID should start at 100 (ie: 100, 101, 102, ...). The maximum is 199.
    100 => array(
                'name' => totranslate('my game option'),
                'values' => array(

                            // A simple value for this option:
                            1 => array( 'name' => totranslate('option 1') )

                            // A simple value for this option.
                            // If this value is chosen, the value of "tmdisplay" is displayed in the game lobby
                            2 => array( 'name' => totranslate('option 2'), 'tmdisplay' => totranslate('option 2') ),

                            // Another value, with other options:
                            //  description => this text will be displayed underneath the option when this value is selected to explain what it does
                            //  beta=true => this option is in beta version right now.
                            //  nobeginner=true  =>  this option is not recommended for beginners
                            3 => array( 'name' => totranslate('option 3'), 'description' => totranslate('this option does X'), 'beta' => true, 'nobeginner' => true )
                        )
            )

    */

);
