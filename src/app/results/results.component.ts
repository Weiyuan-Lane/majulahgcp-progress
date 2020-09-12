import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { QwiklabsProfileLinkService } from '@app/services/qwiklabs-profile-link.service';
import QwiklabsHelper from '@app/helpers/qwiklabs-helper';
import { QwiklabsQuestBadge, QwiklabsTier } from  '@app/types/qwiklabs';
import QuestTiers from '@app/static/tiers.json';
import { FullLoaderService } from '@app/services/full-loader.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent implements OnInit {
  public profileLoaded: boolean = false;
  public profileLink: string = '';
  public uncompletedQuestBadges: QwiklabsQuestBadge[] = [];
  public completedQuestBadges: QwiklabsQuestBadge[] = [];
  public relevantQuestTiers: QwiklabsTier[] = QuestTiers;
  private _loaderService: FullLoaderService;
  private _linkService: QwiklabsProfileLinkService;
  private _cdsRef: ChangeDetectorRef;

  constructor(
    linkService: QwiklabsProfileLinkService,
    loaderService: FullLoaderService,
    cdsRef: ChangeDetectorRef, 
    ) { 
    this._linkService = linkService;
    this._loaderService = loaderService;
    this._cdsRef = cdsRef;
  }

  private async _onLinkChanged(link): Promise<void> {
    this.profileLink = link;
    if (QwiklabsHelper.isProfileLinkCorrect(link)) {
      this._loaderService.setLoading();
      const profile = await QwiklabsHelper.getProfileFrom(link);
      this.uncompletedQuestBadges = QwiklabsHelper.getUncompletedBadges(profile.badges);
      this.completedQuestBadges = QwiklabsHelper.getCompletedBadges(profile.badges);
      this.profileLoaded = true;
      this._loaderService.setLoaded();
    } else {
      // show error message;
      this.profileLoaded = false;
    }

    this._cdsRef.markForCheck();
  }

  ngOnInit(): void {
    this._linkService.profileLink$.subscribe(this._onLinkChanged.bind(this));
  }

}
