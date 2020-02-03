module.exports = function () {
    // Require lodash
    global._ = require('lodash');

    // Merge constants into global.
    global = _.merge(global, {
        TOP: 1,
        TOP_RIGHT: 2,
        RIGHT: 3,
        BOTTOM_RIGHT: 4,
        BOTTOM: 5,
        BOTTOM_LEFT: 6,
        LEFT: 7,
        TOP_LEFT: 8,

        LOOK_CREEPS: "creep",
        LOOK_ENERGY: "energy",
        LOOK_RESOURCES: "resource",
        LOOK_SOURCES: "source",
        LOOK_MINERALS: "mineral",
        LOOK_STRUCTURES: "structure",
        LOOK_FLAGS: "flag",
        LOOK_CONSTRUCTION_SITES: "constructionSite",
        LOOK_NUKES: "nuke",
        LOOK_TERRAIN: "terrain",

        STRUCTURE_SPAWN: "spawn",
        STRUCTURE_EXTENSION: "extension",
        STRUCTURE_ROAD: "road",
        STRUCTURE_WALL: "constructedWall",
        STRUCTURE_RAMPART: "rampart",
        STRUCTURE_KEEPER_LAIR: "keeperLair",
        STRUCTURE_PORTAL: "portal",
        STRUCTURE_CONTROLLER: "controller",
        STRUCTURE_LINK: "link",
        STRUCTURE_STORAGE: "storage",
        STRUCTURE_TOWER: "tower",
        STRUCTURE_OBSERVER: "observer",
        STRUCTURE_POWER_BANK: "powerBank",
        STRUCTURE_POWER_SPAWN: "powerSpawn",
        STRUCTURE_EXTRACTOR: "extractor",
        STRUCTURE_LAB: "lab",
        STRUCTURE_TERMINAL: "terminal",
        STRUCTURE_CONTAINER: "container",
        STRUCTURE_NUKER: "nuker",

        CONTROLLER_STRUCTURES: {
            "spawn": {0: 0, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 3},
            "extension": {0: 0, 1: 0, 2: 5, 3: 10, 4: 20, 5: 30, 6: 40, 7: 50, 8: 60},
            "link": {1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 6: 3, 7: 4, 8: 6},
            "road": {0: 2500, 1: 2500, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
            "constructedWall": {1: 0, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
            "rampart": {1: 0, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
            "storage": {1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1},
            "tower": {1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 6},
            "observer": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1},
            "powerSpawn": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1},
            "extractor": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1},
            "terminal": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1},
            "lab": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 3, 7: 6, 8: 10},
            "container": {0: 5, 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5},
            "nuker": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1}
        },

        WORK: {type: "work", hits: 100, buildCost: 100},
        CARRY: {type: "carry", hits: 100, buildCost: 50},
        MOVE: {type: "move", hits: 100, buildCost: 50},
        ATTACK: {type: "attack", hits: 100, buildCost: 80},
        RANGED_ATTACK: {type: "ranged_attack", hits: 100, buildCost: 150},
        HEAL: {type: "heal", hits: 100, buildCost: 250},
        CLAIM: {type: "claim", hits: 100, buildCost: 600},
        TOUGH: {type: "tough", hits: 100, buildCost: 10},

        //resources
        RESOURCE_ENERGY: 'energy',

        //ERRORS
        OK: 0,
        ERR_NOT_OWNER: -1,
        ERR_NO_PATH: -2,
        ERR_NAME_EXISTS: -3,
        ERR_BUSY: -4,
        ERR_NOT_FOUND: -5,
        ERR_NOT_ENOUGH_ENERGY: -6,
        ERR_NOT_ENOUGH_RESOURCES: -6,
        ERR_INVALID_TARGET: -7,
        ERR_FULL: -8,
        ERR_NOT_IN_RANGE: -9,
        ERR_INVALID_ARGS: -10,
        ERR_TIRED: -11,
        ERR_NO_BODYPART: -12,
        ERR_NOT_ENOUGH_EXTENSIONS: -6,
        ERR_RCL_NOT_ENOUGH: -14,
        ERR_GCL_NOT_ENOUGH: -15,

        //FIND constants
        FIND_EXIT_TOP: 1,
        FIND_EXIT_RIGHT: 3,
        FIND_EXIT_BOTTOM: 5,
        FIND_EXIT_LEFT: 7,
        FIND_EXIT: 10,
        FIND_CREEPS: 101,
        FIND_MY_CREEPS: 102,
        FIND_HOSTILE_CREEPS: 103,
        FIND_SOURCES_ACTIVE: 104,
        FIND_SOURCES: 105,
        FIND_DROPPED_ENERGY: -106,
        FIND_DROPPED_RESOURCES: 106,
        FIND_STRUCTURES: 107,
        FIND_MY_STRUCTURES: 108,
        FIND_HOSTILE_STRUCTURES: 109,
        FIND_FLAGS: 110,
        FIND_CONSTRUCTION_SITES: 111,
        FIND_MY_SPAWNS: 112,
        FIND_HOSTILE_SPAWNS: 113,
        FIND_MY_CONSTRUCTION_SITES: 114,
        FIND_HOSTILE_CONSTRUCTION_SITES: 115,
        FIND_MINERALS: 116,
        FIND_NUKES: 117,
        FIND_TOMBSTONES: 118,


    });

    let gameObjects = [];


    let controller1 = require('./controller')('Controller1');
    let room1 = require('./room')('Room1', controller1);
    let gameSpawns = {};
    gameSpawns.Spawn1 = require('./structuretypes/structure-spawn')('Spawn1', 12, 25, room1);

    // Game properties
    global.Game = {
        creeps: {},
        flags: {},
        rooms: {"Room1": room1},
        structures: {},
        spawns: gameSpawns,
        time: Math.floor(new Date().getTime() / 1000),
        getObjectById: function(id) {
            gameObjects =  _.merge(gameObjects, this.creeps);
            gameObjects =  _.merge(gameObjects, this.rooms);
            gameObjects =  _.merge(gameObjects, this.rooms.Room1.entities.FIND_CONSTRUCTION_SITES);
            gameObjects =  _.merge(gameObjects, this.rooms.Room1.entities.FIND_STRUCTURES);
            gameObjects =  _.merge(gameObjects, this.rooms.Room1.entities.FIND_SOURCES);
            gameObjects =  _.merge(gameObjects, this.rooms.Room1.entities.FIND_CREEPS);
            let returnArray = {};
            _.forEach(gameObjects, (object) => {
                if (object.id) {
                    returnArray[object.id] = object;
                } else if (object.name) {
                    returnArray[object.name] = object;
                }
            });
            return returnArray[id];
        }
    };

    // Game's memory properties
    global.Memory = {
        creeps: {},
        spawns: {},
        rooms: {
            "Room1": room1
        }
    };

    global.Map = function () {};

    var roomCount = 0;
    global.Room = function () {
        this.name = 'TestingRoom' + (++roomCount);
        this.memory = {}
    };

    global.RoomPosition = function (x, y, roomName) {
        this.x = x;
        this.y = y;
        this.roomName = roomName;

    };
    global.RoomPosition.prototype.lookFor = function () {};

    var sourceCount = 0;
    global.Source = function () {
        this.id = 'TestingSource' + (++sourceCount);
    };
};