import { Routes, RouterModule } from '@angular/router';

// import { HomeComponent } from './home/index';
// import { LoginComponent } from './login/index';
// import { MVPAboutComponent } from './mvpabout/mvpabout.component';
// import { AboutComponent } from './about/about.component';
// import { LsrmusersComponent} from './lsrmusers/lsrmusers.component';
//
// import { RegisterComponent } from './register/index';
// import { AuthGuard } from './_guards/index';
// import { ChangepwdComponent } from './changepwd/changepwd.component';
// import { UserdetailsComponent} from './userdetails/userdetails.component';
// import { AdduserComponent } from './adduser/adduser.component';
// import { ListeningsessionComponent } from './listeningsession/listeningsession.component'
//
// import { LsrmpatientsComponent } from './lsrmpatients/lsrmpatients.component'
// import { AddpatientComponent } from './addpatient/addpatient.component'
// import { RecpatientComponent } from './recpatient/recpatient.component'
//
// import {  SearchsentsComponent } from './searchsents/searchsents.component'
//
//
//
// import {SpeechRecorder} from "speechrecorderng";

const appRoutes: Routes = [
  // // routes only available after login; also depending on role
  // { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  // //{ path: '', component: HomeComponent, canActivate: [AuthGuard] },
  // { path: 'lsrmusers', component: LsrmusersComponent, canActivate: [AuthGuard]},
  // { path: 'chpwd', component: ChangepwdComponent, canActivate: [AuthGuard]},
  // { path: 'userdetails', component: UserdetailsComponent, canActivate: [AuthGuard]},
  // { path: 'adduser', component: AdduserComponent, canActivate: [AuthGuard]},
  // { path: 'listeningsession', component: ListeningsessionComponent, canActivate: [AuthGuard]},
  // // patient routes for therapist
  // { path: 'lsrmpatients', component: LsrmpatientsComponent, canActivate: [AuthGuard]},
  // { path: 'addpatient', component: AddpatientComponent, canActivate: [AuthGuard]},
  // { path: 'recpatient', component: RecpatientComponent, canActivate: [AuthGuard]},
  // { path: 'searchsents', component: SearchsentsComponent},
  //
  // // publicly available routes
  // { path: 'login', component: LoginComponent},
  // { path: 'mvpabout', component: MVPAboutComponent},
  // { path: '_register', component: RegisterComponent}, // this has to be removed in the public version
  // { path: 'about', component: AboutComponent},
  //
  //
  // // speech recorder test
  // { path: 'spr', component: SpeechRecorder},
  //
  // otherwise redirect to home
  // { path: '**', redirectTo: '' }

];


export const routing = RouterModule.forRoot(appRoutes);
