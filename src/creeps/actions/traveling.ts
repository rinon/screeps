import {LeaveRoomAction} from "./leave-room";

export class TravelingAction {
    static KEY = 'traveling';

    static run(creep:Creep) {
        LeaveRoomAction.moveIntoRoom(creep);
        if (creep.fatigue > 0) {
            return;
        }
        if (!creep.memory['endRoom']) {
            delete creep.memory['destination'];
            delete creep.memory['toRoom'];
            creep.setNextAction();
            return;
        }
        if (creep.memory['endRoom'] === creep.room.name) {
            delete creep.memory['destination'];
            delete creep.memory['toRoom'];
            creep.setNextAction();
            return;
        }
        if (!creep.memory['toRoom'] || !creep.memory['fromRoom'] || creep.memory['fromRoom'] !== creep.room.name) {
            creep.memory['fromRoom'] = creep.room.name;
            let route = Game.map.findRoute(creep.room, creep.memory['endRoom']);
            if (route && route['length']) {
                creep.memory['toRoom'] = route[0].room;
                creep.memory['destination'] = creep.pos.findClosestByPath(route[0].exit);
                creep.moveToTarget();
            } else {
                delete creep.memory['destination'];
                delete creep.memory['toRoom'];
                creep.setNextAction();
            }
            return;
        }
        if (!creep.memory['destination'] && creep.memory['toRoom']) {
            creep.memory['fromRoom'] = creep.room.name;
            let exitDirection = creep.room.findExitTo(creep.memory['toRoom']);
            if (exitDirection && creep.room.memory['exits'][exitDirection]) {
                creep.memory['destination'] = creep.pos.findClosestByPath(<ExitConstant> exitDirection);
            } else {
                delete creep.memory['destination'];
                delete creep.memory['toRoom'];
                creep.setNextAction();
                return;
            }
        }
        creep.moveToTarget();
    }

    static setAction(creep:Creep, pos:RoomPosition) {
        creep.memory['fromRoom'] = creep.room.name;
        creep.memory['endRoom'] = pos.roomName;
        let route = Game.map.findRoute(creep.room, pos.roomName);
        if (route && route['length']) {
            creep.memory['toRoom'] = route[0].room;
            creep.memory['destination'] = creep.pos.findClosestByPath(route[0].exit);
            creep.moveToTarget();
        }
        creep.memory['action'] = TravelingAction.KEY;
        creep.say('✈ traveling');
    }
}