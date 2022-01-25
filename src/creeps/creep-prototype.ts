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
import {Transport} from "./roles/transport";
import {Builder} from "./roles/builder";
import {Miner} from "./roles/miner";
import * as _ from "lodash";
import {Traveler} from "./roles/traveler";
import {Claimer} from "./roles/claimer";


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

const goGetEnergy = function(hasWorkComponent: boolean, findHighest: boolean) {
    let closestContainer = null;
    if (findHighest) {
        if (this.room.memory && !this.memory['ccontainer'] && this.room.controller) {
            let closestContainer = null;
            let closestDistance = 99;
            _.forEach(this.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                    return s.structureType == STRUCTURE_CONTAINER;
                }}), (s:Structure) => {
                const distance = s.pos.getRangeTo(this.room.controller.pos);
                if (!closestContainer || distance < closestDistance) {
                    closestContainer = s;
                    closestDistance = distance;
                }
            });
            if (closestContainer) {
                this.room.memory['ccontainer'] = closestContainer.id;
            }
        }
        closestContainer = _.sortBy(this.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                    s['store'].energy > 0 && (!this.room.memory['ccontainer'] || s.id != this.room.memory['ccontainer']);
            }}), (s:Structure) => { return -1 * s['store'].energy});
        if (closestContainer.length > 0) {
            closestContainer = closestContainer[0];
        } else {
            closestContainer = _.sortBy(this.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                    return s.structureType === STRUCTURE_LINK &&
                        s['store'].energy > 0 && (s.room.memory['closestLink'] == null || s.room.memory['closestLink'] != s.id);
                }}), (s:Structure) => { return -1 * s['store'].energy});
            if (closestContainer.length > 0) {
                closestContainer = closestContainer[0];
            } else {
                closestContainer = null;
            }
        }
    } else {
        closestContainer = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ||
                    s.structureType === STRUCTURE_LINK) &&
                    s['store'].energy > 0;
            }});
    }
    if (closestContainer != null) {
        WithdrawAction.setAction(this, closestContainer, RESOURCE_ENERGY);
    } else {
        if (hasWorkComponent) {
            MineEnergyAction.setAction(this);
        } else {
            let closestDroppedEnergy:Array<Resource> = this.room.find(FIND_DROPPED_RESOURCES);
            if (closestDroppedEnergy.length > 0 && closestDroppedEnergy[0].resourceType == RESOURCE_ENERGY) {
                PickupAction.setAction(this, closestDroppedEnergy[0]);
            } else {
                WaitAction.setActionUntilNextTick(this);
            }
        }
    }
};

const deliverEnergyToSpawner = function() {
    let towerContainer = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
            return (s.structureType === STRUCTURE_TOWER) &&
                s['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
        }});
    if (towerContainer) {
        TransferAction.setAction(this, towerContainer, RESOURCE_ENERGY);
        return;
    }
    let spawnerContainer = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
            return (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) &&
                s['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
        }});
    if (spawnerContainer) {
        TransferAction.setAction(this, spawnerContainer, RESOURCE_ENERGY);
    } else {
        const mostEmptyContainer = _.sortBy(this.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                    s['store'].getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                    (s.room.memory['closestLink'] == null || s.room.memory['closestLink'] != s.id);
            }}), (s:Structure) => { return s['store'].energy;});
        if (mostEmptyContainer.length) {
            TransferAction.setAction(this, mostEmptyContainer[0], RESOURCE_ENERGY);
        } else {
            this.room.reassignIdleCreep(this);
        }
    }
};

const setNextAction = function() {
    if (!this.memory['actionSwitched']) {
        this.memory['actionSwitched'] = true;
    } else {
        return;
    }
    delete this.memory['fromRoom'];
    delete this.memory['originRoom'];
    delete this.memory['toRoom'];
    delete this.memory['destination'];
    switch (this.memory['role']) {
        case Claimer.KEY:
            Claimer.setAction(this);
            break;
        case Traveler.KEY:
            Traveler.setAction(this);
            break;
        case Transport.KEY:
            Transport.setAction(this);
            break;
        case Builder.KEY:
            Builder.setAction(this);
            break;
        case Miner.KEY:
            Miner.setAction(this);
            break;
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
        goGetEnergy(hasWorkComponent: boolean, findHighest: boolean);
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
