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
 * magicmaze.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in magicmaze_magicmaze.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 */
  require_once(APP_BASE_PATH . 'view/common/game.view.php');

  class view_magicmaze_magicmaze extends game_view {
      public function getGameName() {
          return 'magicmaze';
      }
      public function build_page($viewArgs) {
          // Get players & players number
          $players = $this->game->loadPlayersBasicInfos();
          $players_nbr = count($players);
          $this->tpl['TEXT_TIME_REMAIN'] = self::_('Time remaining:');
          $this->tpl['TEXT_NEXT_EXPLORE'] = self::_('Next exploration tile (click on cell to explore):');
          $this->tpl['TEXT_PLAYER_LIST'] = self::_('Double-click a player in the player list (top or right) to give them the red pawn.');
      }
  }
