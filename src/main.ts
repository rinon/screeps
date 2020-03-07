import { CreepController } from "./creeps/creep-controller";
import { RoomController } from "./room/room-controller";
import { RoomPrototype } from "./room/room-prototype";
import {WarController} from "./war/war-controller";

module.exports = {
    loop: function() {
        RoomPrototype.init();
        deleteInvalidCreepMemory();
        new WarController();
        new CreepController();
        RoomController.runRooms();
    }
};

function deleteInvalidCreepMemory() {
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}
