import { Component, OnInit } from '@angular/core';
import { HttpServiceService } from '../http-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataValidator } from '../utility/data-validator';
import { CookieService } from 'ngx-cookie-service';
import { ServiceLocatorService } from '../service-locator.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  endpoint = "http://localhost:8084/Auth";

  inputerror: any = {};
  form: any = {
    error: false,
    message: '',
    loginId: '',
    password: '',
    loginUrl: ''
               // ✅ Added inside form
  };

  userparams = {
    url: '',
    sessionExpiredMsg: '',
    methodType: ''
  };

  constructor(
    private httpService: HttpServiceService,
    private dataValidator: DataValidator,
    private router: Router,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private serviceLocator: ServiceLocatorService
  ) { }

  ngOnInit() {

    if (this.httpService.form.error === true) {
      this.form.message = this.httpService.form.message;
      this.form.error = this.httpService.form.error;
    }

    let a = '';
    this.serviceLocator.getPathVariable(this.route, function (params) {
      a = params["userparams"];
      console.log('I GOT ID, its logout', a);
    });

    if (a === 'true') {
      this.form.message = 'Logout Successfully';
    }
  }

  validate() {
    let flag = true;
    flag = flag && this.dataValidator.isNotNull(this.form.loginId);
    flag = flag && this.dataValidator.isNotNull(this.form.password);
    return flag;
  }

  signIn() {

    let _self = this;

    this.form.error = false;

    const requestedUrl = this.httpService.userparams.url;

    this.httpService.post(this.endpoint + "/login", this.form, function (res) {

      console.log('MyResponse', res);

      _self.form.message = '';
      _self.form.inputerror = {};       // ✅ Now part of form

      if (_self.dataValidator.isNotNullObject(res.result.message)) {
        _self.form.message = res.result.message;
      }

      _self.form.error = !res.success;

      if (_self.dataValidator.isNotNullObject(res.result.inputerror)) {
        _self.form.inputerror = res.result.inputerror;   // ✅ Correct Mapping
      }

      if (_self.dataValidator.isTrue(res.success)) {

        _self.httpService.setToken(res.result.token);
        localStorage.setItem("loginId", res.result.loginId);

        let tokenStr = "Bearer " + res.result.token;
        localStorage.setItem("token", tokenStr);
        localStorage.setItem("role", res.result.role);
        localStorage.setItem("fname", res.result.fname);
        localStorage.setItem("lname", res.result.lname);
        localStorage.setItem("userid", res.result.data.id);

        if (requestedUrl) {
          _self.router.navigateByUrl(requestedUrl);
        } else {
          _self.router.navigateByUrl('dashboard');
        }
      }
    });
  }

}
