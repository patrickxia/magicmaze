{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- MagicMaze implementation : © Patrick Xia <patrick.xia@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------
-->

<div id="mm_timer">
<div id="mm_timer_img"></div> <div id="mm_timer_numbers">--:--</div>
</div>

<div id="mm_area_container">
  <div id="mm_zoom_controls">
    <a href="#" class="mm_zoom" id="mm_zoom_in">➕</a> |
    <a href="#" class="mm_zoom" id="mm_zoom_reset">⭯</a> |
    <a href="#" class="mm_zoom" id="mm_zoom_out">➖</a> |
    <a href="#" class="mm_zoom" id="mm_zoom_fit">⬚</a>
  </div>
  <div id="mm_area_surface"></div>
  <div id="mm_area_aggregate">
    <div id="mm_area_scrollable"></div>
    <div id="mm_area_scrollable_oversurface">
      <div id="mm_token0">
        <div class="mm_action mm_actionN" style="position: absolute; left: 5px; top: -15px;">🡹</div>
        <div class="mm_action mm_actionE" style="position: absolute; left: 20px; top: 0px;">🡺</div>
        <div class="mm_action mm_actionS" style="position: absolute; left: 5px; top: 15px;">🡻</div>
        <div class="mm_action mm_actionW" style="position: absolute; left: -15px; top: 0px;">🡸</div>
      </div>
      <div id="mm_token1">
        <div class="mm_action mm_actionN" style="position: absolute; left: 5px; top: -15px;">🡹</div>
        <div class="mm_action mm_actionE" style="position: absolute; left: 20px; top: 0px;">🡺</div>
        <div class="mm_action mm_actionS" style="position: absolute; left: 5px; top: 15px;">🡻</div>
        <div class="mm_action mm_actionW" style="position: absolute; left: -15px; top: 0px;">🡸</div>
      </div>
      <div id="mm_token2">
        <div class="mm_action mm_actionN" style="position: absolute; left: 5px; top: -15px;">🡹</div>
        <div class="mm_action mm_actionE" style="position: absolute; left: 20px; top: 0px;">🡺</div>
        <div class="mm_action mm_actionS" style="position: absolute; left: 5px; top: 15px;">🡻</div>
        <div class="mm_action mm_actionW" style="position: absolute; left: -15px; top: 0px;">🡸</div>
      </div>
      <div id="mm_token3">
        <div class="mm_action mm_actionN" style="position: absolute; left: 5px; top: -15px;">🡹</div>
        <div class="mm_action mm_actionE" style="position: absolute; left: 20px; top: 0px;">🡺</div>
        <div class="mm_action mm_actionS" style="position: absolute; left: 5px; top: 15px;">🡻</div>
        <div class="mm_action mm_actionW" style="position: absolute; left: -15px; top: 0px;">🡸</div>
      </div>
    </div>
  </div>
  <a id="mm_movetop" href="#"></a>
  <a id="mm_moveleft" href="#"></a>
  <a id="mm_moveright" href="#"></a>
  <a id="mm_movedown" href="#"></a>
</div>

<div id="mm_next_explore_container">
{TEXT_NEXT_EXPLORE}
<div id="mm_next_explore">
</div>
</div>

<div id="mm_border"></div>
<div id="mm_talk_border"></div>

<div id="mm_objectives">
<div id="mm_objectives_container">
<div id="mm_objectives_front"></div>
<div id="mm_objectives_back"></div>
</div>
</div>

<div id="mm_control0" class="mm_control">
<div class="mm_actionW mm_abilityW"></div>
<div class="mm_actionN mm_abilityN"></div>
<div class="mm_actionS mm_abilityS"></div>
<div class="mm_actionE mm_abilityE"></div>
<div class="mm_actionR mm_abilityR"></div>
<div class="mm_actionH mm_abilityH"></div>
<div class="mm_actionP mm_abilityP"></div>
</div>
<div id="mm_control1" class="mm_control">
<div class="mm_actionW mm_abilityW"></div>
<div class="mm_actionN mm_abilityN"></div>
<div class="mm_actionS mm_abilityS"></div>
<div class="mm_actionE mm_abilityE"></div>
<div class="mm_actionR mm_abilityR"></div>
<div class="mm_actionH mm_abilityH"></div>
<div class="mm_actionP mm_abilityP"></div>
</div>
<div id="mm_control2" class="mm_control">
<div class="mm_actionW mm_abilityW"></div>
<div class="mm_actionN mm_abilityN"></div>
<div class="mm_actionS mm_abilityS"></div>
<div class="mm_actionE mm_abilityE"></div>
<div class="mm_actionR mm_abilityR"></div>
<div class="mm_actionH mm_abilityH"></div>
<div class="mm_actionP mm_abilityP"></div>
</div>
<div id="mm_control3" class="mm_control">
<div class="mm_actionW mm_abilityW"></div>
<div class="mm_actionN mm_abilityN"></div>
<div class="mm_actionS mm_abilityS"></div>
<div class="mm_actionE mm_abilityE"></div>
<div class="mm_actionR mm_abilityR"></div>
<div class="mm_actionH mm_abilityH"></div>
<div class="mm_actionP mm_abilityP"></div>
</div>

{TEXT_PLAYER_LIST}
<div id="playerlist">

</div>

<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

*/

</script>  

{OVERALL_GAME_FOOTER}
