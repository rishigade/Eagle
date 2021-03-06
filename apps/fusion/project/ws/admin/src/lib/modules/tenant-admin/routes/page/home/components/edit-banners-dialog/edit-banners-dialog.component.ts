/*               "Copyright 2020 Infosys Ltd.
               Use of this source code is governed by GPL v3 license that can be found in the LICENSE file or at https://opensource.org/licenses/GPL-3.0
               This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3" */
import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

export interface IBanners {
  xs: IBannerFile,
  s: IBannerFile,
  m: IBannerFile,
  l: IBannerFile,
  xl: IBannerFile
}

export interface IBannerFile {
  url: string
  file: File | null
}

export type TBannerSize = 'xs' | 's' | 'm' | 'l' | 'xl'

@Component({
  selector: 'ws-admin-edit-banners-dialog',
  templateUrl: './edit-banners-dialog.component.html',
  styleUrls: ['./edit-banners-dialog.component.scss'],
})

export class EditBannersDialogComponent implements OnInit {

  isUploading = false
  newBanners: IBanners
  constructor(
    public dialogRef: MatDialogRef<EditBannersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.newBanners = {
      xs: {
        file: null,
        url: '',
      },
      s: {
        file: null,
        url: '',
      },
      m: {
        file: null,
        url: '',
      },
      l: {
        file: null,
        url: '',
      },
      xl: {
        file: null,
        url: '',
      },
    }
  }

  selectBanner(file: File, size: TBannerSize) {
    this.newBanners[size].file = file
  }

  ngOnInit() {
  }

}
