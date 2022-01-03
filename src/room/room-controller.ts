import { RoomPrototype } from "./room-prototype";
import * as _ from "lodash";
import {SpawnController} from "../structures/spawns/spawn-controller";

export class RoomController {
    static runRooms() {
        RoomPrototype.init();
        _.forEach(Game.rooms, function(room: Room) {
            room.getPlanner(room).reassignCreeps();
            SpawnController.spawnCreeps(room);
            room.buildMemory();
            room.makeConstructionSites();
        });
    }
}
