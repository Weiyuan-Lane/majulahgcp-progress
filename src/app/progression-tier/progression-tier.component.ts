import { Component, OnInit, Input } from '@angular/core';
import { QwiklabsQuestBadge, QwiklabsTier } from  '@app/types/qwiklabs';

@Component({
  selector: 'app-progression-tier',
  templateUrl: './progression-tier.component.html',
  styleUrls: ['./progression-tier.component.scss']
})
export class ProgressionTierComponent implements OnInit {
  @Input() completedBadges: QwiklabsQuestBadge[];
  @Input() tier: QwiklabsTier;

  public completed: boolean;
  public percentage: number;

  constructor() { }

  ngOnInit(): void {
    this.ngOnChanges();
  }

  ngOnChanges(): void {
    this.completed = this.completedBadges.length >= this.tier.questRequirements;
    this.percentage = Math.ceil(this.completedBadges.length / this.tier.questRequirements * 100);
  }
}
