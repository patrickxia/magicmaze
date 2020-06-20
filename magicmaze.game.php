<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * MagicMaze implementation : © Patrick Xia <patrick.xia@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
require_once(APP_GAMEMODULE_PATH . 'module/table/table.game.php');
require_once('modules/mm-playerability.php');
require_once('modules/mm-tiles.php');

// Be nice to the players: let them overshoot their timers by a tiny bit.
define('TIMER_SLOP', 2);
// The mage is special for one SQL query. TODO: Refactor this crap out of here.
define('MAGE', 3);

function getTimerValue($option) {
    switch ($option) {
        case 30:
            return 420;
        case 20:
            return 240;
        case 10:
        default:
            return 180;
    }
}

function getTileset($option) {
    switch ($option) {
        case 50:
            return array(0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24);
        case 40:
            return array(0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22);
        case 30:
            return array(0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19);
        case 20:
            return array(0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17);
        case 10:
            return array(0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
        case 0:
        default:
            return array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
    }
}

function getKey($inx, $iny) {
    return "${inx}_${iny}";
}

function updateEscalatorQuery($token_id) {
    return <<<EOT
update
    `tokens` t
join
    `escalators` e
on t.position_x = e.old_x and t.position_y = e.old_y
set t.position_x = e.new_x, t.position_y = e.new_y
where
    t.token_id = $token_id
and not t.locked
and not exists (
    select 1 from (select * from `tokens` for update) t2
    where t2.position_x = e.new_x and t2.position_y = e.new_y
)
EOT;
}

class MagicMaze extends Table {
    // tile_id -> x -> y -> {"walls", "escalator", "properties"}
    protected $tileinfo = array();

    public function __construct() {
        parent::__construct();

        self::initGameStateLabels(array(
            'timer_deadline_micros' => 10,
            'num_flips' => 11,
            'mage_status' => 12,
            'attention_pawn' => 13,
            'explore_status' => 14,
            'option_time_limit' => 100,
            'option_tile_set' => 102,
        ));
    }

    protected function getGameName() {
        // Used for translations and stuff. Please do not modify.
        return 'magicmaze';
    }

    /*
        setupNewGame:

        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = array()) {
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        // Create players
        // (This is boilerplate from the template).
        $sql = 'INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ';
        $values = array();
        foreach ($players as $player_id => $player) {
            $color = array_shift($default_colors);
            $values[] = "('" . $player_id . "','$color','" . $player['player_canal'] . "','" . addslashes($player['player_name']) . "','" . addslashes($player['player_avatar']) . "')";
        }
        $sql .= implode($values, ',');
        self::DbQuery($sql);

        $tiles = getTileset(self::getGameStateValue('option_tile_set'));
        shuffle($tiles);
        $sql = 'insert into tiles (tile_id, tile_order) values ';
        for ($i = 0; $i < count($tiles); ++$i) {
            if ($i != 0) {
                $sql .= ',';
            }
            $sql .= "($tiles[$i], $i)";
        }
        self::DbQuery($sql);

        if (in_array(0, $tiles)) {
            $this->createTile(0, 0, 0, 0);
        } else {
            $this->createTile(1, 0, 0, 0);
        }
        self::reattributeColorsBasedOnPreferences($players, $gameinfos['player_colors']);
        self::reloadPlayersBasicInfos();

        $spawns = array(array(1,1), array(1,2), array(2,1), array(2,2));
        shuffle($spawns);
        for ($i = 0; $i < 4; $i++) {
            $x = $spawns[$i][0];
            $y = $spawns[$i][1];
            $sql = "insert into tokens (token_id, position_x, position_y) values ($i, $x, $y)";
            self::DbQuery($sql);
        }

        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue('timer_deadline_micros', -1);
        self::setGameStateInitialValue('num_flips', 0);
        self::setGameStateInitialValue('mage_status', 0);
        self::setGameStateInitialValue('attention_pawn', -1);
        self::setGameStateInitialValue('explore_status', 0);

        self::initStat('table', 'actions_number', 0);
        self::initStat('table', 'tiles_explored', 0);
        self::initStat('table', 'timer_flips', 0);

        self::initStat('player', 'actions_number', 0);
        $this->gamestate->setAllPlayersMultiactive();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas:

        Gather all informations about current game situation (visible by the current player).

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas() {
        $result = array();
        $current_player_id = self::getCurrentPlayerId();
        // Get information about players
        $result['players'] = self::loadPlayersBasicInfos();
        $sql = 'select tile_id tile_id, position_x, position_y, rotation from tiles where placed';
        $result['tiles'] = self::getCollectionFromDb($sql);
        $sql = 'select token_id, position_x, position_y, locked from tokens';
        $result['tokens'] = self::getCollectionFromDb($sql);
        foreach ($result['tokens'] as $token_id => $values) {
            if ($values['locked']) {
                $result['next_tile'] = array();
                $result['next_tile']['tile_id'] = $this->nextAvailableTile();

                break;
            }
        }

        // TODO: We can lower the roundtrips here but this is only on a full load...
        $sql = "select position_x, position_y, token_id from properties where property = 'warp'";
        $result['properties']['warp'] = self::getObjectListFromDB($sql);
        $sql = "select position_x, position_y, token_id from properties where property = 'explore'";
        $result['properties']['explore'] = self::getObjectListFromDB($sql);
        $sql = "select position_x, position_y, token_id from properties where property = 'used'";
        $result['properties']['used'] = self::getObjectListFromDB($sql);

        $result['flips'] = self::getGameStateValue('num_flips');
        $deadline = floatval(self::getGameStateValue('timer_deadline_micros'));
        if ($deadline !== -1.) {
            $result['time_left'] = $deadline - microtime(true);
        }
        $attention = intval(self::getGameStateValue('attention_pawn'));
        if ($attention !== -1) {
            $result['attention_pawn'] = $attention;
        }

        return $result;
    }

    public function checkOk($action) {
        $players = array_filter(self::loadPlayersBasicInfos(), function ($player) {
            return !$player['player_zombie'];
        });

        $allowable = getRoles(
            count($players),
            $players[self::getCurrentPlayerId()]['player_no'],
            self::getGameStateValue('num_flips')
        );

        if (strpos($allowable, $action) === false) {
            throw new BgaUserException(self::_("you don't have that ability"));
        }

        self::incStat(1, 'actions_number');
        self::incStat(1, 'actions_number', self::getCurrentPlayerId());
    }

    /*
        getGameProgression:

        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).

        This method is called each time we are in a game state with the "updateGameProgression" property set to true
        (see states.inc.php)
    */
    public function getGameProgression() {
        return intval(self::getGameStateValue('num_flips')) * 25;
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////
    public function populateTileInfo() {
        if (count($this->tileinfo) > 0) {
            return;
        }
        $this->tileinfo = MM_TILEINFO;
    }

    public function generateConnectionsForTile($tile_id, $x_coord, $y_coord, $rotation) {
        $this->populateTileInfo();
        $ret = array();
        $tileToGrid = function ($x, $y) {
            throw new Exception('invalid rotation');
        };
        $invTileToGrid = $tileToGrid;
        $rotWalls = $tileToGrid;
        switch ($rotation) {
            case 0:
                $tileToGrid = function ($x, $y) {
                    return array($x, $y);
                };
                $invTileToGrid = $tileToGrid;
                $rotWalls = function ($str) {
                    return $str;
                };

                break;
            case 90:
                $tileToGrid = function ($x, $y) {
                    return array($y, 3 - $x);
                };
                $invTileToGrid = function ($x, $y) {
                    return array(3 - $y, $x);
                };
                $rotWalls = function ($str) {
                    return strtr($str, 'NESWnesw', 'ESWNeswn');
                };

                break;
            case 180:
                $tileToGrid = function ($x, $y) {
                    return array(3 - $x, 3 - $y);
                };
                $invTileToGrid = $tileToGrid;
                $rotWalls = function ($str) {
                    return strtr($str, 'NESWnesw', 'SWNEswne');
                };

                break;
            case -90:
            case 270:
                $tileToGrid = function ($x, $y) {
                    return array(3 - $y, $x);
                };
                $invTileToGrid = function ($x, $y) {
                    return array($y, 3 - $x);
                };
                $rotWalls = function ($str) {
                    return strtr($str, 'NESWnesw', 'WNESwnes');
                };

                break;
        }
        $escalatorstring = '';
        $wallstring = '';
        $propertystring = '';
        for ($i = 0; $i < 4; ++$i) {
            for ($j = 0; $j < 4; ++$j) {
                $coord = $tileToGrid($i, $j);
                $tile = $this->tileinfo[$tile_id][$coord[0]][$coord[1]];
                $walls = $rotWalls($tile['walls']);

                $oldx = $x_coord + $i;
                $oldy = $y_coord + $j;

                // gyop
                for ($k = 0; $k < strlen($walls); ++$k) {
                    $dir = $walls[$k];
                    $dx = 0;
                    $dy = 0;
                    switch (strtoupper($dir)) {
                        case 'N':
                            $dx = 0;
                            $dy = -1;

                        break;
                        case 'S':
                            $dx = 0;
                            $dy = 1;

                        break;
                        case 'E':
                            $dx = 1;
                            $dy = 0;

                        break;
                        case 'W':
                            $dx = -1;
                            $dy = 0;

                        break;
                        default:
                          throw new Exception('assert: invalid direction');
                    }
                    if (strlen($wallstring) !== 0) {
                        $wallstring .= ',';
                    }
                    $newx = $oldx + $dx;
                    $newy = $oldy + $dy;
                    // TODO: figure out if we should write both
                    $is_dwarf = (($dir === strtoupper($dir)) ? 0 : 1);
                    $wallstring .= "($oldx, $oldy, $newx, $newy, $is_dwarf),";
                    $wallstring .= "($newx, $newy, $oldx, $oldy, $is_dwarf)";
                }

                if (strlen($tile['escalator']) > 0) {
                    if (strlen($escalatorstring) !== 0) {
                        $escalatorstring .= ',';
                    }

                    $esclx = intval($tile['escalator'][0]);
                    $escly = intval($tile['escalator'][1]);
                    $tfnew = $invTileToGrid($esclx, $escly);
                    $newx = $x_coord + $tfnew[0];
                    $newy = $y_coord + $tfnew[1];
                    $escalatorstring .= "($oldx, $oldy, $newx, $newy),";
                    $escalatorstring .= "($newx, $newy, $oldx, $oldy)";
                }

                if (strlen($tile['properties']) > 0) {
                    if (strlen($propertystring) !== 0) {
                        $propertystring .= ',';
                    }
                    // goyp
                    $color = 'NULL';
                    $type = '';
                    $lookup = array(
                        'g' => 0,
                        'o' => 1,
                        'y' => 2,
                        'p' => 3,
                    );
                    if (array_key_exists($tile['properties'][0], $lookup)) {
                        $color = $lookup[$tile['properties'][0]];
                        $type = substr($tile['properties'], 1);
                    } else {
                        $type = $tile['properties'];
                    }
                    $ret[$type][] = array(
                        'position_x' => $oldx,
                        'position_y' => $oldy,
                    );
                    $propertystring .= "($oldx, $oldy, $color, '$type')";
                }
            }
        }
        self::DbQuery("insert ignore into walls values $wallstring");
        if (strlen($escalatorstring) > 0) {
            self::DbQuery("insert ignore into escalators values $escalatorstring");
        }
        if (strlen($propertystring) > 0) {
            self::DbQuery("insert into properties values $propertystring");
        }

        return $ret;
    }

    // goyp
    public function isElf($tokenID) {
        return intval($tokenID) === 0;
    }
    public function isDwarf($tokenID) {
        return intval($tokenID) === 1;
    }
    public function isBarbarian($tokenID) {
        return intval($tokenID) === 2;
    }
    public function isMage($tokenID) {
        return intval($tokenID) === 3;
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    ////////////
    public function setAttentionPawn($id) {
        self::setGameStateValue('attention_pawn', $id);
        $players = self::loadPlayersBasicInfos();
        self::notifyAllPlayers('attention', clienttranslate('Player ${player_name} is asked to pay attention by ${src_player}'), array(
            'player_id' => $id,
            'player_name' => $players[$id]['player_name'],
            'src_player' => self::getCurrentPlayerName(),
        ));
    }
    public function nextAvailableTile() {
        $sql = 'select tile_id from tiles where not placed order by tile_order limit 1 for update';
        $nextId = self::getObjectFromDb($sql);
        if (!$nextId) {
            return -1;
        }

        return $nextId['tile_id'];
    }

    public function tileCoords($tile_id) {
        $sql = 'select position_x, position_y from tiles where tile_id = ' . $tile_id;
        $res = self::getNonEmptyObjectFromDb($sql);

        return array($res['position_x'], $res['position_y']);
    }

    public function informNextTile() {
        $next = $this->nextAvailableTile();
        if ($next === -1) {
            throw new BgaUserException(self::_('there are no tiles left!'));
        }

        self::notifyAllPlayers('nextTile', clienttranslate('next tile available'), array(
            'tile_id' => $next,
        ));
    }

    public function attemptWizExplore() {
        $mage = MAGE;
        $sql = <<<SQL
        update tokens t
        join properties p
        on t.position_x = p.position_x and t.position_y = p.position_y
        set
          t.locked = true
        where
          t.token_id = $mage
          and not t.locked
          and p.property = 'crystal'
          and not exists (
              select 1 from (select * from tokens for update) t2 where locked
          )
SQL;
        self::DbQuery($sql);
        if (self::DbAffectedRow() === 0) {
            return false;
        }
        self::setGameStateValue('mage_status', 1);

        return true;
    }

    public function attemptExplore($tokenId) {
        $this->checkAction('move');
        $this->checkOk('H');
        // TODO: write test cases for whether or not we transition states properly
        // with a wizexplore while an elf is standing at an explore
        $this->gamestate->nextState('move');
        // TODO: mage action
        // TODO: this kind of sucks UI wise, display a little "locked" icon
        // TODO: clicking twice on explore should place
        $this->informNextTile();
        if ($this->isMage($tokenId)) {
            if ($this->attemptWizExplore()) {
                return;
            }
        }
        if (intval(self::getGameStateValue('mage_status')) !== 0) {
            throw new BgaUserException(self::_('you are already exploring with the mage. click where you would like the tile.'));
        }
        if (intval(self::getGameStateValue('explore_status')) === 1) {
            $sql = <<<SQL
              select
                position_x, position_y, find_tile(position_x, position_y) tile_id
              from tokens
              where
                token_id = $tokenId
                and
                locked
SQL;
            $res = self::getObjectFromDb($sql);
            if (!$res) {
                throw new BgaUserException(self::_('that token was not on an explore space when you started the explore action'));
            }
            $this->placeTileFrom($res['tile_id'], $res['position_x'], $res['position_y'], true);

            return;
        }
        self::setGameStateValue('explore_status', 1);
        $sql = <<<SQL
update tokens t
join properties p
on t.token_id = p.token_id
set 
  t.locked = true
where
  p.position_x = t.position_x
  and p.position_y = t.position_y
  and not t.locked
  and p.property = 'explore'
  and not exists (
      select 1 from (select * from tokens for update) t2 where locked
  )
SQL;
        self::DbQuery($sql);
        if (self::DbAffectedRow() === 0) {
            throw new BgaUserException(self::_("can't explore: no eligible explorations"));
        }
        if (self::DbAffectedRow() === 1) {
            $sql = <<<SQL
select token_id, position_x, position_y, find_tile(position_x, position_y) tile_id from tokens where locked;
SQL;
            $res = self::getNonEmptyObjectFromDb($sql);
            if (intval($tokenId) !== intval($res['token_id'])) {
                throw new BgaUserException(self::_("can't explore: that token is not on an explore space"));
            }
            if ($this->isElf($res['token_id'])) {
                $this->gamestate->nextState('talk');
            }
            $this->placeTileFrom($res['tile_id'], $res['position_x'], $res['position_y'], true);
        }
    }

    public function setDeadline($newDeadline) {
        self::setGameStateValue('timer_deadline_micros', $newDeadline);
    }

    public function checkDeadline() {
        $deadline = floatval(self::getGameStateValue('timer_deadline_micros'));
        if ($deadline === -1.) {
            $this->gamestate->nextState('startTimer');
            $newDeadline = microtime(true) + getTimerValue(self::getGameStateValue('option_time_limit'));
            $this->setDeadline($newDeadline);
            $this->notifyAllPlayers('newDeadline', clienttranslate('Timer started!'), array(
                'flips' => self::getGameStateValue('num_flips'),
                'time_left' => $newDeadline - microtime(true),
            ));
        } elseif (microtime(true) > $deadline + TIMER_SLOP) {
            $this->gamestate->nextState('lose');
            $this->notifyAllPlayers('message', clienttranslate('Oh no! You ran out of time.'), array());

            return false;
        }

        return true;
    }

    public function attemptWarp($x, $y) {
        $this->checkAction('warp');
        $this->checkOk('P');
        $sql = <<<SQL
update tokens t
join properties p
on t.token_id = p.token_id
set
  t.position_x = p.position_x,
  t.position_y = p.position_y
where
  p.position_x = $x
  and p.position_y = $y
  and not t.locked
  and p.property = 'warp' 
  and not exists (
      select 1 from (select * from tokens for update) t2 where
      t2.position_x = p.position_x and t2.position_y = p.position_y
  )
SQL;
        self::DbQuery($sql);
        if (self::DbAffectedRow() === 0) {
            throw new BgaUserException(self::_("you can't warp there"));
        }
        if ($this->checkDeadline() === false) {
            return;
        }
        // TODO: timestamp this
        $sql = "select token_id, position_x, position_y from tokens where position_x = $x and position_y = $y";
        $res = self::getNonEmptyObjectFromDb($sql);

        $this->gamestate->nextState('warp');
        self::notifyAllPlayers('tokenMoved', clienttranslate('token moved'), array(
            'token_id' => $res['token_id'],
            'position_x' => $res['position_x'],
            'position_y' => $res['position_y'],
        ));
    }

    public function attemptEscalator($token_id) {
        $this->checkAction('move');
        $this->checkOk('R');
        $res = self::DbQuery(updateEscalatorQuery($token_id));
        if (self::DbAffectedRow() === 0) {
            throw new BgaUserException(self::_('invalid escalator operation'));
        }
        if ($this->checkDeadline() === false) {
            return;
        }
        $sql = "select position_x, position_y from tokens where token_id = $token_id";
        $res = self::getNonEmptyObjectFromDb($sql);
        $this->gamestate->nextState('move');
        self::notifyAllPlayers('tokenMoved', clienttranslate('token moved'), array(
            'token_id' => $token_id,
            'position_x' => $res['position_x'],
            'position_y' => $res['position_y'],
        ));
    }

    public function attemptMove($token_id, $x, $y) {
        $this->checkAction('move');
        $this->gamestate->nextState('move');
        // TODO: the move should be a string and we should not parse this nonsense
        // (legacy of how this was developed)
        switch ($x . $y) {
            case '-10':
                $this->checkOk('W');

            break;
            case '10':
                $this->checkOk('E');

            break;
            case '01':
                $this->checkOk('S');

            break;
            case '0-1':
                $this->checkOk('N');

            break;
            default:
                throw new BgaUserException(self::_('received invalid move'));
        }

        $sql = 'select token_id, position_x, position_y from tokens for update';
        //$allPositions = self::getNonEmptyCollectionFromDB($sql);
        $res = self::DbQuery($sql);
        $others = array();

        $oldx = -9999;
        $oldy = -9999;
        while ($row = $res->fetch_row()) {
            if ($row[0] == $token_id) {
                $oldx = $row[1];
                $oldy = $row[2];
            } else {
                $others[getKey($row[1], $row[2])] = 1;
            }
        }
        $res->close();

        if ($this->checkDeadline() === false) {
            return;
        }

        $newx = $oldx + $x;
        $newy = $oldy + $y;
        if (array_key_exists(getKey($newx, $newy), $others)) {
            throw new BgaUserException(self::_("can't move there: another pawn is already there"));
        }

        $sql = "update tokens set position_x = $newx, position_y = $newy where " .
        "token_id = $token_id";
        $dwarfexclusion = (($this->isDwarf($token_id)) ? 'and not dwarf' : '');
        $wallrestriction = ' and not exists '
          . "(select 1 from walls where old_x = $oldx and old_y = $oldy and new_x = $newx and new_y = $newy $dwarfexclusion) ";
        $tilerestriction = ' and exists '
          . "(select 1 from tiles where $newx - position_x between 0 and 3 and $newy - position_y between 0 and 3) ";
        $lockrestriction = ' and not locked ';
        $res = self::DbQuery("$sql $wallrestriction $tilerestriction $lockrestriction");
        if (self::DbAffectedRow() === 0) {
            throw new BgaUserException(self::_("you can't move there"));
        }

        $target = ($this->checkAction('steal', false) ? 'item' : 'exit');
        $sql = <<<SQL
        select
          1
        from tokens t join properties p
        on t.token_id = p.token_id
        where p.property = "$target"
        and t.position_x = p.position_x
        and t.position_y = p.position_y
SQL;
        self::DbQuery($sql);

        // TODO maybe move this logic down and refactor it out of here...
        if (self::DbAffectedRow() === 4) {
            if ($this->checkAction('steal', false)) {
                $this->gamestate->nextState('steal');
            } else {
                $sql = <<<SQL
                  update player set player_score = 1
SQL;
                self::DbQuery($sql);
                $this->gamestate->nextState('win');
                $this->notifyAllPlayers('message', clienttranslate('Congratulations!'), array());
            }
        }
        // XXX roundtrips
        $sql = <<<SQL
        select
            t.token_id, t.position_x, t.position_y, p.property
        from
            tokens t
            left join
            properties p
            on t.position_x = p.position_x and t.position_y = p.position_y
        where
            t.token_id = $token_id
SQL;
        $res = self::getNonEmptyObjectFromDb($sql);
        if ($res['property'] === 'timer') {
            $sql = <<<SQL
            update properties
            set property = 'used'
            where position_x = $res[position_x]
            and position_y = $res[position_y]
            and exists
              (select
                count(*)
              from (select * from properties where property = 'camera') p
              having count(*) < 2)
SQL;
            self::DbQuery($sql);
            if (self::DbAffectedRow() === 0) {
                throw new BgaUserException(self::_("can't move there: security cameras"));
            }

            $newDeadline = 2 * microtime(true) -
                self::getGameStateValue('timer_deadline_micros') +
                getTimerValue(self::getGameStateValue('option_time_limit'));

            $this->setDeadline($newDeadline);
            self::notifyAllPlayers('newUsed', '', array(
                'x' => $res['position_x'],
                'y' => $res['position_y'],
            ));
            $this->gamestate->nextState('talk');
            self::notifyAllPlayers('newDeadline', clienttranslate('timer flipped!'), array(
                'flips' => self::incGameStateValue('num_flips', 1),
                'time_left' => $newDeadline - microtime(true),
            ));
            self::incStat(1, 'timer_flips');
        } elseif ($this->isBarbarian($res['token_id']) && $res['property'] === 'camera') {
            $sql = <<<SQL
            update properties
            set property = 'used'
            where position_x = $res[position_x]
            and position_y = $res[position_y]
SQL;
            self::DbQuery($sql);
            self::notifyAllPlayers('newUsed', '', array(
                'x' => $res['position_x'],
                'y' => $res['position_y'],
            ));
        }
        // XXX conflicts, need a lot better than this (possibly timestamp the
        // insertions).

        self::notifyAllPlayers('tokenMoved', clienttranslate('token moved'), array(
            'token_id' => $token_id,
            'position_x' => $res['position_x'],
            'position_y' => $res['position_y'],
        ));
    }

    public function placeTileFrom($tile_id, $x, $y, $is_absolute = false) {
        // TODO: Maybe we shouldn't directly call here
        $this->checkAction('move');
        $this->checkOk('H');

        self::incStat(1, 'tiles_explored');

        $this->gamestate->nextState('move');
        $coords = $this->tileCoords($tile_id);
        if ($is_absolute) {
            $x -= $coords[0];
            $y -= $coords[1];
        }
        // x, y in relative coordinates
        $nextId = $this->nextAvailableTile();
        if ($nextId === -1) {
            throw new BgaUserException(self::_('there are no tiles left!'));
        }
        // Only valid exit tiles are at
        //  20 (no rotation)
        //  32 (90 degree rotation)
        //  13 (180 degree rotation)
        //  01 (-90 degree rotation)
        // 00 10 20 30
        // 01 11 21 31
        // 02 12 22 32
        // 03 13 23 33

        $rotations = array(
            '20' => 0,
            '32' => 90,
            '13' => 180,
            '01' => -90,
        );
        $dx = array(
            '20' => array(1, -4),
            '32' => array(4, +1),
            '13' => array(-1, +4),
            '01' => array(-4, -1),
        );

        $key = $x . $y;
        if (!array_key_exists($key, $rotations)) {
            throw new BgaUserException(self::_('no valid action at that cell'));
        }

        $oldx = $coords[0] + $x;
        $oldy = $coords[1] + $y;
        $newx = $coords[0] + $dx[$key][0];
        $newy = $coords[1] + $dx[$key][1];
        $rotation = $rotations[$key];

        $drawNew = false;
        $mageStatus = intval(self::getGameStateValue('mage_status'));
        if ($mageStatus === 0) {
            $sql = <<<SQL
            select t.token_id from tokens t
            join properties p
            on t.token_id = p.token_id
            where
            p.position_x = t.position_x
            and p.position_y = t.position_y
            and p.position_x = $oldx
            and p.position_y = $oldy
            and (p.property = 'explore')
SQL;
            $tokenId = self::getObjectFromDb($sql);
            if (!$tokenId) {
                throw new BgaUserException(self::_("you can't place a tile there"));
            }
            if ($this->isElf($tokenId['token_id'])) {
                $this->gamestate->nextState('talk');
            }
        } elseif ($mageStatus === 1) {
            // TODO: allow user to opt out? I don't know why they would...
            $drawNew = true;
            self::setGameStateValue('mage_status', 2);
        } else {
            $mage = MAGE;
            $sql = <<<SQL
            update tokens t
            join properties p
            on t.position_x = p.position_x and t.position_y = p.position_y
            set p.property = 'used'
            where t.token_id = $mage
SQL;
            self::DbQuery($sql);
            $sql = <<<SQL
            select
                t.position_x, t.position_y
            from
                tokens t
                join
                properties p
                on t.position_x = p.position_x and t.position_y = p.position_y
            where
                t.token_id = 3 and p.property = "used"
SQL;
            $res = self::getNonEmptyObjectFromDb($sql);
            self::notifyAllPlayers('newUsed', '', array(
                'x' => $res['position_x'],
                'y' => $res['position_y'],
            ));
            self::setGameStateValue('mage_status', 0);
        }

        $this->createTile($nextId, $newx, $newy, $rotation);

        if ($drawNew) {
            $this->informNextTile();
        } else {
            self::setGameStateValue('explore_status', 0);
            self::DbQuery('update tokens set locked = false, dummy = false');
        }
    }

    public function createTile($nextId, $newx, $newy, $rotation) {
        $sql = <<<SQL
        update tiles set
          placed = true,
          position_x = $newx,
          position_y = $newy,
          rotation = $rotation
        where tile_id = $nextId and
        not exists (
            select 1 from (select * from tiles for update) t2
            where position_x = $newx and position_y = $newy
        )
SQL;
        self::DbQuery($sql);
        if (self::DbAffectedRow() === 0) {
            throw new BgaUserException(self::_("you can't create a tile there"));
        }

        $sql = <<<SQL
        delete from properties
        where
          property = 'explore'
          and
          (find_tile(position_x + 1, position_y) = $nextId
            or
          find_tile(position_x - 1, position_y) = $nextId
            or
          find_tile(position_x, position_y + 1) = $nextId
            or
          find_tile(position_x, position_y - 1) = $nextId)
SQL;
        self::DbQuery($sql);

        $clickables = $this->generateConnectionsForTile($nextId, $newx, $newy, $rotation);
        self::notifyAllPlayers('tileAdded', clienttranslate('tile added!'), array(
            'tile_id' => $nextId,
            'position_x' => $newx,
            'position_y' => $newy,
            'rotation' => $rotation,
            'clickables' => $clickables,
        ));
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////// Zombie
    ////////////

    /*
        zombieTurn:

        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).

        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message.
    */

    public function zombieTurn($state, $active_player) {
        $statename = $state['name'];

        if ($state['type'] === 'multipleactiveplayer') {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive($active_player, '');
            $players = self::loadPlayersBasicInfos();
            self::notifyAllPlayers('newZombie', '', array(
                'players' => $players,
            ));

            return;
        }

        throw new feException('Zombie mode not supported at this game state: ' . $statename);
    }

    // states
    public function stGiveTime() {
        // There are four available timers.
        $maxTime = 5 * (TIMER_SLOP + getTimerValue(self::getGameStateValue('option_time_limit')));
        $sql = <<<SQL
update player
set player_start_reflexion_time = now(),
player_remaining_reflexion_time = $maxTime;
SQL;
        self::DbQuery($sql);

        $this->gamestate->nextState('');
    }

    ///////////////////////////////////////////////////////////////////////////////////:
    ////////// DB upgrade
    //////////

    /*
        upgradeTableDb:

        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.

    */

    public function upgradeTableDb($from_version) {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//
    }
}
