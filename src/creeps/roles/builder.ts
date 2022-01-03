import {CreepRoleEnum} from "./creep-role-enum";
import {WithdrawAction} from "../actions/withdraw";
import {MineEnergyAction} from "../actions/mine-energy";
import {BuildAction} from "../actions/build";

export class Builder {
    static KEY: CreepRoleEnum = CreepRoleEnum.BUILDER;
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case WithdrawAction.KEY:
            case MineEnergyAction.KEY:
                let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (sites.length > 0) {
                    BuildAction.setAction(creep, sites[0]);
                } else {
                    creep.room.reassignIdleCreep(creep);
                    return;
                }
                break;
            case BuildAction.KEY:
            default:
                creep.goGetEnergy();
                break;
        }
        creep.runAction();
    }
}