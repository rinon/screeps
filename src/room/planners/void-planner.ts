import {RoomPlannerInterface} from "./room-planner-interface";
import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import * as _ from "lodash";
import {Planner} from "./planner";

export class VoidPlanner extends Planner implements RoomPlannerInterface {
    private room: Room;

    constructor(room: Room) {
        super();
        this.room = room;
    }

    buildMemory() {
        if (!this.room.memory['sources']) {
            this.room.memory['sources'] = {};
            let sources = this.room.find(FIND_SOURCES);
            if (!Memory['roomData']) {
                Memory['roomData'] = {};
            }
            if (!Memory['roomData'][this.room.name]) {
                Memory['roomData'][this.room.name] = {};
            }
            Memory['roomData'][this.room.name]['sources'] = {
                qty: sources.length
            };
            let totalSourceSpots = 0;
            _.forEach(sources, (source:Source) => {
                let currentNumberOfSpots = this.room.getNumberOfMiningSpacesAtSource(source.id);
                totalSourceSpots += currentNumberOfSpots;
                this.room.memory['sources'][source.id] = currentNumberOfSpots;
            });
            Memory['roomData'][this.room.name]['sources']['spots'] = totalSourceSpots;
            return;
        }
    }

    getNextReassignRole() {
        return null;
    }

    reassignCreeps() {
        // Do nothing
    }

    getNextCreepToSpawn():CreepSpawnData {
        return null;
    }

}