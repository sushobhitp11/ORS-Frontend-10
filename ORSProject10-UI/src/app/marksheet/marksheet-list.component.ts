import { Component, OnInit } from '@angular/core';
import { BaseListCtl } from '../base-list.component';
import { ServiceLocatorService } from '../service-locator.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-marksheet-list',
  templateUrl: './marksheet-list.component.html',
  styleUrls: ['./marksheet.component.css']
})
export class MarksheetListComponent extends BaseListCtl {

  imageToShow: any;
  myKey = "";
  
  constructor(
    public locator: ServiceLocatorService, 
    public route: ActivatedRoute, 
    private httpClient: HttpClient
  ) {
    super(locator.endpoints.MARKSHEET, locator, route);
  }

  // ✅ FIXED FORM STRUCTURE (AOT-SAFE)
  form: any = {
    error: false,
    message: null,
    
    preload: {
      marksheetList: []   // ✅ HTML needs this
    },

    data: {
      id: 0               // ✅ HTML checks form.data.id
    },

    inputerror: {},

    searchParams: {
      name: '',
      id: ''
    },

    searchMessage: null,

    list: [],             // ✅ Table loops on form.list
    pageNo: 0
  };

  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  retrieveResonse: any;
  message: string;
  imageName: any;

  // ✅ REQUIRED BY HTML — MUST EXIST
  isMasterSel: boolean = false;
  nextList: number = 1;

  // ✅ AOT-SAFE: must exist (even empty)
  deleteMany() {}
  forward(url: string) { super.forward(url); }
  previous() { super.previous(); }
  next() { super.next(); }
  exit() {}
  checkUncheckAll(event: any) {}
  checklistUpdate() {}

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      this.imageToShow = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  getImage(id: any) {
    this.form.data.id = id;

    this.httpClient.get(
      'http://localhost:8084/Marksheet/profilePic/' + id,
      { responseType: 'blob' }
    ).subscribe(data => {
      this.createImageFromBlob(data);
      this.myKey = id;
    }, error => {
      console.log(error);
    });
  }

}
