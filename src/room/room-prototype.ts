import * as _ from "lodash";
import { InitPlanner } from "./planners/init-planner";
import {RoomPlannerInterface} from "./planners/room-planner-interface";
import {CreepRoleEnum} from "../creeps/roles/creep-role-enum";
import {ConstructionSiteData} from "../structures/construction/construction-site-data";
import {WaitAction} from "../creeps/actions/wait";
import {Transport} from "../creeps/roles/transport";
import {Miner} from "../creeps/roles/miner";

const getPlanner = function(room: Room): RoomPlannerInterface {
    if (room.memory && room.memory['plan']) {
        return getPlannerByName(room, room.memory['plan']);
    }

    room.memory['plan'] = 'init';
    return new InitPlanner(room);
};

function getPlannerByName(room: Room, name: string): RoomPlannerInterface {
    switch (name) {
        default: return new InitPlanner(room);
    }
}

const findNextEnergySource = function(creep: Creep) {
    let sources = _.sortBy(this.find(FIND_SOURCES_ACTIVE), function(source: Source) {
        // This might need to be faster?
        return creep.room.findPath(creep.pos, source.pos).length;
    });
    for (const source of sources) {
        const currentlyAssigned: number = this.find(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep.memory['target'] === source.id;
            }
        }).length;
        let spaces: number = this.getNumberOfMiningSpacesAtSource(source.id);
        if (currentlyAssigned < spaces) {
            return source;
        }
    }
    if (sources.length > 0) {
        return sources[0];
    }
};

const getNumberOfMiningSpacesAtSource = function(sourceId: Id<Source>) {
    return this.findNumberOfSourcesAndSpaces()['sources'][sourceId];
};

const getTotalNumberOfMiningSpaces = function() {
    return this.findNumberOfSourcesAndSpaces()['spaces'];
};

const getNumberOfSources = function() {
    return this.findNumberOfSourcesAndSpaces()['count'];
};

const findNumberOfSourcesAndSpaces = function() {
    if (this.memory['sources']) {
        return this.memory['sources'];
    }
    let numberSources = 0;
    let numberSpaces = 0;
    let sourceSpacesMap = {};
    _.forEach(this.find(FIND_SOURCES), (source: Source) => {
        let spacesAtThisSource = 0;
        numberSources++;
        const availablePositions = {};
        for (let x = source.pos.x-1; x < source.pos.x + 2; x++) {
            for (let y = source.pos.y-1; y < source.pos.y + 2; y++) {
                if (!(x < 0 || x > 49 || y < 0 || x > 49)) {
                    availablePositions[x + ":" + y] = true;
                }
            }
        }
        _.forEach(this.lookAtArea(source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true),
            (lookupObject: LookAtResultWithPos) => {
                if (lookupObject.type === 'structure' && lookupObject.structure.structureType !== STRUCTURE_ROAD &&
                        lookupObject.structure.structureType !== STRUCTURE_CONTAINER &&
                        lookupObject.structure.structureType !== STRUCTURE_RAMPART) {
                    delete availablePositions[lookupObject.x + ":" + lookupObject.y];
                } else if (lookupObject.type === 'terrain' && lookupObject.terrain !== 'swamp' &&
                        lookupObject.terrain !== 'plain') {
                    delete availablePositions[lookupObject.x + ":" + lookupObject.y];
                }
            });
        for (const key in availablePositions) {
            spacesAtThisSource++;
            numberSpaces++;
        }
        sourceSpacesMap[source.id] = spacesAtThisSource;
    });
    this.memory['sources'] = {
        count: numberSources,
        spaces: numberSpaces,
        sources: sourceSpacesMap
    };
    return this.memory['sources'];
};

const getNumberOfCreepsByRole = function(role: CreepRoleEnum): number {
    this.creepCountArray = initCreepCountArray(this.creepCountArray, this);
    return this.creepCountArray.has(role) ? this.creepCountArray.get(role) : 0;
};

