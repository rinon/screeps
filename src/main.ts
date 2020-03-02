import { CreepController } from "./creeps/creep-controller";
import { RoomController } from "./room/room-controller";

module.exports = {
    loop: function() {
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
        new CreepController();
        RoomController.runRooms();
    }
};
