import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpServiceService } from '../http-service.service';
import { Router } from '@angular/router';
import { DataValidator } from '../utility/data-validator';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';
import { ServiceLocatorService } from '../service-locator.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  endpoint = "http://localhost:8084/Auth";

  form = {
    error: false,
    message: '',
    loginId: '',
    password: '',
    loginUrl: '',
  };

  inputerror = {};
  message = '';

  userparams = {
    url: '',
    sessionExpiredMsg: '',
    methodType: '',
  };


  constructor(private httpService: HttpServiceService, private dataValidator: DataValidator, private router: Router,
    private cookieService: CookieService, private route: ActivatedRoute, private serviceLocator: ServiceLocatorService) {

  }

  /**
   * Initialize component
   */
  ngOnInit() {
    //this.userSessionCheck();
    if(this.httpService.form.error == true){
      this.form.message = this.httpService.form.message;
      this.form.error = this.httpService.form.error;
    }
    var a = '';
    this.serviceLocator.getPathVariable(this.route, function (params) {
      a = params["userparams"];
      console.log('I GOT ID, its logout', a);
    })
    if(a=='true'){
       this.form.message = 'Logout Successfully';
     }
    }

  userSessionCheck() {

    this.route.paramMap.subscribe(params => {
      //  this.userList = params.get('userparams');    
      //  this.userparams=JSON.parse(this.route.snapshot.paramMap.get('userparams'));

      this.userparams = JSON.parse(this.route.snapshot.queryParamMap.get('userparams'));
      if (this.userparams != null) {
        this.form.message = this.userparams.sessionExpiredMsg;
        this.form.loginUrl = this.userparams.url;
      //  console.log('URL-----------------------' + this.userparams.url);
      //  console.log('Message-----------------------' + this.userparams.sessionExpiredMsg);
      //  console.log('Method Type-----------------------' + this.userparams.methodType);
      }

    });
    if (this.form.message != null) {
      this.form.error = true;
    }
  }

  validate() {
    let flag = true;
    flag = flag && this.dataValidator.isNotNull(this.form.loginId);
    console.log(this.form.loginId);
    flag = flag && this.dataValidator.isNotNull(this.form.password);
    console.log(this.form.password);
    return flag;
  }


  signIn() {

  var _self = this;
  this.form.error = false;
  this.form.message = '';

  const requestedUrl = this.httpService.userparams.url; // to get the URI
  console.log('signIn----', this.form);

  this.httpService.post(
    this.endpoint + "/login",
    this.form,

    // ✅ SUCCESS CALLBACK
    function (res) {

      console.log('MyResponse', res);

      _self.form.message = '';
      _self.inputerror = {};

      if (_self.dataValidator.isNotNullObject(res.message)) {
        _self.form.message = res.message[0];
      }

      _self.form.error = !res.success;

      if (_self.dataValidator.isNotNullObject(res.inputerror)) {
        _self.inputerror = res.inputerror;
      }

      if (_self.dataValidator.isTrue(res.success)) {

        _self.httpService.setToken(res.result.token);

        localStorage.setItem("loginId", res.result.loginId);
        localStorage.setItem("token", "Bearer " + res.result.token);
        localStorage.setItem("role", res.result.role);
        localStorage.setItem("fname", res.result.fname);
        localStorage.setItem("lname", res.result.lname);
        localStorage.setItem("userid", res.result.data.id);

        if (requestedUrl != null && requestedUrl != '') {
          _self.router.navigateByUrl(requestedUrl);
        } else {
          _self.router.navigateByUrl('dashboard');
        }
      }
    },

    // ✅ ERROR CALLBACK (YE NAYA ADD HUA HAI)
    function (error) {

      console.error("Login API error", error);

      _self.form.error = true;

      if (error.status === 0) {
        _self.form.message = "Server is not reachable. Please try again later.";
      } else if (error.status === 404) {
        _self.form.message = "Login service not found.";
      } else if (error.status === 500) {
        _self.form.message = "Server error. Please try again later.";
      } else {
        _self.form.message = "Something went wrong.";
      }
    }
  );
}

}