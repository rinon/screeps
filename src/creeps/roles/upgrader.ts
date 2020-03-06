import {MineEnergyAction} from "../actions/mine-energy";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {WithdrawAction} from "../actions/withdraw";
import {CreepRoleEnum} from "./creep-role-enum";

export class Upgrader {
    static KEY: CreepRoleEnum = CreepRoleEnum.UPGRADER;
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case WithdrawAction.KEY:
            case MineEnergyAction.KEY:
                UpgradeControllerAction.setAction(creep);
                break;
            case UpgradeControllerAction.KEY:
            default:
                creep.goGetEnergy();
                break;
        }
        creep.runAction();
    }
}
