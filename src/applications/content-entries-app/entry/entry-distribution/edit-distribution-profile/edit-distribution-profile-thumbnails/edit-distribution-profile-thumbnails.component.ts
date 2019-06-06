import { Component, Input } from '@angular/core';
import { ExtendedVidiunDistributionThumbDimensions } from '../edit-distribution-profile.component';

@Component({
  selector: 'vEditDistributionProfileThumbnails',
  templateUrl: './edit-distribution-profile-thumbnails.component.html',
  styleUrls: ['./edit-distribution-profile-thumbnails.component.scss']
})
export class EditDistributionProfileThumbnailsComponent {
  @Input() requiredThumbnails: ExtendedVidiunDistributionThumbDimensions[] | null = [];
}

