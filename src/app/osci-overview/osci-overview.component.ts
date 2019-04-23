import {Component, Input, OnInit} from '@angular/core';
import { OsciComponent } from '../osci/osci.component';
import {DrawHelperService} from '../_services/draw-helper.service';
import { emuWebappTheme } from '../_utilities/emu-webapp-theme.object';

@Component({
  selector: 'app-osci-overview',
  templateUrl: './osci-overview.component.html',
  styleUrls: ['./osci-overview.component.scss']
})

export class OsciOverviewComponent extends OsciComponent implements OnInit {

  private _overlay_sample_start:number;
  private _overlay_sample_end:number;

  @Input() set overlay_sample_start(value: number) {
    this._overlay_sample_start = value;
    this.redraw();
  }

  @Input() set overlay_sample_end(value: number) {
    this._overlay_sample_end = value;
    this.redraw();
  }

  // protected drawData() {
  //   if (!this.initialised || !this._audio_buffer) {
  //     return;
  //   }
  //
    // DrawHelperService.freshRedrawDrawOsciOnCanvas(
    //   this.mainContext,
    //   this._viewport_sample_start,
    //   this._viewport_sample_end,
    //   this.osciPeaks,
    //   this._audio_buffer,
    //   this._channel,
    //   emuWebappTheme
    // );
  // }
  /**
   * draws markup of osci according to
   * the information that is specified in
   * the viewport
   */
  protected drawMarkup() {
    if (!this.initialised || !this._audio_buffer) {
      return;
    }

    const ctx = this.markupCanvas.nativeElement.getContext('2d');
    const posS = (this.markupCanvas.nativeElement.width / this._audio_buffer.length) * this._overlay_sample_start;
    const posE = (this.markupCanvas.nativeElement.width / this._audio_buffer.length) * this._overlay_sample_end;

    ctx.clearRect(0, 0, this.markupCanvas.nativeElement.width, this.markupCanvas.nativeElement.height);
    ctx.fillStyle = emuWebappTheme.selectionOverlayColor;
    ctx.fillRect(posS, 0, posE - posS, this.markupCanvas.nativeElement.height);
    ctx.strokeStyle = emuWebappTheme.selectionOverlayColor;
    ctx.beginPath();
    ctx.moveTo(posS, 0);
    ctx.lineTo(posS, this.markupCanvas.nativeElement.height);
    ctx.moveTo(posE, 0);
    ctx.lineTo(posE, this.markupCanvas.nativeElement.height);
    ctx.closePath();
    ctx.stroke();

  }

}
