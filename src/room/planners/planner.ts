import * as _ from "lodash";

export class Planner {
    public placeContainerAndLink(pos:RoomPosition, linkNumber:number) {
        let room:Room = Game.rooms[pos.roomName];
        if (!room) {
            return;
        }
        let positionMap = {};
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                positionMap[(pos.x + i) + ":" + (pos.y + j)] = new RoomPosition(pos.x + i, pos.y + j, pos.roomName);
            }
        }
        let containerPos = null;
        let linkPos = null;
        _.forEach(room.lookAtArea(pos.y-1, pos.x-1, pos.y+1, pos.x+1, true), (s:LookAtResultWithPos) => {
            if (!positionMap[s.x + ":" + s.y]) {
                return;
            }
            if (s.type === 'structure' && s.structure.structureType === STRUCTURE_CONTAINER) {
                containerPos = new RoomPosition(s.x, s.y, room.name);
                delete positionMap[s.x + ":" + s.y];
                return;
            }
            if (s.type === 'structure' && s.structure.structureType === STRUCTURE_LINK) {
                linkPos = new RoomPosition(s.x, s.y, room.name);
                delete positionMap[s.x + ":" + s.y];
                return;
            }
            if (room.isOpen(s)) {
                delete positionMap[s.x + ":" + s.y];
                return;
            }
        });
        if (containerPos) {
            room.memory['sites'][0][containerPos.x + ":" + containerPos.y] = STRUCTURE_CONTAINER;
        }
        if (linkPos) {
            room.memory['sites'][5][linkPos.x + ":" + linkPos.y] = STRUCTURE_LINK;
        }
        if (containerPos && linkPos) {
            return;
        }
        for (let key in positionMap) {
            if (key && positionMap[key]) {
                if (!containerPos) {
                    containerPos = positionMap[key];
                    room.memory['sites'][0][key] = STRUCTURE_CONTAINER;
                } else if (!linkPos) {
                    linkPos = positionMap[key];
                    room.memory['sites'][linkNumber][key] = STRUCTURE_LINK;
                }
            }
        }
        if (!linkPos && containerPos) {
            let nextAvailablePosition = this.getFirstOpenAdjacentSpot(containerPos);
            if (nextAvailablePosition) {
                linkPos = nextAvailablePosition;
                room.memory['sites'][linkNumber][linkPos.x + ":" + linkPos.y] = STRUCTURE_LINK;
            }
        }
    }

    private getFirstOpenAdjacentSpot(pos:RoomPosition):RoomPosition {
        let positionMap = {};
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                positionMap[(pos.x + i) + ":" + (pos.y + j)] = new RoomPosition(pos.x + i, pos.y + j, pos.roomName);
            }
        }
        _.forEach(Game.rooms[pos.roomName].lookAtArea(pos.y-1, pos.x-1, pos.y+1, pos.x+1, true), (s:LookAtResultWithPos) => {
            if (!positionMap[s.x + ":" + s.y]) {
                return;
            }
            if (this.hasPlannedStructureAt(new RoomPosition(s.x, s.y, pos.roomName))) {
                delete positionMap[s.x + ":" + s.y];
                return;
            }
            const room = Game.rooms[pos.roomName];
            if (room.isOpen(s)) {
                delete positionMap[s.x + ":" + s.y];
            }
        });
        for (let key in positionMap) {
            if (key && positionMap[key]) {
                return positionMap[key];
            }
        }
        return null;
    }

    public hasPlannedStructureAt(roomPosition:RoomPosition):boolean {
        const room = Game.rooms[roomPosition.roomName];
        if (!room.memory['sites']) {
            return false;
        }
        for (let i = 0; i < 9; i++) {
            let key = roomPosition.x + ":" + roomPosition.y;
            if (room.memory['sites'][i] && room.memory['sites'][i][key]) {
                return true;
            }
        }
        return false;
    }

    public getCenterOfArray(roomObjects:Array<RoomObject>, room:Room):RoomPosition {
        let maxX = 50;
        let minX = 0;
        let maxY = 50;
        let minY = 0;
        let roomName = room.name;
        _.forEach(roomObjects, (entity:RoomObject) => {
            if (!entity || !entity.pos) {
                return;
            }
            maxX = entity.pos.x > maxX ? entity.pos.x : maxX;
            minX = entity.pos.x < minX ? entity.pos.x : minX;
            maxY = entity.pos.y > maxY ? entity.pos.y : maxY;
            minY = entity.pos.y < minY ? entity.pos.y : minY;
        });
        let x = Math.round(minX + Math.floor(Math.abs(maxX - minX) / 2));
        let y = Math.round(minY + Math.floor(Math.abs(maxY - minY) / 2));
        return new RoomPosition(x, y, roomName);
    }
}
