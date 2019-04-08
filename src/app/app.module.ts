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

// Import KonvaModule
import {  } from 'konva/lib';

import { BundleListSideBarComponent } from './bundle-list-side-bar/bundle-list-side-bar.component';
import { LevelComponent } from './level/level.component';
import { OsciComponent } from './osci/osci.component';
import { SpectroComponent } from './spectro/spectro.component';
import { SsffTrackComponent } from './ssff-track/ssff-track.component';
import { ConfirmDialogComponent } from './_dialogs/confirm/confirm.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HandleGlobalKeyStrokesDirective } from './_directives/handle-global-key-strokes.directive';
import { ConnectComponent } from './_dialogs/connect/connect.component';
import { GhostLevelComponent } from './ghost-level/ghost-level.component';
import { ViewportInfoComponent } from './viewport-info/viewport-info.component';
import { LabelEditorComponent } from './label-editor/label-editor.component';

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
    HandleGlobalKeyStrokesDirective,
    ConnectComponent,
    GhostLevelComponent,
    ViewportInfoComponent,
    LabelEditorComponent
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
    ConfirmDialogComponent,
    ConnectComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