function initCreepCountArray(creepCountArray: Map<CreepRoleEnum, number>, room: Room): Map<CreepRoleEnum, number> {
    if (creepCountArray === null) {
        creepCountArray = new Map();
        _.forEach(room.find(FIND_MY_CREEPS), (creep: Creep) => {
            if (creep.memory && creep.memory['role']) {
                const currentRole: CreepRoleEnum = creep.memory['role'];
                if (creepCountArray.has(currentRole)) {
                    creepCountArray.set(currentRole, creepCountArray.get(currentRole) + 1);
                } else {
                    creepCountArray.set(currentRole, 1);
                }
            }
        });
    }
    return creepCountArray;
}

const reassignAllCreeps = function(newRole: CreepRoleEnum, filter: Function) {
    if (this.creepCountArray == null) {
        this.getNumberOfCreepsByRole(newRole);
    }
    let creepReassigned = false;
    _.forEach(this.find(FIND_MY_CREEPS), (creep: Creep) => {
        if (!creepReassigned && filter(creep)) {
            const oldRole = creep.memory['role'];
            creep.memory['role'] = newRole;
            delete creep.memory['action'];
            delete creep.memory['target'];
            creepReassigned = true;
            incrementAndDecrement(this.creepCountArray, newRole, oldRole);
        }
    });
};

const reassignSingleCreep = function(newRole: CreepRoleEnum, filter: Function) {
    if (this.creepCountArray == null) {
        this.getNumberOfCreepsByRole(newRole);
    }
    let reassigned = false;
    _.forEach(this.find(FIND_MY_CREEPS), (creep: Creep) => {
        if (!reassigned && filter(creep)) {
            const oldRole = creep.memory['role'];
            creep.memory['role'] = newRole;
            delete creep.memory['action'];
            delete creep.memory['target'];
            incrementAndDecrement(this.creepCountArray, newRole, oldRole);
            reassigned = true;
        }
    });
};

function incrementAndDecrement(map: Map<CreepRoleEnum, number>, increment: CreepRoleEnum, decrement: CreepRoleEnum) {
    map.set(decrement, map.get(decrement) - 1);
    if (map.has(increment)) {
        map.set(increment, map.get(increment) + 1);
    } else {
        map.set(increment, 1);
    }
}

const isSpotOpen = function(pos:RoomPosition):boolean {
    let isThisSpotOpen = true;
    _.forEach(Game.rooms[pos.roomName].lookAt(pos), (s:LookAtResultWithPos) => {
        if (isOpen(s)) {
            isThisSpotOpen = false;
        }
    });
    return isThisSpotOpen;
}

function isOpen(s: LookAtResultWithPos): boolean {
    return !((s.type !== 'terrain' || s.terrain !== 'wall') &&
        s.type !== 'structure' && s.type !== 'constructionSite');
}

function canPlaceRampart(pos:RoomPosition):boolean {
    let isRampartOpen = true;
    _.forEach(Game.rooms[pos.roomName].lookAt(pos), (s:LookAtResultWithPos) => {
        if ((s.type === 'structure' && s.structure.structureType === STRUCTURE_RAMPART) ||
            (s.type === 'terrain' && s.terrain === 'wall') || s.type === 'constructionSite') {
            isRampartOpen = false;
        }
    });
    return isRampartOpen;
}

