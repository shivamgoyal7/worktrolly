import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { RawDataId, RawDataType } from 'src/app/Interface/RawDataInterface';
import { User } from 'src/app/Interface/UserInterface';
import { Router } from '@angular/router';
import { ValidationService } from '../../services/validation.service';
import { Location } from '@angular/common';
import { NavbarHandlerService } from 'src/app/services/navbar-handler.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-create-new-sprint',
  templateUrl: './create-new-sprint.component.html',
  styleUrls: ['./create-new-sprint.component.css']
})
export class CreateNewSprintComponent implements OnInit {

  @ViewChild('form') form: NgForm;
  @Input('newSprintId') newSprintId: string;

  componentName: string = "CREATE-NEW-SPRINT";
  startDate: string
  endDate: string
  status: string
  enableLoader: boolean = false;
  user: User;

  public rawData: Observable<RawDataId[]>;
  public rawDocument: AngularFirestoreDocument<RawDataType>;

  public sprintData: Observable<RawDataId[]>;
  public sprintDocument: AngularFirestoreDocument<RawDataType>;

  currentSprintNumber: number;

  constructor(private db: AngularFirestore, private functions: AngularFireFunctions, private router: Router, public validationService: ValidationService, private location: Location, public navbarHandler: NavbarHandlerService, public errorHandlerService: ErrorHandlerService, private backendService: BackendService) { }

  ngOnInit(): void {
    this.navbarHandler.resetNavbar();
    this.navbarHandler.addToNavbar(this.componentName);

    this.getNewSprintId();
  }

  async getNewSprintId() {
    this.rawDocument = this.db.doc<RawDataType>('RawData/AppDetails');
    try {
      await this.rawDocument.ref.get().then(doc => {
        if (doc.exists) {
          var rawData = doc.data();
          this.currentSprintNumber = rawData.CurrentSprintId + 1;
          this.newSprintId = "S" + this.currentSprintNumber;
          this.readSprintData(this.newSprintId);
        } else {
          console.error("Document does not exists!")
        }
      });
      return "Success";
    } catch (error) {
      return "Error";
    }

  }

  async readSprintData(newSprintId: string) {
    var documentName = "Main/" + newSprintId;
    this.sprintDocument = this.db.doc<RawDataType>(documentName);
    try {
      await this.sprintDocument.ref.get().then(doc => {
        if (doc.exists) {
          var sprintData = doc.data();
        }
        else {
        }
      });
      return "ok";
    } catch (error) {
      return "Error";
    }
  }

  async submit() {
    let data = [{ label: "startDate", value: this.startDate },
    { label: "endDate", value: this.endDate },
    { label: "status", value: this.status }];
    var condition = await (this.validationService.checkValidity(this.componentName, data)).then(res => {
      return res;
    });
    if (condition) {
      console.log("Inputs are valid");
      this.createNewSprint();
    }
    else
      console.log("Sprint not created! Validation error");
  }

  async createNewSprint() {
    console.log(this.startDate);
    console.log(this.endDate);
    console.log(this.status);
    this.enableLoader = true;
    const callable = this.functions.httpsCallable('startNewSprint');

    try {
      const result = await callable({AppKey: "", StartDate: this.startDate, EndDate: this.endDate, Status: this.status, NewSprintId: this.currentSprintNumber }).toPromise();

      console.log("Successfully created a new sprint");
      console.log(result);
      this.backendService.currentSprintNumber = 0;
      this.router.navigate(['/']);
    } catch (error) {
      this.errorHandlerService.getErrorCode(this.componentName, "InternalError");
      this.enableLoader = false;
    }

  }

  backToDashboard() {
    this.location.back();
  }

}
