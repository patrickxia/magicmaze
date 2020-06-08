 
 <?php
    /*
        Abilities:
             North
             East
             South
             West
        searcH
          warP (or Portal)
     escalatoR
    */
    function getRoles($nPlayers, $player, $flips) {
        $nPlayers = intval($nPlayers);
        $player = intval($player);
        $flips = intval($flips);
        $res = array();
        switch ($nPlayers) {
            case 1:
                $res = array(
                    0 => 'NESWHPR',
                );

            break;
            case 2:
                // Two players:
                // player1: escalator search south west
                // player2: portal north east
                $res = array(
                    0 => 'RHSW',
                    1 => 'PNE',
                );

            break;
            case 3:
                // Three players:
                // player1: north east
                // player2: west portal
                // player3: escalator search south
                $res = array(
                    0 => 'NE',
                    1 => 'WP',
                    2 => 'RHS',
                );

            break;
            case 8:
                // 4-8 players use the same base set of 4.
                // Eight players: add
                // player 8: north
                $res[7] = 'N';
                // no break
            case 7:
                // Seven players: add
                // player 7: south
                $res[6] = 'S';
                // no break
            case 6:
                // Six players: add
                // player6: east
                $res[5] = 'E';
                // no break
            case 5:
                // Five players: add
                // player5: west
                $res[4] = 'W';
                // no break
            case 4:
                // Four players:
                // player1: south search
                // player2: west portal
                // player3: escalator east
                // player4: north
                $res = array_merge($res, array(
                    0 => 'SH',
                    1 => 'WP',
                    2 => 'RE',
                    3 => 'N',
                ));
        }

        return $res[($player + $flips) % $nPlayers];
    }
?>