const makeConstructionSites = function() {
    if (this.memory['ticksTillNextConstruction']) {
        this.memory['ticksTillNextConstruction'] -= 1;
    }
    if (!this.memory.sites || this.memory['ticksTillNextConstruction']) {
        return;
    }
    this.memory['ticksTillNextConstruction'] = 120;
    let numberConstructionSites = this.find(FIND_MY_CONSTRUCTION_SITES).length;
    if (numberConstructionSites > 2) {
        return;
    }
    let constructionSites:Array<ConstructionSiteData> = [];
    let controllerLevel = this.controller ? this.controller.level : 0;
    for (let i = 0; i <= controllerLevel; i++) {
        if (this.memory.sites[i]) {
            _.forEach(this.memory.sites[i], (structureType:StructureConstant, key:string) => {
                let roomPosition = new RoomPosition(+key.split(":")[0], +key.split(":")[1], this.name);
                if (this.isSpotOpen(roomPosition)) {
                    constructionSites.push(new ConstructionSiteData(roomPosition, structureType));
                }
            });
        }
    }
    if (controllerLevel > 1) {
        _.forEach(this.memory['sites2'], (structureType:StructureConstant, key:string) => {
            let roomPosition = new RoomPosition(+key.split(":")[0], +key.split(":")[1], this.name);
            if (canPlaceRampart(roomPosition)) {
                constructionSites.push(new ConstructionSiteData(roomPosition, structureType));
            }
        });
    }
    if (constructionSites.length > 0) {
        ConstructionSiteData.sortByPriority(constructionSites, null);
        console.log(constructionSites[0].pos.roomName + " " + constructionSites[0].structureType + ": " + constructionSites[0].pos.x + "x " + constructionSites[0].pos.y + "y");
        this.createConstructionSite(constructionSites[0].pos, constructionSites[0].structureType);
        if (numberConstructionSites < 2 && constructionSites.length > 1) {
            console.log(constructionSites[1].pos.roomName + " " + constructionSites[1].structureType + ": " + constructionSites[1].pos.x + "x " + constructionSites[1].pos.y + "y");
            this.createConstructionSite(constructionSites[1].pos, constructionSites[1].structureType);
        }
        if (numberConstructionSites < 1 && constructionSites.length > 2) {
            console.log(constructionSites[2].pos.roomName + " " + constructionSites[2].structureType + ": " + constructionSites[2].pos.x + "x " + constructionSites[2].pos.y + "y");
            this.createConstructionSite(constructionSites[2].pos, constructionSites[2].structureType);
        }
    }
};

