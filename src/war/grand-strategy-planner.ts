import * as _ from "lodash";

export class GrandStrategyPlanner {
    static getBestRoomToClaim(room:Room, reserve:boolean):string {
        let mostSources = 0;
        let mostSpots = 0;
        let bestRoom = null;
        _.forEach(Memory['roomData'], (roomData, key) => {
            let currentRoom = Game.rooms[key];
            if (!currentRoom || !currentRoom.controller || currentRoom.controller.my) {
                return;
            }
            if (currentRoom && reserve && GrandStrategyPlanner.canReserve(Memory['username'], currentRoom)) {
                return;
            }
            if (room && GrandStrategyPlanner.getDistanceBetweenTwoRooms(room.name, key) > 3) {
                return;
            }
            let numberOfSources = 0;
            let numberOfSpots = 0;
            if (roomData && roomData['sources']) {
                numberOfSources = roomData['sources']['qty'];
                numberOfSpots = roomData['sources']['spots'];
            }

            if (numberOfSources > mostSources ||
                (numberOfSources === mostSources && mostSpots > numberOfSpots)) {
                bestRoom = key;
                mostSpots = numberOfSpots;
                mostSources = numberOfSources;
            }
        });
        return bestRoom;
    }

    static canClaimAnyRoom():boolean {
        let numberOfOwnedRooms = _.filter(Game.rooms, (r) => {
            return r.controller && r.controller.my;
        }).length;
        return Game.gcl.level > numberOfOwnedRooms;
    }

    static canReserve(username:string, room:Room):boolean {
        return room.controller && (!room.controller.reservation || room.controller.reservation.username === username)
            && !room.controller.my && !room.controller.owner;
    }

    static findNewTravelerHomeRoom(creep:Creep):string {
        let helpRoom = null;
        let leastEnergy = 99999;
        _.forEach(Game.rooms, (room:Room) => {
            if (room.name === creep.memory['endRoom']) {
                return;
            }
            if (!room.controller || !room.controller.my) {
                return;
            }
            if (this.getDistanceBetweenTwoRooms(room.name, creep.room.name) > 4) {
                return;
            }
            if (leastEnergy > room.energyAvailable) {
                leastEnergy = room.energyAvailable;
                helpRoom = room.name;
            }
        });
        return helpRoom;
    }

    static findTravelerDestinationRoom(creep:Creep):string {
        let helpRoom = null;
        let helpReallyNeeded = false;
        let emergencyHelpNeeded = false;
        _.forEach(Game.rooms, (room:Room) => {
            if (room.name === creep.memory['endRoom']) {
                return;
            }
            let numberOfSpots = 0;
            let numberOfCreeps = room.find(FIND_MY_CREEPS).length;
            if (room.memory['sources'] && room.memory['sources']['sources']) {
                _.forEach(room.memory['sources']['sources'], (sourceNumber) => {
                    numberOfSpots += sourceNumber;
                });
            }
            if (numberOfCreeps - 4 < Math.max(2, numberOfSpots) && room.controller && room.controller.my) {
                emergencyHelpNeeded = true;
                helpRoom = room.name;
            }
            const roomDistance = GrandStrategyPlanner.getDistanceBetweenTwoRooms(room.name, creep.room.name);
            if (roomDistance > 1) {
                return;
            }
            if ((room.controller && room.controller.reservation &&
                room.controller.reservation.username === Memory['username']) || room.memory['sendBuilders']) {

                if (!emergencyHelpNeeded && numberOfCreeps - 1 < Math.max(2, numberOfSpots)) {
                    helpReallyNeeded = true;
                    helpRoom = room.name;
                } else if (!emergencyHelpNeeded && !helpReallyNeeded && numberOfCreeps - 4 < Math.max(2, numberOfSpots)) {
                    helpRoom = room.name;
                } else if (!emergencyHelpNeeded && !helpReallyNeeded && (!room.controller || !room.controller.my)) {
                    helpRoom = room.name;
                }
            }
        });
        return helpRoom;
    }

    static getDistanceBetweenTwoRooms(room1Name:string, room2Name:string):number {
        let is1West = room1Name.indexOf("W") !== -1;
        let is1North = room1Name.indexOf("N") !== -1;
        let split1Name = room1Name.slice(1).split(is1North ? "N" : "S");
        let x1 = Number(split1Name[0]);
        let y1 = Number(split1Name[1]);

        let is2West = room2Name.indexOf("W") !== -1;
        let is2North = room2Name.indexOf("N") !== -1;
        let split2Name = room2Name.slice(1).split(is2North ? "N" : "S");
        let x2 = Number(split2Name[0]);
        let y2 = Number(split2Name[1]);

        let verticalDistance = Math.abs(is1West === is2West ? x1 - x2 : x1 + x2);
        let horizontalDistance = Math.abs(is1North === is2North ? y1 - y2 : y1 + y2);
        return Math.max(verticalDistance, horizontalDistance);
    }
}