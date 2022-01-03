import * as _ from "lodash";
import { InitPlanner } from "./planners/init-planner";
import {RoomPlannerInterface} from "./planners/room-planner-interface";
import {CreepRoleEnum} from "../creeps/roles/creep-role-enum";

const getPlanner = function(): RoomPlannerInterface {
    // TODO write ways to determine what planner to send
    return new InitPlanner(this);
};

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
    if (this.creepCountArray === null) {
        this.creepCountArray = new Map();
        _.forEach(this.find(FIND_MY_CREEPS), (creep: Creep) => {
            if (creep.memory && creep.memory['role']) {
                const currentRole: CreepRoleEnum = creep.memory['role'];
                if (this.creepCountArray.has(currentRole)) {
                    this.creepCountArray.set(currentRole, this.creepCountArray.get(currentRole) + 1);
                } else {
                    this.creepCountArray.set(currentRole, 1);
                }
            }
        });
    }
    return this.creepCountArray.has(role) ? this.creepCountArray.get(role) : 0;
};

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
    _.forEach(this.find(FIND_MY_CREEPS), (creep: Creep) => {
        if (filter(creep)) {
            const oldRole = creep.memory['role'];
            creep.memory['role'] = newRole;
            delete creep.memory['action'];
            delete creep.memory['target'];
            incrementAndDecrement(this.creepCountArray, newRole, oldRole);
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

declare global {
    interface Room {
        reassignAllCreeps(newRole: CreepRoleEnum, filter: Function);
        reassignSingleCreep(newRole: CreepRoleEnum, filter: Function);
        planner: RoomPlannerInterface;
        creepCountArray: Map<CreepRoleEnum, number>;
        getPlanner(): RoomPlannerInterface;
        getNumberOfCreepsByRole(role: string): number;
        findNextEnergySource(creep: Creep): Source;
        getNumberOfMiningSpacesAtSource(sourceId: Id<Source>): number;
        getTotalNumberOfMiningSpaces(): number;
        getNumberOfSources(): number;
        findNumberOfSourcesAndSpaces();
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
        getPlanner();
    }
}
