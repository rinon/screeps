import {WithdrawAction} from "../actions/withdraw";
import {MineEnergyAction} from "../actions/mine-energy";
import {TransferAction} from "../actions/transfer";
import {CreepRoleEnum} from "./creep-role-enum";
import {TravelingAction} from "../actions/traveling";
import {LeaveRoomAction} from "../actions/leave-room";
import {GrandStrategyPlanner} from "../../war/grand-strategy-planner";

export class Traveler {
    static KEY: CreepRoleEnum = CreepRoleEnum.TRAVELER;

    static setAction(creep: Creep) {
        switch (creep.memory['action']) {
            case TravelingAction.KEY:
            case LeaveRoomAction.KEY:
                if (!creep.memory['endRoom']) {
                    creep.memory['endRoom'] = creep.memory['homeRoom'];
                }
                if (creep.room.name != creep.memory['endRoom']) {
                    if (creep.room.controller && creep.room.controller.my && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                        creep.deliverEnergyToSpawner();
                    } else {
                        TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['endRoom']));
                    }
                } else {
                    if (creep.room.controller && creep.room.controller.my) {
                        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                            creep.deliverEnergyToSpawner();
                        } else {
                            Traveler.getNextRoom(creep);
                        }
                    } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && creep.room.find(FIND_SOURCES).length > 0) {
                        creep.goGetEnergy(true, false);
                    } else {
                        Traveler.getNextRoom(creep);
                    }
                }
                break;
            case WithdrawAction.KEY:
            case MineEnergyAction.KEY:
                let destinationRoomName:string = GrandStrategyPlanner.findNewTravelerHomeRoom(creep);
                creep.memory['endRoom'] = destinationRoomName == null ? creep.memory['homeRoom'] : destinationRoomName;
                TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['endRoom']));
                break;
            case TransferAction.KEY:
            default:
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    if (creep.room.controller && creep.room.controller.my) {
                        creep.deliverEnergyToSpawner();
                    } else {
                        TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['homeRoom']));
                    }
                } else {
                    Traveler.getNextRoom(creep);
                }
                break;
        }
        creep.runAction();
    }

    public static getNextRoom(creep) {
        creep.memory['endRoom'] = GrandStrategyPlanner.findTravelerDestinationRoom(creep);
        if (!creep.memory['endRoom']) {
            LeaveRoomAction.setAction(creep, null);
        } else {
            TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['endRoom']));
        }
    }
}
