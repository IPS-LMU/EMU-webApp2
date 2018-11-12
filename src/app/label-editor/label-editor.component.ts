import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IItem} from '../_interfaces/annot-json.interface';

@Component({
    selector: 'app-label-editor',
    templateUrl: './label-editor.component.html',
    styleUrls: ['./label-editor.component.css']
})
export class LabelEditorComponent {
    private _item: IItem;

    @Input() set item(value: IItem) {
        this._item = value;
    }

    @Output() edit: EventEmitter<string> = new EventEmitter<string>();
    @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

    public onInput(event: Event) {
        this.edit.emit((event.target as HTMLInputElement).value);
    }

    public value() {
        return this._item.labels[0].value;
    }

    public cancelEdit() {
        this.cancel.emit();
    }
}
