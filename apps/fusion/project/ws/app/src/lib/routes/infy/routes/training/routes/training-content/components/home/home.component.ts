/*               "Copyright 2020 Infosys Ltd.
               Use of this source code is governed by GPL v3 license that can be found in the LICENSE file or at https://opensource.org/licenses/GPL-3.0
               This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3" */
import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'

import { NsContent } from '@ws-widget/collection'
import { IResolveResponse } from '@ws-widget/utils'
import { ITrainingUserPrivileges } from '../../../../models/training-api.model'

@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private routeDataSub!: Subscription
  content!: NsContent.IContent | null
  contentError!: any
  trainingCount!: number | null
  trainingCountError!: any
  trainingPrivileges!: ITrainingUserPrivileges | null
  trainingPrivilegesError!: any

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.routeDataSub = this.route.data.subscribe(data => {
      const contentResolve = data.contentResolve as IResolveResponse<NsContent.IContent>
      const trainingCountResolve = data.trainingCountResolve as IResolveResponse<number>
      const trainingPrivilegesResolve = data.trainingPrivilegesResolve as IResolveResponse<
        ITrainingUserPrivileges
      >

      this.content = contentResolve.data
      this.contentError = contentResolve.error

      this.trainingCount = trainingCountResolve.data
      this.trainingCountError = trainingCountResolve.error

      this.trainingPrivileges = trainingPrivilegesResolve.data
      this.trainingPrivilegesError = trainingCountResolve.error
    })
  }

  ngOnDestroy() {
    if (this.routeDataSub) {
      this.routeDataSub.unsubscribe()
    }
  }
}
