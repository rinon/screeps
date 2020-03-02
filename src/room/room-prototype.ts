import * as _ from "lodash";
import { InitPlanner } from "./planners/init-planner";

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

const getPlanner = function() {
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
}

declare global {
    interface Room {
        getPlanner();
        findNextEnergySource(creep: Creep): Source;
    }
}

export class RoomPrototype {
    static init() {
        Room.prototype.findNextEnergySource = findNextEnergySource;
        Room.prototype.getPlanner = getPlanner;
    }
}
