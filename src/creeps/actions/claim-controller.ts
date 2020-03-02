import {LeaveRoomAction} from "./leave-room";

export class ClaimControllerAction {
    static KEY = 'claim-controller';

    static run(creep:Creep) {
        let claimedRoom = creep.room.controller && creep.room.controller.my;
        if (claimedRoom) {
            creep.setNextAction();
            return;
        }

        creep.memory['target'] = creep.room.controller.id;
        if (!creep.pos.inRangeTo(creep.room.controller, 1)) {
            creep.moveToTarget();
            return;
        }
        let claimMessage = creep.claimController(creep.room.controller);
        if (claimMessage === OK) {
            if (Memory['roomData'] && Memory['roomData'][creep.room.name]) {
                delete Memory['roomData'][creep.room.name];
                creep.room.memory['sendBuilders'] = true;
            }
        }
    }

    static setAction(creep:Creep) {
        creep.memory['action'] = this.KEY;
        creep.say('♔ claim');
    }
}