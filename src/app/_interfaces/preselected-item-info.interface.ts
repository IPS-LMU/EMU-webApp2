import {IItem} from './annot-json.interface';

export interface PreselectedItemInfo {
    item: IItem;
    neighbours: {left: IItem; right: IItem};
    isFirst: boolean;
    isLast: boolean;
}