const buildMemory = function() {
    if (this.memory.complete) {
        return;
    }
    if (!this.memory['sites']) {
        if (!this.memory['sites']) {
            this.memory['sites'] = {0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}};
        }
        if (!this.memory['sites2']) {
            this.memory['sites2'] = {};
        }
        return;
    }

    if (!this.memory['exits']) {
        this.memory['exits'] = {};
        this.memory['exits'][FIND_EXIT_TOP] = findExitAndPlanWalls(FIND_EXIT_TOP, this);
        return;
    }
    if (Object.keys(this.memory['exits']).indexOf("" + FIND_EXIT_BOTTOM) === -1) {
        this.memory['exits'][FIND_EXIT_BOTTOM] = findExitAndPlanWalls(FIND_EXIT_BOTTOM, this);
        return;
    }
    if (Object.keys(this.memory['exits']).indexOf("" + FIND_EXIT_LEFT) === -1) {
        this.memory['exits'][FIND_EXIT_LEFT] = findExitAndPlanWalls(FIND_EXIT_LEFT, this);
        return;
    }
    if (Object.keys(this.memory['exits']).indexOf("" + FIND_EXIT_RIGHT) === -1) {
        this.memory['exits'][FIND_EXIT_RIGHT] = findExitAndPlanWalls(FIND_EXIT_RIGHT, this);
        return;
    }

    if (!this.controller || (!this.controller.reservation && !this.controller.my)) {
        return;
    }

    if (!this.memory.containerStructure) {
        let sources = this.find(FIND_SOURCES);
        let containerLocationsNeeded = [];
        let linkNumber = 5;
        _.forEach(sources, (source:Source) => {
            placeContainerAndLink(source.pos, linkNumber);
            linkNumber++;
            containerLocationsNeeded.push(source);
        });
        if (this.controller) {
            containerLocationsNeeded.push(this.controller);
            placeContainerAndLink(this.controller.pos, 5);
        }
        this.memory['center'] = this.getPositionAt(25, 25);
        if (containerLocationsNeeded.length) {
            this.memory['center'] = getCenterOfArray(containerLocationsNeeded, this);
        }

        let minerals = this.find(FIND_MINERALS);
        if (minerals.length) {
            this.memory['sites'][6][minerals[0].pos.x + ":" + minerals[0].pos.y] = STRUCTURE_EXTRACTOR;
        }
        this.memory.containerStructure = true;
        return;
    }

    if (!this.memory[STRUCTURE_TOWER + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        planBuildings(this, STRUCTURE_TOWER);
        return;
    }
    if (!this.memory[STRUCTURE_STORAGE + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        planBuildings(this, STRUCTURE_STORAGE);
        return;
    }
    if (!this.memory[STRUCTURE_SPAWN + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        planBuildings(this, STRUCTURE_SPAWN);
        return;
    }
    if (!this.memory[STRUCTURE_POWER_SPAWN + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        planBuildings(this, STRUCTURE_POWER_SPAWN);
        return;
    }
    if (!this.memory[STRUCTURE_TERMINAL + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        planBuildings(this, STRUCTURE_TERMINAL);
        return;
    }

    if (!this.memory.sourceRoads) {
        let pointsOfImportance = this.find(FIND_SOURCES);
        pointsOfImportance.push(this.controller);

        _.forEach(pointsOfImportance, (origin:RoomObject) => {
            _.forEach(pointsOfImportance, (destination:RoomObject) => {
                if (!origin || !destination || origin === destination) {
                    return;
                }
                let path:Array<PathStep> = origin.pos.findPathTo(destination.pos.x, destination.pos.y,
                    {ignoreCreeps: true, costCallback: getPlannedCostMatrix(this)});
                planRoadAlongPath(this, path);
            });
        });

        this.memory['sourceRoads'] = true;
        return;
    }

    if (!this.memory.exitRoads && this.memory.center) {
        let directions:Array<ExitConstant> = [ FIND_EXIT_TOP, FIND_EXIT_LEFT, FIND_EXIT_BOTTOM, FIND_EXIT_RIGHT ];
        _.forEach(directions, (direction:ExitConstant) => {
            let startPosition:RoomPosition = this.getPositionAt(25, 25);
            let exitPoint:RoomPosition = startPosition.findClosestByPath(direction);
            if (exitPoint) {
                let path:Array<PathStep> = startPosition.findPathTo(exitPoint.x, exitPoint.y,
                    {ignoreCreeps: true, costCallback: getPlannedCostMatrix(this)});
                planRoadAlongPath(this, path);
            }
        });
        this.memory['exitRoads'] = true;
        return;
    }

    // TODO break this up into multiple ticks?
    if (!this.memory[STRUCTURE_EXTENSION + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        planBuildings(this, STRUCTURE_EXTENSION);
        return;
    }

    // this.memory['complete'] = true;
};

function findExitAndPlanWalls(exit:ExitConstant, room:Room):boolean {
    if (!room.memory['sites2']) {
        room.memory['sites2'] = {};
    }
    if (!room.memory['sites']) {
        room.memory['sites'] = {0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}};
    }
    if (!room.memory['sites'][2]) {
        room.memory['sites'][2] = {};
    }
    let exitExists = false;
    let x = -1;
    let y = -1;
    let isX = false;
    let exits = [];
    let exitSize = 0;
    for (let dynamicCoord=2; dynamicCoord<49; dynamicCoord++) {
        if (exit === FIND_EXIT_TOP) {
            y = 2;
            x = dynamicCoord;
            isX = true;
        } else if (exit === FIND_EXIT_BOTTOM) {
            y = 47;
            x = dynamicCoord;
            isX = true;
        } else if (exit === FIND_EXIT_RIGHT) {
            x = 47;
            y = dynamicCoord;
        } else if (exit === FIND_EXIT_LEFT) {
            x = 2;
            y = dynamicCoord;
        }
        let isRampart = false;
        let spotHasNoWall = false;
        if (isX) {
            let newY = y === 2 ? 0 : 49;
            spotHasNoWall = _.filter(room.lookAt(x, newY), (c:LookAtResultWithPos) => {
                if (c.type === 'structure' && c.structure.structureType !== STRUCTURE_RAMPART &&
                    c.structure.structureType !== STRUCTURE_WALL) {
                    isRampart = true;
                }
                return c.type === 'terrain' && c.terrain === 'wall';
            }).length < 1;
        } else {
            let newX = x === 2 ? 0 : 49;
            spotHasNoWall = _.filter(room.lookAt(newX, y), (c:LookAtResultWithPos) => {
                if (c.type === 'structure' && c.structure.structureType !== STRUCTURE_RAMPART &&
                    c.structure.structureType !== STRUCTURE_WALL) {
                    isRampart = true;
                }
                return c.type === 'terrain' && c.terrain === 'wall';
            }).length < 1;
        }
        if (spotHasNoWall) {
            if (exitSize === 0) {
                if (isX) {
                    if (isSpotOpen(new RoomPosition(x - 1, y, room.name))) {
                        room.memory['sites'][2][(x - 1) + ":" + y] = STRUCTURE_WALL;
                    }
                    if (isSpotOpen(new RoomPosition(x - 1, y, room.name))) {
                        room.memory['sites'][2][(x - 2) + ":" + y] = STRUCTURE_WALL;
                    }
                    let newY = y === 2 ? 1 : 48;
                    if (isSpotOpen(new RoomPosition(x - 1, newY, room.name))) {
                        room.memory['sites'][2][(x - 2) + ":" + newY] = STRUCTURE_WALL;
                    }
                } else {
                    if (isSpotOpen(new RoomPosition(x, y - 1, room.name))) {
                        room.memory['sites'][2][x + ":" + (y - 1)] = STRUCTURE_WALL;
                    }
                    if (isSpotOpen(new RoomPosition(x, y - 1, room.name))) {
                        room.memory['sites'][2][x + ":" + (y - 2)] = STRUCTURE_WALL;
                    }
                    let newX = x === 2 ? 1 : 48;
                    if (isSpotOpen(new RoomPosition(newX, y - 1, room.name))) {
                        room.memory['sites'][2][newX + ":" + (y - 2)] = STRUCTURE_WALL;
                    }
                }
            }
            exitSize += 1;
            if (isRampart) {
                room.memory['sites2'][x + ":" + y] = STRUCTURE_RAMPART;
            } else {
                room.memory['sites'][2][x + ":" + y] = STRUCTURE_WALL;
            }
        } else if (exitSize) {
            if (isX) {
                if (isSpotOpen(new RoomPosition(x, y, room.name))) {
                    room.memory['sites'][2][x + ":" + y] = STRUCTURE_WALL;
                }
                if (isSpotOpen(new RoomPosition(x + 1, y, room.name))) {
                    room.memory['sites'][2][(x + 1) + ":" + y] = STRUCTURE_WALL;
                }
                let newY = y === 2 ? 1 : 48;
                if (isSpotOpen(new RoomPosition(x + 1, newY, room.name))) {
                    room.memory['sites'][2][(x + 1) + ":" + newY] = STRUCTURE_WALL;
                }
            } else {
                if (isSpotOpen(new RoomPosition(x, y, room.name))) {
                    room.memory['sites'][2][x + ":" + y] = STRUCTURE_WALL;
                }
                if (isSpotOpen(new RoomPosition(x, y + 1, room.name))) {
                    room.memory['sites'][2][x + ":" + (y + 1)] = STRUCTURE_WALL;
                }
                let newX = x === 2 ? 1 : 48;
                if (isSpotOpen(new RoomPosition(newX, y + 1, room.name))) {
                    room.memory['sites'][2][newX + ":" + (y + 1)] = STRUCTURE_WALL;
                }
            }
            exits.push(dynamicCoord - Math.round(exitSize / 2));
            exitSize = 0;
        }
        exitExists = exitExists || spotHasNoWall;
    }

    // TODO check if exit works or if needs to shift
    for (let exitIndex = 0; exitIndex < exits.length; exitIndex++) {
        if (isX) {
            delete room.memory['sites'][2][(exits[exitIndex] - 1) + ":" + y];
            delete room.memory['sites'][2][exits[exitIndex] + ":" + y];
            delete room.memory['sites'][2][(exits[exitIndex] + 1) + ":" + y];
            room.memory['sites2'][(exits[exitIndex] - 1) + ":" + y] = STRUCTURE_RAMPART;
            room.memory['sites2'][exits[exitIndex] + ":" + y] = STRUCTURE_RAMPART;
            room.memory['sites2'][(exits[exitIndex] + 1) + ":" + y] = STRUCTURE_RAMPART;
        } else {
            delete room.memory['sites'][2][x + ":" + (exits[exitIndex] - 1)];
            delete room.memory['sites'][2][x + ":" + exits[exitIndex]];
            delete room.memory['sites'][2][x + ":" + (exits[exitIndex] + 1)];
            room.memory['sites2'][x + ":" + (exits[exitIndex] - 1)] = STRUCTURE_RAMPART;
            room.memory['sites2'][x + ":" + exits[exitIndex]] = STRUCTURE_RAMPART;
            room.memory['sites2'][x + ":" + (exits[exitIndex] + 1)] = STRUCTURE_RAMPART;
        }
    }
    return exitExists;
}

function getCenterOfArray(roomObjects:Array<RoomObject>, room:Room):RoomPosition {
    let maxX = 50;
    let minX = 0;
    let maxY = 50;
    let minY = 0;
    let roomName = room.name;
    _.forEach(roomObjects, (entity:RoomObject) => {
        if (!entity || !entity.pos) {
            return;
        }
        maxX = entity.pos.x > maxX ? entity.pos.x : maxX;
        minX = entity.pos.x < minX ? entity.pos.x : minX;
        maxY = entity.pos.y > maxY ? entity.pos.y : maxY;
        minY = entity.pos.y < minY ? entity.pos.y : minY;
    });
    let x = Math.round(minX + Math.floor(Math.abs(maxX - minX) / 2));
    let y = Math.round(minY + Math.floor(Math.abs(maxY - minY) / 2));
    return new RoomPosition(x, y, roomName);
}

function getPlannedCostMatrix(room:Room) {
    return (roomName:string, costMatrix:CostMatrix):CostMatrix => {
        if (roomName == room.name) {
            for (let i = 0; i < 9; i++) {
                _.forEach(room.memory['sites'][i], (value, key) => {
                    if (value !== STRUCTURE_ROAD) {
                        costMatrix.set(+key.split(":")[0], +key.split(":")[1], 256);
                    }
                });
            }
        }
        return costMatrix;
    }
}

function planRoadAlongPath(room:Room, path:Array<PathStep>) {
    if (path != null && path.length > 0) {
        _.forEach(path, (pathStep:PathStep) => {
            if (pathStep.x !== 0 && pathStep.y !== 0 &&
                pathStep.x !== 49 && pathStep.y !== 49 &&
                !hasPlannedStructureAt(new RoomPosition(pathStep.x, pathStep.y, room.name))) {
                room.memory['sites'][0][pathStep.x + ":" + pathStep.y] = STRUCTURE_ROAD;
            }
        });
    }
}

function loopFromCenter(room:Room, x:number, y:number, size:number, callback:Function) {
    let d = 3;
    let c = 0;
    let s = 1;

    for (let k=1;k<=(size - 1); k++) {
        for (let j=0; j < (k<(size-1) ? 2 : 3); j++) {
            for (let i=0; i<s; i++) {
                if (callback(x, y)) {
                    return;
                }

                c++;
                switch (d) {
                    case 0: y = y+1; break;
                    case 1: x = x+1; break;
                    case 2: y = y-1; break;
                    case 3: x = x-1; break;
                }
            }
            d = (d+1)%4;
        }
        s = s+1;
    }
    callback(x, y);
}

function getPositionWithBuffer(room:Room, buffer:number, type:StructureConstant):ConstructionSiteData {
    let center:RoomPosition = room.memory['center'];
    if (!room.memory['loopCenter']) {
        room.memory['loopCenter'] = {};
    }
    let size:number = 38 - 2 * Math.max(Math.abs(center.x - 25), Math.abs(center.y - 25));
    let siteFound:ConstructionSiteData = null;
    loopFromCenter(room, center.x, center.y, size, (currentX:number, currentY:number) => {
        if (room.memory['loopCenter'][currentX + ":" + currentY]) {
            return false;
        }
        room.memory['loopCenter'][currentX + ":" + currentY] = true;
        let positionOk = true;
        let currentPlannedPosition:RoomPosition = new RoomPosition(currentX, currentY, room.name);
        if (hasPlannedStructureAt(currentPlannedPosition) || _.filter(room.lookAt(currentX, currentY), (c) => {
            return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall'); }).length) {
            positionOk = false;
        }
        if (buffer > 0 && positionOk) {
            loopFromCenter(room, currentX, currentY, 1 + 2 * buffer, (bufferX:number, bufferY:number) => {
                let currentBufferPosition:RoomPosition = new RoomPosition(bufferX, bufferY, room.name);
                if (hasPlannedStructureAt(currentBufferPosition) || _.filter(room.lookAt(bufferX, bufferY),(c:LookAtResultWithPos) => {
                    return c.type === 'structure' && c.structure.structureType !== STRUCTURE_ROAD; }).length) {
                    positionOk = false;
                    return true;
                }
                return false;
            });
        }
        if (positionOk) {
            siteFound = new ConstructionSiteData(new RoomPosition(currentX, currentY, room.name), type);
            return true;
        }
        return false;
    });
    return siteFound;
}

function planBuildings(room:Room, structureType:StructureConstant) {
    let alreadyPlaced:Array<Structure> = room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
            return s.structureType === structureType;
        }});
    let numberAlreadyPlanned = 0;
    _.forEach(alreadyPlaced, (s:Structure) => {
        for (let i = 0; i < 9; i++) {
            if (numberAlreadyPlanned < CONTROLLER_STRUCTURES[structureType][i]) {
                numberAlreadyPlanned++;
                room.memory['sites'][i][s.pos.x + ":" + s.pos.y] = structureType;
                if (structureType === STRUCTURE_SPAWN || structureType === STRUCTURE_STORAGE ||
                    structureType === STRUCTURE_TOWER || structureType === STRUCTURE_LINK ||
                    structureType === STRUCTURE_TERMINAL || structureType === STRUCTURE_LAB) {
                    room.memory['sites2'][s.pos.x + ":" + s.pos.y] = STRUCTURE_RAMPART;
                }
                return;
            }
        }
    });
    let numberPlaced = alreadyPlaced.length;
    for (let i = 0; i < 9; i++) {
        while (numberPlaced < CONTROLLER_STRUCTURES[structureType][i]) {
            numberPlaced++;
            let constructionSiteData:ConstructionSiteData = getPositionWithBuffer(room, 1, structureType);
            if (constructionSiteData) {
                room.memory['sites'][i][constructionSiteData.pos.x + ":" + constructionSiteData.pos.y] = structureType;
            }
        }
    }
    room.memory[structureType + 'Structure'] = true;
}

function placeContainerAndLink(pos:RoomPosition, linkNumber:number) {
    let room:Room = Game.rooms[pos.roomName];
    if (!room) {
        return;
    }
    let positionMap = {};
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            positionMap[(pos.x + i) + ":" + (pos.y + j)] = new RoomPosition(pos.x + i, pos.y + j, pos.roomName);
        }
    }
    let containerPos = null;
    let linkPos = null;
    _.forEach(Game.rooms[pos.roomName].lookAtArea(pos.y-1, pos.x-1, pos.y+1, pos.x+1, true), (s:LookAtResultWithPos) => {
        if (!positionMap[s.x + ":" + s.y]) {
            return;
        }
        if (s.type === 'structure' && s.structure.structureType === STRUCTURE_CONTAINER) {
            containerPos = new RoomPosition(s.x, s.y, room.name);
            delete positionMap[s.x + ":" + s.y];
            return;
        }
        if (s.type === 'structure' && s.structure.structureType === STRUCTURE_LINK) {
            linkPos = new RoomPosition(s.x, s.y, room.name);
            delete positionMap[s.x + ":" + s.y];
            return;
        }
        if (isOpen(s)) {
            delete positionMap[s.x + ":" + s.y];
            return;
        }
    });
    if (containerPos) {
        room.memory['sites'][0][containerPos.x + ":" + containerPos.y] = STRUCTURE_CONTAINER;
    }
    if (linkPos) {
        room.memory['sites'][5][linkPos.x + ":" + linkPos.y] = STRUCTURE_LINK;
    }
    if (containerPos && linkPos) {
        return;
    }
    for (let key in positionMap) {
        if (key && positionMap[key]) {
            if (!containerPos) {
                containerPos = positionMap[key];
                room.memory['sites'][0][key] = STRUCTURE_CONTAINER;
            } else if (!linkPos) {
                linkPos = positionMap[key];
                room.memory['sites'][linkNumber][key] = STRUCTURE_LINK;
            }
        }
    }
    if (!linkPos && containerPos) {
        let nextAvailablePosition = this.getFirstOpenAdjacentSpot(containerPos);
        if (nextAvailablePosition) {
            linkPos = nextAvailablePosition;
            room.memory['sites'][linkNumber][linkPos.x + ":" + linkPos.y] = STRUCTURE_LINK;
        }
    }
}

function getFirstOpenAdjacentSpot(pos:RoomPosition):RoomPosition {
    let positionMap = {};
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            positionMap[(pos.x + i) + ":" + (pos.y + j)] = new RoomPosition(pos.x + i, pos.y + j, pos.roomName);
        }
    }
    _.forEach(Game.rooms[pos.roomName].lookAtArea(pos.y-1, pos.x-1, pos.y+1, pos.x+1, true), (s:LookAtResultWithPos) => {
        if (!positionMap[s.x + ":" + s.y]) {
            return;
        }
        if (hasPlannedStructureAt(new RoomPosition(s.x, s.y, pos.roomName))) {
            delete positionMap[s.x + ":" + s.y];
            return;
        }
        if (isOpen(s)) {
            delete positionMap[s.x + ":" + s.y];
        }
    });
    for (let key in positionMap) {
        if (key && positionMap[key]) {
            return positionMap[key];
        }
    }
    return null;
}

