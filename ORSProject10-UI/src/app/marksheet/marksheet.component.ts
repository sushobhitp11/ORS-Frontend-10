import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseCtl } from '../base.component';
import { ActivatedRoute } from '@angular/router';
import { ServiceLocatorService } from '../service-locator.service';

@Component({
  selector: 'app-marksheet',
  templateUrl: './marksheet.component.html',
  styleUrls: ['./marksheet.component.css']
})
export class MarksheetComponent extends BaseCtl {

  getKey = false;
  selected = null;
  fileToUpload: File = null;
  marksheetForm: FormGroup = null;
  uploadForm: FormGroup;

  // ✅ FORM FIXED HERE (MOST IMPORTANT)
  form: any = {
    error: false,
    message: null,

    preload: {
      studentList: []
    },

    data: {
      id: 0,
      studentId: '',
      rollNo: '',
      physics: '',
      chemistry: '',
      maths: '',
      imageId: ''
    },

    inputerror: {},
  };

  constructor(
    public locator: ServiceLocatorService,
    public route: ActivatedRoute,
    private httpClient: HttpClient
  ) {
    super(locator.endpoints.MARKSHEET, locator, route);
  }

  // ✅ SUBMIT METHOD
  submit() {
    const _self = this;

    this.serviceLocator.httpService.post(
      this.api.save,
      this.form.data,
      function (res) {

        _self.form.error = !res.success;
        _self.form.message = res.result.message;

        if (res.success) {
          _self.form.data.id = res.result.data;

          if (_self.fileToUpload) {
            _self.myFile();
          }
        } else {
          if (res.result.inputerror) {
            _self.form.inputerror = res.result.inputerror;
          }
        }
      }
    );
  }

  // ✅ FILE SELECT
  onFileSelect(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  // ✅ UPLOAD
  onUpload(marksheetform: FormData) {
    this.submit();
  }

  // ✅ UPLOAD FILE TO SERVER
  myFile() {
    this.onSubmitProfile(this.fileToUpload, this.marksheetForm)
      .subscribe(data => {}, error => {});
  }

  onSubmitProfile(fileToUpload: File, marksheetForm: FormGroup) {
    const formData = new FormData();
    formData.append('file', fileToUpload);

    return this.httpClient.post(
      "http://localhost:8084/User/profilePic/" + this.form.data.id,
      formData
    );
  }

  // ✅ VALIDATION
  validate() {
    return this.validateForm(this.form.data);
  }

  validateForm(form) {
    let flag = true;
    const validator = this.serviceLocator.dataValidator;

    flag = flag && validator.isNotNullObject(form.rollNo);
    flag = flag && validator.isNotNullObject(form.studentId);
    flag = flag && validator.isNotNullObject(form.physics);
    flag = flag && validator.isNotNullObject(form.chemistry);
    flag = flag && validator.isNotNullObject(form.maths);

    return flag;
  }

  // ✅ POPULATE DATA WHEN EDIT MODE
  populateForm(form, data) {
    form.id = data.id;
    form.studentId = data.studentId;
    form.rollNo = data.rollNo;
    form.physics = data.physics;
    form.chemistry = data.chemistry;
    form.maths = data.maths;
    form.imageId = data.imageId;
  }
}
