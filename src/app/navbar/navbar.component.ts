import { Component, OnInit } from '@angular/core';
import { QwiklabsProfileLinkService } from '@app/services/qwiklabs-profile-link.service';
import { FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import QwiklabsHelper from '@app/helpers/qwiklabs-helper';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public profileSearchText: string = '';
  public linkFormControl: FormControl;

  private _linkService: QwiklabsProfileLinkService;
  private _route: ActivatedRoute;
  private _router: Router;

  constructor(
    route: ActivatedRoute,
    router: Router,
    linkService: QwiklabsProfileLinkService) { 
    this._linkService = linkService;
    this._route = route;
    this._router = router;
  }

  linkValidator (control: AbstractControl): {[key: string]: any} | null {
    if (!QwiklabsHelper.isProfileLinkCorrect(control.value)) {
      return {
        invalidLink: {
          value: control.value,
        }
      }
    }
    return null;
  }

  ngOnInit(): void {
    this.linkFormControl = new FormControl(this.profileSearchText, [
      Validators.required,
      this.linkValidator,
    ]);
  }

  onKeyup(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      event.preventDefault();

      this.linkFormControl.markAsTouched();
      if (QwiklabsHelper.isProfileLinkCorrect(this.profileSearchText)) {
        this.submitLink();
      }
    }
  }

  submitLink(): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {
        link: this.profileSearchText,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
