<?php

define('MAGE', 3);

function updateEscalatorQuery($tokenID) {
    return <<<SQL
update
    `tokens` t
join
    `escalators` e
on t.position_x = e.old_x and t.position_y = e.old_y
set t.position_x = e.new_x, t.position_y = e.new_y
where
    t.token_id = $tokenID
and not t.locked
and not exists (
    select 1 from (select * from `tokens` for update) t2
    where t2.position_x = e.new_x and t2.position_y = e.new_y
)
SQL;
}

function wizExploreQuery() {
    $mage = MAGE;

    return <<<SQL
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
}

function findLockedTokenQuery($tokenID) {
    return <<<SQL
select
  position_x, position_y, find_tile(position_x, position_y) tile_id
from tokens
where
  token_id = $tokenID
  and
  locked
SQL;
}

function findLockedTokensQuery() {
    return <<<SQL
select
  token_id, position_x, position_y, find_tile(position_x, position_y) tile_id
from tokens where locked;
SQL;
}

function exploreAllEligibleQuery() {
    return <<<SQL
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
}

function warpToLocationQuery($x, $y) {
    return <<<SQL
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
}

function checkVictoryConditionQuery($target) {
    return <<<SQL
select
    1
from tokens t join properties p
on t.token_id = p.token_id
where p.property = "$target"
and t.position_x = p.position_x
and t.position_y = p.position_y
SQL;
}

function getTokenInfoQuery($tokenID) {
    return <<<SQL
select
    t.token_id, t.position_x, t.position_y, p.property
from
    tokens t
    left join
    properties p
    on t.position_x = p.position_x and t.position_y = p.position_y
where
    t.token_id = $tokenID
SQL;
}

function attemptConsumeTimerQuery($x, $y) {
    return <<<SQL
update properties
set property = 'used'
where position_x = $x
and position_y = $y
and exists
    (select
    count(*)
    from (select * from properties where property = 'camera') p
    having count(*) < 2)
SQL;
}

function attemptConsumeCameraQuery($x, $y) {
    return <<<SQL
update properties
set property = 'used'
where position_x = $x
and position_y = $y
SQL;
}

function getTokenExploringQuery($x, $y) {
    return <<<SQL
select t.token_id from tokens t
join properties p
on t.token_id = p.token_id
where
p.position_x = t.position_x
and p.position_y = t.position_y
and p.position_x = $x
and p.position_y = $y
and (p.property = 'explore')
SQL;
}

function consumeMageTileQuery() {
    $mage = MAGE;

    return <<<SQL
update tokens t
join properties p
on t.position_x = p.position_x and t.position_y = p.position_y
set p.property = 'used'
where t.token_id = $mage
SQL;
}

function findConsumedMageTileQuery() {
    $mage = MAGE;

    return <<<SQL
select
    t.position_x, t.position_y
from
    tokens t
    join
    properties p
    on t.position_x = p.position_x and t.position_y = p.position_y
where
    t.token_id = $mage and p.property = "used"
SQL;
}

function placeTileQuery($id, $x, $y, $rotation) {
    return <<<SQL
update tiles set
    placed = true,
    position_x = $x,
    position_y = $y,
    rotation = $rotation
where tile_id = $id and
not exists (
    select 1 from (select * from tiles for update) t2
    where position_x = $x and position_y = $y
)
SQL;
}

function deleteUnneededExplores($id) {
    return <<<SQL
delete from properties where
property = 'explore' and
(
    (case when find_tile(position_x + 1, position_y) is null then 1 else 0 end)
    +
    (case when find_tile(position_x - 1, position_y) is null then 1 else 0 end)
    +
    (case when find_tile(position_x, position_y + 1) is null then 1 else 0 end)
    +
    (case when find_tile(position_x, position_y - 1) is null then 1 else 0 end)
) = 0
SQL;
}

function giveReflexionTime($time) {
    return <<<SQL
update player
set player_start_reflexion_time = now(),
player_remaining_reflexion_time = $time;
SQL;
}
