import { CreepController } from "./creeps/creep-controller";
import { RoomController } from "./room/room-controller";
import { RoomPrototype } from "./room/room-prototype";
import {CreepPrototype} from "./creeps/creep-prototype";
import {SpawnPrototype} from "./structures/spawns/spawn-prototype";

module.exports = {
    loop: function() {
        initPrototypes();
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
        new CreepController();
        RoomController.runRooms();
    }
};

function initPrototypes() {
    RoomPrototype.init();
    CreepPrototype.init();
    SpawnPrototype.init();
}
