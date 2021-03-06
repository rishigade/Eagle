/*               "Copyright 2020 Infosys Ltd.
               Use of this source code is governed by GPL v3 license that can be found in the LICENSE file or at https://opensource.org/licenses/GPL-3.0
               This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3" */
import { Component, OnInit } from '@angular/core'
import { NsPage, ConfigurationsService } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  constructor(private configSvc: ConfigurationsService) {
    this.pageNavbar = this.configSvc.pageNavBar
  }

  ngOnInit() {}
}