function hasPlannedStructureAt(roomPosition:RoomPosition):boolean {
    const room = Game.rooms[roomPosition.roomName];
    if (!room.memory['sites']) {
        return false;
    }
    for (let i = 0; i < 9; i++) {
        let key = roomPosition.x + ":" + roomPosition.y;
        if (room.memory['sites'][i] && room.memory['sites'][i][key]) {
            return true;
        }
    }
    return false;
}

const reassignIdleCreep = function(creep: Creep) {
    const oldRole = creep.memory['role'];
    if (oldRole == Transport.KEY || oldRole == Miner.KEY) {
        WaitAction.setActionUntilNextTick(creep);
        return;
    }
    const newRoleObj = getPlanner(this).getNextReassignRole();
    if (newRoleObj == null) {
        WaitAction.setActionUntilNextTick(creep);
        return;
    }
    const newRole = newRoleObj.newRole;
    if (newRole == oldRole) {
        WaitAction.setActionUntilNextTick(creep);
        return;
    }
    creep.memory['role'] = newRole;
    delete creep.memory['action'];
    delete creep.memory['target'];
    incrementAndDecrement(this.creepCountArray, newRole, oldRole);
}

declare global {
    interface Room {
        reassignAllCreeps(newRole: CreepRoleEnum, filter: Function);
        reassignSingleCreep(newRole: CreepRoleEnum, filter: Function);
        planner: RoomPlannerInterface;
        creepCountArray: Map<CreepRoleEnum, number>;
        getPlanner(room: Room): RoomPlannerInterface;
        getNumberOfCreepsByRole(role: string): number;
        findNextEnergySource(creep: Creep): Source;
        getNumberOfMiningSpacesAtSource(sourceId: Id<Source>): number;
        getTotalNumberOfMiningSpaces(): number;
        getNumberOfSources(): number;
        findNumberOfSourcesAndSpaces();
        makeConstructionSites();
        isSpotOpen(pos: RoomPosition): boolean;
        buildMemory();
        reassignIdleCreep(creep: Creep);
    }
}

export class RoomPrototype {
    static init() {
        Room.prototype.reassignAllCreeps = reassignAllCreeps;
        Room.prototype.reassignSingleCreep = reassignSingleCreep;
        Room.prototype.planner = null;
        Room.prototype.creepCountArray = null;
        Room.prototype.getNumberOfCreepsByRole = getNumberOfCreepsByRole;
        Room.prototype.findNextEnergySource = findNextEnergySource;
        Room.prototype.getNumberOfMiningSpacesAtSource = getNumberOfMiningSpacesAtSource;
        Room.prototype.getTotalNumberOfMiningSpaces = getTotalNumberOfMiningSpaces;
        Room.prototype.getNumberOfSources = getNumberOfSources;
        Room.prototype.getPlanner = getPlanner;
        Room.prototype.findNumberOfSourcesAndSpaces = findNumberOfSourcesAndSpaces;
        Room.prototype.makeConstructionSites = makeConstructionSites;
        Room.prototype.isSpotOpen = isSpotOpen;
        Room.prototype.buildMemory = buildMemory;
        Room.prototype.reassignIdleCreep = reassignIdleCreep;
    }
}
