import * as _ from "lodash";
import {Invasion} from "./invasion";

export class WarController {
    public static invasions = {};

    constructor() {
        this.initMemory();
        this.refreshInvasionDataOnAllPopulatedRooms();
        this.trackInvasionsInUnpopulatedRooms();
        _.forEach(WarController.invasions, (invasion: Invasion) => {
            // TODO interrupt creeps as needed and reassign actions/roles
        });
    }

    private trackInvasionsInUnpopulatedRooms() {
        const cleanUpInvasions = [];
        _.forEach(Memory['war']['invasions'], (invasionData, roomName) => {
            if (!WarController.invasions[roomName] && invasionData['respondingCreeps']) {
                WarController.invasions = new Invasion(roomName, []);
            } else {
                cleanUpInvasions.push(roomName);
            }
        });
        _.forEach(cleanUpInvasions, (roomName) => {
            delete Memory['war']['invasions'][roomName];
        });
    }

    private refreshInvasionDataOnAllPopulatedRooms() {
        _.forEach(Game.rooms, (room:Room) => {
            WarController.invasions[room.name] = room.getInvasion();;
        });
    }

    private initMemory() {
        if (!Memory['war']) {
            Memory['war'] = {
                invasions: {}
            };
        }
    }
}
