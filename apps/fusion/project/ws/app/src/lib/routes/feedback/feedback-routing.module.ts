/*               "Copyright 2020 Infosys Ltd.
               Use of this source code is governed by GPL v3 license that can be found in the LICENSE file or at https://opensource.org/licenses/GPL-3.0
               This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3" */
import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { FeedbackComponent } from './components/feedback/feedback.component'
import { PageResolve } from '@ws-widget/utils/src/lib/resolvers/page.resolver'
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'application',
  },
  {
    path: ':type',
    component: FeedbackComponent,
    data: {
      pageType: 'feature',
      pageKey: 'feedback',
    },
    resolve: {
      feedbackJson: PageResolve,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedbackRoutingModule { }
