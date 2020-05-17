// eslint-disable-next-line no-unused-vars
function getRoles (nPlayers, player, flips) {
  nPlayers = parseInt(nPlayers)
  player = parseInt(player)
  flips = parseInt(flips)
  let res = []
  switch (nPlayers) {
    case 2:
      // Two players:
      // player1: escalator search south west
      // player2: portal north east
      res = ['RHSW', 'PNE']
      break
    case 3:
      // Three players:
      // player1: north east
      // player2: west portal
      // player3: escalator search south
      res = ['NE', 'WP', 'RHS']
      break
    case 8:
      // 4-8 players use the same base set of 4.
      // Eight players: add
      // player 8: north
      res[7] = 'N'
      // fallthrough
    case 7:
      // Seven players: add
      // player 7: south
      res[6] = 'S'
      // fallthrough
    case 6:
      // Six players: add
      // player6: east
      res[5] = 'E'
      // fallthrough
    case 5:
      // Five players: add
      // player5: west
      res[4] = 'W'
      // fallthrough
    case 4:
      // Four players:
      // player1: south search
      // player2: west portal
      // player3: escalator east
      // player4: north
      res[0] = 'SH'
      res[1] = 'WP'
      res[2] = 'RE'
      res[3] = 'N'
  }
  console.log(res)
  return res[(player + flips) % nPlayers]
}
