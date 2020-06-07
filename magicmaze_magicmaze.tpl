{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- MagicMaze implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    magicmaze_magicmaze.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->

Double click on warps to warp.
<div id="nuke" style="display: none;">nuke it</div>
<div id="timer">
Time remaining: <div id="timer_numbers">--:--</div>
</div>

<div id="area_container">
  <div id="area_scrollable"></div>
  <div id="area_surface"></div>
  <div id="area_scrollable_oversurface">
    <div id="token0"></div>
    <div id="token1"></div>
    <div id="token2"></div>
    <div id="token3"></div>
  </div>
  <a id="movetop" href="#"></a>
  <a id="moveleft" href="#"></a>
  <a id="moveright" href="#"></a>
  <a id="movedown" href="#"></a>
</div>

<div id="next_explore_container">
Next explore tile:
<div id="next_explore">
</div>
</div>


<div id="border"></div>

<table id="controls0">
<tr><td colspan="3" class="actionN">Up</td></tr>
<tr><td class="actionW">Left</td><td>Green</td><td class="actionE">Right</td></tr>
<tr><td colspan="3" class="actionS">Down</td></tr>
<tr><td colspan="3" class="actionH">Explore</td></tr>
<tr><td colspan="3" class="actionR">Escalator</td></tr>
</table>

<table id="controls1">
<tr><td colspan="3" class="actionN">Up</td></tr>
<tr><td class="actionW">Left</td><td>Orange</td><td class="actionE">Right</td></tr>
<tr><td colspan="3" class="actionS">Down</td></tr>
<tr><td colspan="3" class="actionH">Explore</td></tr>
<tr><td colspan="3" class="actionR">Escalator</td></tr>
</table>

<table id="controls2">
<tr><td colspan="3" class="actionN">Up</td></tr>
<tr><td class="actionW">Left</td><td>Yellow</td><td class="actionE">Right</td></tr>
<tr><td colspan="3" class="actionS">Down</td></tr>
<tr><td colspan="3" class="actionH">Explore</td></tr>
<tr><td colspan="3" class="actionR">Escalator</td></tr>
</table>

<table id="controls3">
<tr><td colspan="3" class="actionN">Up</td></tr>
<tr><td class="actionW">Left</td><td>Purple</td><td class="actionE">Right</td></tr>
<tr><td colspan="3" class="actionS">Down</td></tr>
<tr><td colspan="3" class="actionH">Explore</td></tr>
<tr><td colspan="3" class="actionR">Escalator</td></tr>
</table>

<div id="playerlist">

</div>

<div id="giganticRedPawn">
</div>


<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

*/

</script>  

{OVERALL_GAME_FOOTER}
