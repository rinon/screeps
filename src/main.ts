import { CreepController } from "./creeps/creep-controller";
import { RoomController } from "./room/room-controller";
import { RoomPrototype } from "./room/room-prototype";

module.exports = {
    loop: function() {
        RoomPrototype.init();
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
        new CreepController();
        RoomController.runRooms();
    }
};
