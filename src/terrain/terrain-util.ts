import * as _ from "lodash";

export class TerrainUtil {
    static isOpen(s:LookAtResultWithPos): boolean {
        return !((s.type !== 'terrain' || s.terrain !== 'wall') &&
            s.type !== 'structure' && s.type !== 'constructionSite');
    }

    static isSpotOpen(pos:RoomPosition, structureType: StructureConstant):boolean {
        let isOpen = true;
        _.forEach(Game.rooms[pos.roomName].lookAt(pos), (s:LookAtResultWithPos) => {
            if (!isOpen) {
                return;
            }
            if (structureType === STRUCTURE_EXTRACTOR) {
                if (s.type === 'structure' && s.structure.structureType === STRUCTURE_EXTRACTOR) {
                    isOpen = false;
                }
            } else if (TerrainUtil.isOpen(s)) {
                isOpen = false;
            }
        });
        return isOpen;
    }

    static canPlaceRampart(pos:RoomPosition):boolean {
        let isOpen = true;
        _.forEach(Game.rooms[pos.roomName].lookAt(pos), (s:LookAtResultWithPos) => {
            if (!isOpen) {
                return;
            }
            if ((s.type === 'structure' && s.structure.structureType === STRUCTURE_RAMPART) ||
                (s.type === 'terrain' && s.terrain === 'wall') || s.type === 'constructionSite') {
                isOpen = false;
            }
        });
        return isOpen;
    }
}
