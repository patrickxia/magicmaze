<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * MagicMaze implementation : © Patrick Xia <patrick.xia@gmail.com>
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
 */
  class action_magicmaze extends APP_GameAction {
      // Constructor: please do not modify
      public function __default() {
          if (self::isArg('notifwindow')) {
              $this->view = 'common_notifwindow';
              $this->viewArgs['table'] = self::getArg('table', AT_posint, true);
          } else {
              $this->view = 'magicmaze_magicmaze';
              self::trace('Complete reinitialization of board game');
          }
      }

      public function placeTile() {
          self::setAjaxMode();
          $id = self::getArg('tile_id', AT_int, true);
          $x = self::getArg('x', AT_int, true);
          $y = self::getArg('y', AT_int, true);
          $this->game->placeTileFrom($id, $x, $y);
          self::ajaxResponse();
      }

      public function attemptMove() {
          self::setAjaxMode();
          $id = self::getArg('token_id', AT_int, true);
          $x = self::getArg('x', AT_int, true);
          $y = self::getArg('y', AT_int, true);
          $keepmoving = self::getArg('keep_moving', AT_bool, false, false);
          $this->game->attemptMove($id, $x, $y, $keepmoving);
          self::ajaxResponse();
      }

      public function attemptWarp() {
          self::setAjaxMode();
          $x = self::getArg('x', AT_int, true);
          $y = self::getArg('y', AT_int, true);
          $this->game->attemptWarp($x, $y);
          self::ajaxResponse();
      }

      public function attemptEscalator() {
          self::setAjaxMode();
          $id = self::getArg('token_id', AT_int, true);
          $this->game->attemptEscalator($id);
          self::ajaxResponse();
      }

      public function attemptExplore() {
          self::setAjaxMode();
          $id = self::getArg('token_id', AT_int, true);
          $this->game->attemptExplore($id);
          self::ajaxResponse();
      }

      public function notify() {
          self::setAjaxMode();
          $id = self::getArg('player_id', AT_int, true);
          $this->game->setAttentionPawn($id);
          self::ajaxResponse();
      }

      public function refreshDeadline() {
          self::setAjaxMode();
          $this->game->userRefreshDeadline();
          self::ajaxResponse();
      }
  }
