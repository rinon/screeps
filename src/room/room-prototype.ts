import * as _ from "lodash";
import { InitPlanner } from "./planners/init-planner";
import {PlannerInterface} from "./planners/planner-interface";

function getNeighbors(source: Source): Array<RoomPosition> {
    let neighbors: Array<RoomPosition> = new Array();
    if (source.pos.y > 0) {
        if (source.pos.x > 0)
            neighbors.push(new RoomPosition(source.pos.x - 1, source.pos.y - 1, source.room.name));
        neighbors.push(new RoomPosition(source.pos.x, source.pos.y - 1, source.room.name));
        if (source.pos.x < 49)
            neighbors.push(new RoomPosition(source.pos.x + 1, source.pos.y - 1, source.room.name));
    }
    if (source.pos.x > 0)
        neighbors.push(new RoomPosition(source.pos.x - 1, source.pos.y, source.room.name));
    if (source.pos.x < 49)
        neighbors.push(new RoomPosition(source.pos.x + 1, source.pos.y, source.room.name));
    if (source.pos.y < 49) {
        if (source.pos.x > 0)
            neighbors.push(new RoomPosition(source.pos.x - 1, source.pos.y + 1, source.room.name));
        neighbors.push(new RoomPosition(source.pos.x, source.pos.y + 1, source.room.name));
        if (source.pos.x < 49)
            neighbors.push(new RoomPosition(source.pos.x + 1, source.pos.y + 1, source.room.name));
    }
    return neighbors;
}

const getPlanner = function(): PlannerInterface {
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
        // This might need to be faster?
        return this.findPath(creep.pos, source).length;
    }]);
    for (const source of sources) {
        if (!assignments[source.id]) {
            assignments[source.id] = [creep.id];
        } else {
            let terrain: RoomTerrain = this.getTerrain();
            let spaces: number = 0;
            // TODO: put on Source prototype
            getNeighbors(source).forEach(function(pos: RoomPosition) {
                if (terrain.get(pos.x, pos.y) == 0) {
                    spaces += 1;
                }
            });
            if (assignments[source.id].length < spaces) {
                assignments[source.id].push(creep.id);
                return source;
            }
        }
    }
};

const getNumberOfMiningSpaces = function() {
    if (!this.memory['sources'] || !this.memory['sources']['spaces']) {
        this.findNumberOfSourcesAndSpaces();
    }
    return this.memory['sources']['spaces'];
};

const getNumberOfSources = function() {
    if (!this.memory['sources'] || !this.memory['sources']['count']) {
        this.findNumberOfSourcesAndSpaces();
    }
    return this.memory['sources']['count'];
};

const findNumberOfSourcesAndSpaces = function() {
    let numberSources = 0;
    let numberSpaces = 0;
    _.forEach(this.find(FIND_SOURCES), (source: Source) => {
        numberSources++;
        const availablePositions = {};
        for (let x = source.pos.x-1; x < source.pos.x + 1; x++) {
            for (let y = source.pos.y-1; y < source.pos.y + 1; y++) {
                availablePositions[x + ":" + y] = true;
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
            numberSpaces++;
        }
    });
    this.memory['sources'] = {
        count: numberSources,
        spaces: numberSpaces
    }
};

const getNumberOfCreepsByRole = function(role: string): number {
    if (this.creepCountArray === null) {
        this.creepCountArray = [];
        _.forEach(this.find(FIND_MY_CREEPS), (creep: Creep) => {
            if (creep.memory && creep.memory['role']) {
                const currentRole = creep.memory['role'];
                if (this.creepCountArray[currentRole]) {
                    this.creepCountArray[currentRole]++;
                } else {
                    this.creepCountArray[currentRole] = 1;
                }
            }
        });
    }
    return this.creepCountArray[role] ? this.creepCountArray[role] : 0;
};

declare global {
    interface Room {
        planner: PlannerInterface;
        creepCountArray: Array<number>;
        getPlanner(): PlannerInterface;
        getNumberOfCreepsByRole(role: string): number;
        findNextEnergySource(creep: Creep): Source;
        getNumberOfMiningSpaces(): number;
        getNumberOfSources(): number;
        findNumberOfSourcesAndSpaces();
    }
}

export class RoomPrototype {
    static init() {
        Room.prototype.planner = null;
        Room.prototype.creepCountArray = null;
        Room.prototype.getNumberOfCreepsByRole = getNumberOfCreepsByRole;
        Room.prototype.findNextEnergySource = findNextEnergySource;
        Room.prototype.getNumberOfMiningSpaces = getNumberOfMiningSpaces;
        Room.prototype.getNumberOfSources = getNumberOfSources;
        Room.prototype.getPlanner = getPlanner;
        Room.prototype.findNumberOfSourcesAndSpaces = findNumberOfSourcesAndSpaces;
        getPlanner();
    }
}
