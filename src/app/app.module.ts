import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { MainlayoutComponent } from './main-layout/mainlayout.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

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
import { BundleListSideBarComponent } from './bundle-list-side-bar/bundle-list-side-bar.component';
import { LevelComponent } from './level/level.component';
import { OsciComponent } from './osci/osci.component';

@NgModule({
  declarations: [
    AppComponent,
    MainlayoutComponent,
    BundleListSideBarComponent,
    LevelComponent,
    OsciComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
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
  ],
  providers: [
    MatIconRegistry
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
