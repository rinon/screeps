import {MineEnergyAction} from "./actions/mine-energy";
import {UpgradeControllerAction} from "./actions/upgrade-controller";
import {TransferAction} from "./actions/transfer";
import {Upgrader} from "./roles/upgrader";
import {BuildAction} from "./actions/build";
import {WithdrawAction} from "./actions/withdraw";
import {RepairAction} from "./actions/repair";
import {PickupAction} from "./actions/pickup";
import {ReserveControllerAction} from "./actions/reserve-controller";
import {ClaimControllerAction} from "./actions/claim-controller";
import {LeaveRoomAction} from "./actions/leave-room";
import {TravelingAction} from "./actions/traveling";
import {AttackAction} from "./actions/attack";
import {WaitAction} from "./actions/wait";
import {MoveAction} from "./actions/move";


const moveToTarget = function() {
    LeaveRoomAction.moveIntoRoom(this);
    if (this.fatigue > 0) {
        return;
    }
    let moveMessage;
    if (this.memory['destination']) {
        moveMessage = this.moveTo(this.memory['destination'].x, this.memory['destination'].y, {reusePath: 999, maxRooms: 1});
    } else if (this.memory['target']) {
        let roomObject:RoomObject = Game.getObjectById(this.memory['target']);
        if (roomObject && roomObject.pos) {
            moveMessage = this.moveTo(roomObject.pos, {reusePath: 999, maxRooms: 1});
        } else {
            delete this.memory['target'];
        }
    } else {
        return;
    }
    if (moveMessage !== ERR_TIRED) {
        if (this.memory['prevPos'] && this.memory['prevPos'].x == this.pos.x &&
                this.memory['prevPos'].y == this.pos.y) {
            delete this.memory['prevPos'];
            delete this.memory['_move'];
            this.moveToTarget();
        } else {
            this.memory['prevPos'] = this.pos;
        }
    }
};

const goGetEnergy = function() {
    const closestContainer = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
            return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ||
                s.structureType === STRUCTURE_LINK) &&
                s['store'].energy > 0;
        }});
    if (closestContainer != null) {
        WithdrawAction.setAction(this, closestContainer, RESOURCE_ENERGY);
    } else {
        MineEnergyAction.setAction(this);
    }
};

const deliverEnergyToSpawner = function() {
    let spawnerContainer = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
            return (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) &&
                s['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
        }});
    if (spawnerContainer) {
        TransferAction.setAction(this, spawnerContainer, RESOURCE_ENERGY);
    } else {
        WaitAction.setActionPermenantly(this);
    }
};

const setNextAction = function() {
    if (!this.memory['actionSwitched']) {
        this.memory['actionSwitched'] = true;
    } else {
        return;
    }
    switch (this.memory['role']) {
        case Upgrader.KEY:
        default:
            Upgrader.setAction(this);
            break;
    }
};

const runAction = function() {
    switch (this.memory['action']) {
        case MoveAction.KEY:
            MoveAction.run(this);
            break;
        case AttackAction.KEY:
            AttackAction.run(this);
            break;
        case TravelingAction.KEY:
            TravelingAction.run(this);
            break;
        case LeaveRoomAction.KEY:
            LeaveRoomAction.run(this);
            break;
        case ClaimControllerAction.KEY:
            ClaimControllerAction.run(this);
            break;
        case ReserveControllerAction.KEY:
            ReserveControllerAction.run(this);
            break;
        case PickupAction.KEY:
            PickupAction.run(this);
            break;
        case RepairAction.KEY:
            RepairAction.run(this);
            break;
        case UpgradeControllerAction.KEY:
            UpgradeControllerAction.run(this);
            break;
        case BuildAction.KEY:
            BuildAction.run(this);
            break;
        case TransferAction.KEY:
            TransferAction.run(this);
            break;
        case WithdrawAction.KEY:
            WithdrawAction.run(this);
            break;
        case MineEnergyAction.KEY:
            MineEnergyAction.run(this);
            break;
        case WaitAction.KEY:
            WaitAction.run(this);
            break;
        default:
            this.setNextAction();
            break;
    }
};

declare global {
    interface Creep {
        moveToTarget();
        goGetEnergy();
        deliverEnergyToSpawner();
        setNextAction();
        runAction();
        init: boolean;
    }
}

export class CreepPrototype {
    static init() {
        if (!Creep['init']) {
            Creep.prototype.moveToTarget = moveToTarget;
            Creep.prototype.goGetEnergy = goGetEnergy;
            Creep.prototype.deliverEnergyToSpawner = deliverEnergyToSpawner;
            Creep.prototype.setNextAction = setNextAction;
            Creep.prototype.runAction = runAction;
            Creep.prototype.init = true;
        }
    }
}
