/*               "Copyright 2020 Infosys Ltd.
               Use of this source code is governed by GPL v3 license that can be found in the LICENSE file or at https://opensource.org/licenses/GPL-3.0
               This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3" */
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { NsDiscussionForum } from './ws-discussion-forum.model'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const API_END_POINTS = {
  USER_FOLLOW_DATA: `${PROTECTED_SLAG_V8}/user/follow/fetchAll`, // #GET
  USER_FOLLOW: `${PROTECTED_SLAG_V8}/user/follow`, // #POST
  USER_UNFOLLOW: `${PROTECTED_SLAG_V8}/user/follow/unfollow`, // #POST
}

@Injectable({
  providedIn: 'root',
})
export class WsDiscussionForumUserService {
  constructor(private http: HttpClient) { }
  fetchUserFollow(userId: string): Observable<NsDiscussionForum.IUserFollow> {
    return this.http.get<NsDiscussionForum.IUserFollow>(`${API_END_POINTS.USER_FOLLOW_DATA}/${userId}`)
  }
  followUser(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.USER_FOLLOW, request)
  }
  unFollowUser(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.USER_UNFOLLOW, request)
  }
}
