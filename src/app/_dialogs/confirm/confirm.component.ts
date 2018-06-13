import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmDialogComponent {
  text: string = "test12";

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  setText(txt: string) {
    console.log(txt);
    this.text = txt;
  }
}
