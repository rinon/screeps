import * as _ from "lodash";
import { InitPlanner } from "./planners/init-planner";
import {RoomPlannerInterface} from "./planners/room-planner-interface";
import {CreepRoleEnum} from "../creeps/roles/creep-role-enum";

const getPlanner = function(): RoomPlannerInterface {
    // TODO write ways to determine what planner to send
    return new InitPlanner(this);
};

const findNextEnergySource = function(creep: Creep) {
    if (!this.memory['source_assignments']) {
        this.memory['source_assignments'] = {};
    }
    let assignments: Object = this.memory['source_assignments'];
    _.forEach(assignments, function(assignment: Object, source: String) {
        assignment = _.filter(assignment, function(creep_id: string) {
            let creep: Creep = Game.creeps[creep_id];
            return creep ? creep.memory['target'] == source : false;
        });
    });

    let sources = _.sortBy(this.find(FIND_SOURCES_ACTIVE), [function(source: Source) {
        return creep.pos.getRangeTo(source.pos);
    }]);
    for (const source of sources) {
        if (!assignments[source.id]) {
            assignments[source.id] = [creep.id];
        } else {
            let spaces: number = this.getNumberOfMiningSpacesAtSource(source.id);
            if (assignments[source.id].length < spaces) {
                assignments[source.id].push(creep.id);
                return source;
            }
        }
    }
};

const getNumberOfMiningSpacesAtSource = function(sourceId: Id<Source>) {
    return this.findNumberOfSourcesAndSpaces()[sourceId];
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
        for (let x = source.pos.x-1; x < source.pos.x + 1; x++) {
            for (let y = source.pos.y-1; y < source.pos.y + 1; y++) {
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
                } else if (lookupObject.type === 'terrain' && lookupObject.terrain !== 'swamp') {
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
    let creepReassigned = false;
    _.forEach(this.room.find(FIND_MY_CREEPS), (creep: Creep) => {
        if (!creepReassigned && filter(creep)) {
            const oldRole = creep.memory['role'];
            creep.memory['role'] = newRole;
            delete creep.memory['action'];
            delete creep.memory['target'];
            creepReassigned = true;
            incrementAndDecrement(this.room.creepCountArray, newRole, oldRole);
        }
    });
};

const reassignSingleCreep = function(newRole: CreepRoleEnum, filter: Function) {
    _.forEach(this.room.find(FIND_MY_CREEPS), (creep: Creep) => {
        if (filter(creep)) {
            const oldRole = creep.memory['role'];
            creep.memory['role'] = newRole;
            delete creep.memory['action'];
            delete creep.memory['target'];
            incrementAndDecrement(this.room.creepCountArray, newRole, oldRole);
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
