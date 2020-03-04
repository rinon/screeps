import {MineEnergyAction} from "../actions/mine-energy";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {WithdrawAction} from "../actions/withdraw";

export class Upgrader {
    static KEY = 'upgrader';
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
