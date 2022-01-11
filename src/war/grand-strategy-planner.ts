import * as _ from "lodash";

export class GrandStrategyPlanner {
    static findTravelerRoom(creep:Creep):string {
        let helpRoom = null;
        let helpReallyNeeded = false;
        let emergencyHelpNeeded = false;
        _.forEach(Game.rooms, (room:Room) => {
            if (room.name === creep.memory['endRoom']) {
                return;
            }
            let numberOfSpots = 0;
            let numberOfCreeps = room.find(FIND_MY_CREEPS).length;
            _.forEach(room.memory['sources'], (sourceNumber) => {
                numberOfSpots += sourceNumber;
            });
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
                } else if (!emergencyHelpNeeded && !helpReallyNeeded) {
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