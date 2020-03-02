import { RoomPrototype } from "./room-prototype";
import * as _ from "lodash";

export class RoomController {
    static RunRooms() {
        RoomPrototype.init();
        _.forEach(Game.rooms(), function(room: Room) {
            SpawnController.spawnCreeps(room);
        });
    }
}
