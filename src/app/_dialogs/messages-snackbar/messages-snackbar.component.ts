import {Component, Input, OnInit, AfterViewInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';

import { ViewStateService } from "../../_services/view-state.service";

@Component({
  selector: 'app-messages-snackbar',
  templateUrl: './messages-snackbar.component.html',
  styleUrls: ['./messages-snackbar.component.scss']
})
export class MessagesSnackbarComponent implements OnInit, AfterViewInit {

  constructor(private snackBar: MatSnackBar,
              public view_state_service: ViewStateService) { }

  ngOnInit() {
    this.view_state_service.somethingInProgress.subscribe((message) => {
      if(message !== 'Done!'){
        this.snackBar.open(
          message
        );
      } else {
        this.snackBar.open(
          message,
          '',
          {duration: 500}
        );
      }
      console.log(message);
    });
  }
  ngAfterViewInit() {
  }

}
