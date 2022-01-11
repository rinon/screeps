import {CreepRoleEnum} from "./creep-role-enum";
import {TravelingAction} from "../actions/traveling";
import {GrandStrategyPlanner} from "../../war/grand-strategy-planner";
import {ClaimControllerAction} from "../actions/claim-controller";

export class Claimer {
    static KEY: CreepRoleEnum = CreepRoleEnum.CLAIMER;

    static setAction(creep: Creep) {
        if (!creep.memory['claim']) {
            let canClaimAnyRoom = GrandStrategyPlanner.canClaimAnyRoom();
            if (canClaimAnyRoom && !creep.memory['toRoom'] && Memory['roomData']) {
                let bestRoom = GrandStrategyPlanner.getBestRoomToClaim(creep.room, false);
                if (bestRoom) {
                    creep.memory['claim'] = bestRoom;
                }
            }
        }
        if (creep.memory['claim'] && creep.memory['claim'] != creep.room.name) {
            TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['claim']));
        } else if (creep.memory['claim'] && creep.memory['claim'] == creep.room.name) {
            ClaimControllerAction.setAction(creep);
        }
        creep.runAction();
    }
}