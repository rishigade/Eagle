/*               "Copyright 2020 Infosys Ltd.
               Use of this source code is governed by GPL v3 license that can be found in the LICENSE file or at https://opensource.org/licenses/GPL-3.0
               This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3" */
import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { WidgetContentService, NsContent, BtnFollowService } from '@ws-widget/collection'
import { BtnKbService } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-kb/btn-kb.service'
import { NSProfileData } from '../../../profile/models/profile.model'

@Component({
  selector: 'ws-app-kb-home',
  templateUrl: './kb-home.component.html',
  styleUrls: ['./kb-home.component.scss'],
})
export class KbHomeComponent implements OnInit {
  knowledgeBoards: NsContent.IContentMinimal[] = []
  kbSFetchStatus: TFetchStatus = 'none'
  followContent: NSProfileData.IFollowing[] = []
  following: NsContent.IContentMinimal[] = []
  followingFetchStatus: TFetchStatus = 'none'
  myBoards: NsContent.IContentMinimal[] = []
  myBoardsFetchStatus: TFetchStatus = 'none'
  showCreate = false
  redirectUrl = {
    path: '/app/search/learning',
    qParams: {
      q: 'all',
      f: JSON.stringify({
        contentType: [NsContent.EContentTypes.KNOWLEDGE_BOARD],
      }),
    },
  }
  myKBRedirectUrl = {
    path: '/app/search/learning',
    qParams: {
      q: 'all',
      f: JSON.stringify({
        contentType: [NsContent.EContentTypes.KNOWLEDGE_BOARD],
        creatorContacts: [(this.configSvc.userProfile && this.configSvc.userProfile.userId) || ''],
      }),
    },
  }
  constructor(
    private kbSvc: BtnKbService,
    private contentSvc: WidgetContentService,
    public configSvc: ConfigurationsService,
    private followSvc: BtnFollowService,
  ) { }

  ngOnInit() {
    this.showCreate = (this.configSvc.userRoles || new Set<string>()).has('kb-curator')
    this.kbSFetchStatus = 'fetching'
    this.contentSvc
      .search({
        filters: {
          contentType: [NsContent.EContentTypes.KNOWLEDGE_BOARD],
        },
        sort: [{ lastUpdatedOn: 'desc' }],
        pageSize: 30,
        // sortBy: 'lastUpdatedOn',
      })
      .subscribe(
        response => {
          this.kbSFetchStatus = 'done'
          this.knowledgeBoards = response.result
        },
        _ => {
          this.kbSFetchStatus = 'error'
        })
    this.myBoardsFetchStatus = 'fetching'
    this.kbSvc.getMyKnowledgeBoards().subscribe(
      response => {
        this.myBoards = response.result
        if (response.totalHits > response.result.length) {
          this.myBoardsFetchStatus = 'hasMore'
        } else {
          this.myBoardsFetchStatus = 'done'
        }
      },
      _ => {
        this.myBoardsFetchStatus = 'error'
      })
    this.followed()
  }

  followed() {
    this.followingFetchStatus = 'fetching'
    this.followSvc.getFollowing().subscribe(
      data => {
        this.followContent = data
        this.followContent.find(content => {
          this.following = content['Knowledge Board']
        })
        this.followingFetchStatus = 'done'
      },
      () => {
        this.followingFetchStatus = 'error'
      },
    )
  }

  unfollowed(id: string) {
    this.following = this.following.filter(item => item.identifier !== id)
  }
}
