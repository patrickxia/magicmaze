
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- MagicMaze implementation : © <Your name here> <Your email address here
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

create table `tiles` (
    `tile_id` int unsigned not null,
    `position_x` int not null,
    `position_y` int not null,
    `rotation` int not null, 
     primary key (`tile_id`)
) ENGINE=InnoDB;

create table `tokens` (
    `token_id` int unsigned not null,
    `position_x` int not null,
    `position_y` int not null,
    primary key (`token_id`)
) ENGINE=InnoDB;

-- needs dwarf-walls
create table `walls` (
    `old_x` int not null,
    `old_y` int not null,
    `new_x` int not null,
    `new_y` int not null,
    primary key (`old_x`, `old_y`, `new_x`, `new_y`)
) ENGINE=InnoDB;

alter table `player` add `current_role` int unsigned not null;