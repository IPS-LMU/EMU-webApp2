import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { MainlayoutComponent } from './main-layout/mainlayout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  MatButtonModule,
  MatCardModule,
  MatExpansionModule,
  MatGridListModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatIconRegistry,
  MatSidenavModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatDialogModule,
  MatSelectModule,
  MatListModule,
  MatSnackBarModule,
  MatTableModule,
  MatDrawerToggleResult,
  MatRadioModule
} from '@angular/material';

import { HotkeyModule } from 'angular2-hotkeys';

import { BundleListSideBarComponent } from './bundle-list-side-bar/bundle-list-side-bar.component';
import { LevelComponent } from './level/level.component';
import { OsciComponent } from './osci/osci.component';
import { SpectroComponent } from './spectro/spectro.component';
import { SsffTrackComponent } from './ssff-track/ssff-track.component';
import { ConfirmDialogComponent } from './_dialogs/confirm/confirm.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HandleGlobalKeyStrokesDirective } from './_directives/handle-global-key-strokes.directive';

@NgModule({
  declarations: [
    AppComponent,
    MainlayoutComponent,
    BundleListSideBarComponent,
    LevelComponent,
    OsciComponent,
    SpectroComponent,
    SsffTrackComponent,
    ConfirmDialogComponent,
    HandleGlobalKeyStrokesDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    routing,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatGridListModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSelectModule,
    MatListModule,
    MatSnackBarModule,
    MatTableModule,
    MatRadioModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    HotkeyModule.forRoot()
  ],
  providers: [
    MatIconRegistry
  ],
  entryComponents: [
    ConfirmDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }