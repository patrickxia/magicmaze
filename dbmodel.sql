
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- MagicMaze implementation : © <Your name here> <Your email address here
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

create table `tiles` (
    `tile_id` int unsigned not null,
    `placed` bool not null default false,
    `tile_order` int not null,
    `position_x` int,
    `position_y` int,
    `rotation` int,
     primary key (`tile_id`)
) ENGINE=InnoDB;

create function find_tile(x int, y int) returns int begin
  return (select tile_id from tiles where
    x - position_x between 0 and 3
    and y - position_y between 0 and 3);
end;

-- The token that initiates an explore half-step is locked.
-- This stops people from invalidly moving a meeple when the person is
-- trying to decide where to put the tile(s). This is much cleaner for
-- all sorts of races (including if the timer is flipped when the person
-- is looking at tiles).

-- `dummy` is used for a half-step to reduce the number of db roundtrips.
-- You can remove it when the feature request
-- https://forum.boardgamearena.com/viewtopic.php?f=12&t=15723
-- is resolved.
create table `tokens` (
    `token_id` int unsigned not null,
    `position_x` int not null,
    `position_y` int not null,
    `locked` bool not null default false,
    `dummy` bool not null default false,
    primary key (`token_id`)
) ENGINE=InnoDB;


create table `walls` (
    `old_x` int not null,
    `old_y` int not null,
    `new_x` int not null,
    `new_y` int not null,
    `dwarf` bool not null default false,
    primary key (`old_x`, `old_y`, `new_x`, `new_y`)
) ENGINE=InnoDB;

create table `escalators` (
    `old_x` int not null,
    `old_y` int not null,
    `new_x` int not null,
    `new_y` int not null,
    primary key (`old_x`, `old_y`, `new_x`, `new_y`)
) ENGINE=InnoDB;

create table `properties` (
    `position_x` int not null,
    `position_y` int not null,
    `token_id` int,
    `property` varchar(32) not null,
    primary key (`position_x`, `position_y`)
) ENGINE=InnoDB;

alter table `player` add `current_role` int unsigned not null;