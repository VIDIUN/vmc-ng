import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranscodingProfileMetadataWidget } from './transcoding-profile-metadata-widget.service';

@Component({
  selector: 'vTranscodingProfileMetadata',
  templateUrl: './transcoding-profile-metadata.component.html',
  styleUrls: ['./transcoding-profile-metadata.component.scss']
})

export class TranscodingProfileMetadataComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('metadataNameInput') public metadataNameInput;

  constructor(public _widgetService: TranscodingProfileMetadataWidget) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  ngAfterViewInit() {
    this.metadataNameInput.nativeElement.focus();
  }
}

