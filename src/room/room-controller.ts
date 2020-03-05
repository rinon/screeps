import * as _ from "lodash";
import {SpawnController} from "../structures/spawns/spawn-controller";

export class RoomController {
    static runRooms() {
        _.forEach(Game.rooms, function(room: Room) {
            SpawnController.spawnCreeps(room);
            room.getPlanner().placeConstructionSites();
        });
    }
}
