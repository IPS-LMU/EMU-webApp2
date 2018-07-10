import {IItem} from './annot-json.interface';

export interface PreselectedItemInfo {
    /// Object representing the current mouse item
    item: IItem;
    /// Objects of left and right neighbours of the current mouse item
    neighbours: {left: IItem; right: IItem};
    /// true if item is the first item on current level
    isFirst: boolean;
    /// true if item is last item on current level
    /// @todo this description is wrong, this is actually true only if the last item's right boundary is selected
    /// however anyway, this should be renamed
    isLast: boolean;
}
