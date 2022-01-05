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
        Room.prototype.reassignIdleCreep = reassignIdleCreep;
    }
}
