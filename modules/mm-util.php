<?php
// Token and game settings utility functions.

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

function tokenName($tokenID) {
    switch ($tokenID) {
        case 0:
            return clienttranslate('elf');
        case 1:
            return clienttranslate('dwarf');
        case 2:
            return clienttranslate('barbarian');
        case 3:
            return clienttranslate('mage');
        default:
            throw new Exception('invalid token ID');
    }
}

function isElf($tokenID) {
    return intval($tokenID) === 0;
}

function isDwarf($tokenID) {
    return intval($tokenID) === 1;
}

function isBarbarian($tokenID) {
    return intval($tokenID) === 2;
}

define('MAGE_ID', 3);
function isMage($tokenID) {
    return intval($tokenID) === MAGE_ID;
}
