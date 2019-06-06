import { Component, Input } from '@angular/core';
import { Flavor } from '../../../entry-flavours/flavor';

@Component({
  selector: 'vEditDistributionProfileFlavors',
  templateUrl: './edit-distribution-profile-flavors.component.html',
  styleUrls: ['./edit-distribution-profile-flavors.component.scss']
})
export class EditDistributionProfileFlavorsComponent {
  @Input() requiredFlavors: Partial<Flavor>[] = [];
}
