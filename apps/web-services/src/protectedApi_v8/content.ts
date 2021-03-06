/*               "Copyright 2020 Infosys Ltd.
               Use of this source code is governed by GPL v3 license that can be found in the LICENSE file or at https://opensource.org/licenses/GPL-3.0
               This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3" */
import axios from 'axios'
import { Router } from 'express'
import request from 'request'
import { axiosRequestConfig } from '../configs/request.config'
import { ECollectionTypes, IContent, IContentMinimal } from '../models/content.model'
import { IPaginatedApiResponse } from '../models/paginatedApi.model'
import { getMinimalContent, processContent } from '../utils/contentHelpers'
import { CONSTANTS } from '../utils/env'
import { logError } from '../utils/logger'
import { ERROR } from '../utils/message'
import { extractUserIdFromRequest } from '../utils/requestExtract'
import { getPlaylist } from './user/playlist'

export const VALID_HIERARCHY_TYPES = new Set(['all', 'minimal', 'detail'])
const MINIMAL_CONTENT_FIELDS = [
  'appIcon',
  'artifactUrl',
  'children',
  'complexityLevel',
  'contentType',
  'description',
  'downloadUrl',
  'duration',
  'identifier',
  'lastUpdatedOn',
  'learningMode',
  'mimeType',
  'name',
  'resourceCategory',
  'size',
  'status',
]
const DETAIL_CONTENT_FIELDS = [
  ...MINIMAL_CONTENT_FIELDS,
  'idealScreenSize',
  'isExternal',
  'isIframeSupported',
  'learningObjective',
  'preRequisites',
  'resourceCategory',
  'resourceType',
  'skills',
  'ssoEnabled',
  'subTitles',
  'tags',
  'topics',
  'sourceName',
  'sourceShortName',
  'labels',
  'totalLikes',
  'subTitle',
  'references',
]

const API_END_POINTS = {
  addHierarchy: (apiType: string) => `${CONSTANTS.AUTHORING_BACKEND}/action/content/kb/${apiType}`,
  externalContentAccess: (contentId: string, userId: string) =>
    `${CONSTANTS.SB_EXT_API_BASE_2}/v1/sources/${contentId}/users/${userId}`,
  hierarchy: (contentId: string) =>
    `${CONSTANTS.SB_EXT_API_BASE_2}/v1/content/hierarchy/${contentId}`,
  likeCount: `${CONSTANTS.SB_EXT_API_BASE_2}/v1/likes-count`,
  multiple: `${CONSTANTS.SB_EXT_API_BASE_2}/v1/content/metas`,
  next: `${CONSTANTS.NODE_API_BASE_3}/api/v1/moreLikeThis`,
  parent: `${CONSTANTS.SB_EXT_API_BASE}/v1`,
  removeSubset: `${CONSTANTS.SB_EXT_API_BASE_2}/v4/users/goals/resources`,
  searchAutoComplete: `${CONSTANTS.ES_BASE}`,
  searchV4: `${CONSTANTS.SB_EXT_API_BASE}/search4`,
  searchV5: `${CONSTANTS.SB_EXT_API_BASE}/search5`,
  searchV6: `${CONSTANTS.SB_EXT_API_BASE}/v6/search`,
  setS3Cookie: `${CONSTANTS.CONTENT_API_BASE}/contentv3/cookie`,
  updateHierarchy: `${CONSTANTS.AUTHORING_BACKEND}/action/content/hierarchy/update`,
}

export const contentApi = Router()

contentApi.get('/multiple/:ids', async (req, res) => {
  try {
    const org = req.header('org')
    const rootOrg = req.header('rootOrg')
    if (!org || !rootOrg) {
      res.status(400).send(ERROR.ERROR_NO_ORG_DATA)
      return
    }
    const ids = req.params.ids.split(',')
    const response = await getMultipleContent(ids, rootOrg, org, extractUserIdFromRequest(req))
    res.json(response)
  } catch (err) {
    logError('ERROR in MULTI GET CONTENT >', err)
    res
      .status((err && err.response && err.response.status) || 500)
      .send((err && err.response && err.response.data) || err)
  }
})

export async function getMultipleContent(
  ids: string[],
  rootOrg: string,
  org: string,
  userId: string
) {
  const requestBody = {
    accessCheck: false,
    fields: MINIMAL_CONTENT_FIELDS,
    fieldsPassed: true,
    identifiers: ids,
    org,
    rootOrg,
    userId,
  }
  const response = await axios({
    ...axiosRequestConfig,
    data: requestBody,
    method: 'POST',
    url: API_END_POINTS.multiple,
  })
  if (Array.isArray(response.data) && response.data.length) {
    return response.data.map((unitContent) => processContent(unitContent))
  } else {
    return []
  }
}

contentApi.get('/parents/:contentId', async (req, res) => {
  try {
    const contentId = req.params.contentId
    const response = await getParentDetails(contentId)
    res.json(response)
  } catch (err) {
    res.status((err && err.response && err.response.status) || 500).send(err)
  }
})
export async function getParentDetails(contentId: string) {
  try {
    const response = await axios.get(
      `${API_END_POINTS.parent}/${contentId}/parents/read`,
      axiosRequestConfig
    )
    const parents = response.data.result.response.parents
    const result: IContentMinimal[] = []
    for (const parent in parents) {
      if (parent) {
        (parents[parent] as IContent[]).forEach((content) => {
          result.push(getMinimalContent(content))
        })
      }
    }
    return result
  } catch (error) {
    logError('CONTENT PARENT FETCH ERROR >', error)
    return error
  }
}

contentApi.get('/next/:contentId', async (req, res) => {
  const contentType = req.query.contentType
  try {
    const org = req.header('org')
    const rootOrg = req.header('rootOrg')
    if (!org || !rootOrg) {
      res.status(400).send(ERROR.ERROR_NO_ORG_DATA)
      return
    }
    const contentId = req.params.contentId
    const response = await axios({
      ...axiosRequestConfig,
      headers: {
        org,
        rootOrg,
      },
      method: 'GET',
      url: contentType
        ? `${API_END_POINTS.next}/${contentId}?contentType=${contentType}`
        : `${API_END_POINTS.next}/${contentId}`,
    })
    res.json(
      response.data.result.response.map((content: IContent) => getMinimalContent(content)) || []
    )
  } catch (err) {
    logError('WHATS NEXT API ERROR>', err)
    res.status((err && err.response && err.response.status) || 500).send(err)
  }
})

contentApi.post('/likeCount', async (req, res) => {
  try {
    const rootOrg = req.header('rootOrg')
    const response = await axios.post(API_END_POINTS.likeCount, req.body, {
      ...axiosRequestConfig,
      headers: { rootOrg },
    })
    res.send(response.data)
  } catch (err) {
    logError('ERROR FETCHING LIKE COUNT -> ', err)
    res
      .status((err && err.response && err.response.status) || 500)
      .send((err && err.response && err.response.data) || err)
  }
})

contentApi.get('/searchAutoComplete', async (req, res) => {
  try {
    const rootOrg = req.header('rootOrg')
    const org = req.header('org')
    const query = req.query.q
    const lang = req.query.l
    const body = {
      _source: ['searchTerm'],
      query: {
        bool: {
          filter: [
            {
              term: {
                rootOrg,
              },
            },
            {
              term: {
                org,
              },
            },
          ],
          should: [
            {
              prefix: {
                'searchTermAnalysed.keyword': {
                  boost: 4,
                  value: query,
                },
              },
            },
            {
              prefix: {
                searchTermAnalysed: {
                  boost: 2,
                  value: query,
                },
              },
            },
          ],
        },
      },
      size: 20,
    }
    const response = await axios.request({
      auth: {
        password: CONSTANTS.ES_PASSWORD,
        username: CONSTANTS.ES_USERNAME,
      },
      data: body,
      method: 'POST',
      ...axiosRequestConfig,
      url: `${API_END_POINTS.searchAutoComplete}/searchautocomplete_${lang}/autocomplete/_search`,
    })
    let data = []
    if (response.data && response.data.hits && response.data.hits.hits) {
      data = response.data.hits.hits.filter((result: { _source: { searchTerm: string } }) => {
        return result._source.searchTerm.length
      })
    }
    res.json(data)
  } catch (err) {
    res.status((err && err.response && err.response.status) || 500)
  }
})

// tslint:disable-next-line: no-any
export async function searchV5(requestBody: any) {
  const response = await axios.post(API_END_POINTS.searchV5, requestBody, axiosRequestConfig)
  const result = response.data && response.data.result && response.data.result.response
  const contents: IContent[] = result.result
  if (Array.isArray(contents)) {
    result.result = contents.map((content) => processContent(content))
  }
  return (
    result || {
      filters: [],
      filtersUsed: [],
      result: [],
      totalHits: 0,
    }
  )
}

contentApi.post('/searchV5', async (req, res) => {
  try {
    const userId = extractUserIdFromRequest(req)
    const reqBody = {
      ...req.body,
      request: {
        ...req.body.request,
        rootOrg: req.header('rootOrg'),
        uuid: req.body.request.uuid ? req.body.request.uuid : userId,
      },
    }

    const response = await searchV5(reqBody)
    res.json(response)
  } catch (err) {
    logError('SEARCH API ERROR >', err)
    res.status((err && err.response && err.response.status) || 500).send(err)
  }
})

contentApi.post('/searchRegionRecommendation', async (req, res) => {
  try {
    const org = req.header('org')
    const rootOrg = req.header('rootOrg')
    if (!org || !rootOrg) {
      res.status(400).send(ERROR.ERROR_NO_ORG_DATA)
      return
    }
    const userId = extractUserIdFromRequest(req)
    let reqBody = {
      ...req.body,
      request: {
        ...req.body.request,
        rootOrg: req.header('rootOrg'),
        uuid: userId,
      },
    }
    let response = await searchV5(reqBody)
    if (!response.totalHits && reqBody.request.defaultLabel) {
      reqBody = {
        ...reqBody,
        request: {
          ...reqBody.request,
          filters: {
            ...reqBody.request.filters,
            labels: [reqBody.request.defaultLabel],
          },
        },
      }
      response = await searchV5(reqBody)
    }
    const returnResponse: IPaginatedApiResponse = {
      contents: [],
      hasMore: false,
    }
    if (response.result.length) {
      const data = await getContentDetails(
        response.result[0].identifier,
        rootOrg,
        org,
        userId,
        'minimal'
      )
      returnResponse.contents = data.children
    }
    res.json(returnResponse)
  } catch (err) {
    res.status((err && err.response && err.response.status) || 500).send(err)
  }
})

contentApi.post('/searchV6', async (req, res) => {
  try {
    const body = {
      ...req.body,
      rootOrg: req.header('rootOrg'),
      uuid: extractUserIdFromRequest(req),
    }
    const response = await axios.post(API_END_POINTS.searchV6, body, axiosRequestConfig)
    const contents: IContent[] = response.data.result
    if (Array.isArray(contents)) {
      response.data.result = contents.map((content) => processContent(content))
    }
    res.json(response.data || {
      filters: [],
      filtersUsed: [],
      notVisibleFilters: [],
      result: [],
      totalHits: 0,
    })
  } catch (err) {
    logError('SEARCH V6 API ERROR >', err)
    res.status((err && err.response && err.response.status) || 500).send(err)
  }
})

contentApi.post('/setCookie', async (req, res) => {
  try {
    const url = API_END_POINTS.setS3Cookie
    const body = {
      json: {
        ...req.body,
        uuid: extractUserIdFromRequest(req),
      },
    }
    const bodyWithConfigRequestOptions = { ...body, ...axiosRequestConfig }
    request
      .post(url, bodyWithConfigRequestOptions)
      .on('response', (_response) => {
        // tslint:disable-next-line: no-console
        // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>\n SET COOKIE RESPONSE HEADERS >>\n', response.headers)
      })
      .on('error', (err) => {
        // tslint:disable-next-line: no-console
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>\n ALERT! SET COOKIE ERROR >>\n', err)
      })
      .pipe(res)
  } catch (err) {
    res.status((err && err.response && err.response.status) || 500).send(err)
  }
})

contentApi.post('/setImageCookie', async (req, res) => {
  try {
    const body = req.body
    const url = `${API_END_POINTS.setS3Cookie}/images`
    const bodyInJson = {
      json: body,
    }
    const bodyWithConfigRequestOptions = { ...bodyInJson, ...axiosRequestConfig }
    request.post(url, bodyWithConfigRequestOptions).pipe(res)
  } catch (err) {
    res.status((err && err.response && err.response.status) || 500).send(err)
  }
})

contentApi.post('/getWebModuleManifest', async (req, res) => {
  try {
    if (!req.body.url || !req.body.url.length) {
      res.status(400).send()
    }
    const url = req.body.url
    const response = await axios.get(`${url}`, axiosRequestConfig)
    res.json(response.data)
  } catch (err) {
    res.status((err && err.response && err.response.status) || 500).send(err)
  }
})

contentApi.get('/getWebModuleFiles', async (req, res) => {
  try {
    const url = req.query.url
    const response = await axios.get(`${url}`, axiosRequestConfig)
    res.json(response.data)
  } catch (err) {
    res
      .status((err && err.response && err.response.status) || 500)
      .send((err && err.response && err.response.data) || err)
  }
})

contentApi.get('/collection/:collectionType/:collectionId', async (req, res) => {
  try {
    const org = req.header('org')
    const rootOrg = req.header('rootOrg')
    const userId = extractUserIdFromRequest(req)
    if (!org || !rootOrg) {
      res.status(400).send(ERROR.ERROR_NO_ORG_DATA)
      return
    }

    const { collectionType, collectionId } = req.params
    let parent = {}
    let contentIds = []
    if (collectionType === ECollectionTypes.PLAYLIST) {
      const playlist = await getPlaylist(userId, collectionId, rootOrg)
      parent = {
        appIcon: playlist.icon,
        contentType: 'Playlist',
        duration: playlist.duration,
        identifier: collectionId,
        name: playlist.name,
      }
      contentIds = playlist.contents.map((content) => content.identifier)
    } else if (collectionType === ECollectionTypes.GOAL) {
      parent = {
        appIcon: undefined,
        contentType: 'Goal',
        description: 'Dummy description for goal',
        duration: 1,
        identifier: collectionId,
        name: 'Dummy Goal',
      }
      contentIds = ['lex_auth_012795695101108224220']
    } else {
      res.status(400).send({ error: 'ERROR_INVALID_COLLECTION_TYPE' })
      return
    }

    const contents = await getMultipleContent(contentIds, rootOrg, org, userId)

    res.send({
      data: {
        ...parent,
        children: contents,
      },
      totalContents: contentIds.length,
    })
  } catch (err) {
    res
      .status((err && err.response && err.response.status) || 500)
      .send((err && err.response && err.response.data) || err)
  }
})

contentApi.post('/removeSubset', async (req, res) => {
  try {
    const response = await axios.post(
      API_END_POINTS.removeSubset,
      { goal_content_id: req.body.contentIds },
      axiosRequestConfig
    )

    res.status(response.status).send(response.data)
  } catch (err) {
    res
      .status((err && err.response && err.response.status) || 500)
      .send((err && err.response && err.response.data) || err)
  }
})

contentApi.post('/hierarchy/update', async (req, res) => {
  try {
    const org = req.header('org')
    const rootOrg = req.header('rootOrg')
    if (!org || !rootOrg) {
      res.status(400).send(ERROR.ERROR_NO_ORG_DATA)
      return
    }
    const response = await axios.post(
      `${API_END_POINTS.updateHierarchy}?rootOrg=${rootOrg}&org=${org}&wid=${req.header('wid')}`,
      req.body,
      axiosRequestConfig
    )
    res.status(response.status).send(response.data)
  } catch (err) {
    res
      .status((err && err.response && err.response.status) || 500)
      .send((err && err.response && err.response.data) || err)
  }
})

contentApi.post('/kb/:updateType', async (req, res) => {
  try {
    const { updateType } = req.params
    const org = req.header('org')
    const rootOrg = req.header('rootOrg')
    if (!org || !rootOrg) {
      res.status(400).send(ERROR.ERROR_NO_ORG_DATA)
      return
    }
    const response = await axios.post(
      `${API_END_POINTS.addHierarchy(updateType)}?rootOrg=${rootOrg}&org=${org}&wid=${req.header(
        'wid'
      )}`,
      req.body,
      axiosRequestConfig
    )
    res.status(response.status).send(response.data)
  } catch (err) {
    res
      .status((err && err.response && err.response.status) || 500)
      .send((err && err.response && err.response.data) || err)
  }
})

contentApi.post('/:contentId', async (req, res) => {
  try {
    const org = req.header('org')
    const rootOrg = req.header('rootOrg')
    if (!org || !rootOrg) {
      res.status(400).send(ERROR.ERROR_NO_ORG_DATA)
      return
    }
    const { contentId } = req.params
    const additionalFields = req.body.additionalFields
    const hierarchyType = req.query.hierarchyType
    const response = await getContentDetails(
      contentId,
      rootOrg,
      org,
      extractUserIdFromRequest(req),
      hierarchyType,
      additionalFields
    )
    if (!response.hasAccess) {
      res.status(401).send()
      return
    }
    res.json(response)
  } catch (err) {
    res
      .status((err && err.response && err.response.status) || 500)
      .send((err && err.response && err.response.data) || err)
  }
})

export async function getContentDetails(
  contentId: string,
  rootOrg: string,
  org: string,
  userId: string,
  hierarchyType: string,
  additionalFields: string[] = []
) {
  const url = API_END_POINTS.hierarchy(contentId)

  let fields: string[] = []
  let fieldsPassed = true
  if (!VALID_HIERARCHY_TYPES.has(hierarchyType)) {
    hierarchyType = 'detail'
  }
  if (hierarchyType === 'minimal') {
    fields = [...additionalFields, ...MINIMAL_CONTENT_FIELDS]
  } else if (hierarchyType === 'detail') {
    fields = [...additionalFields, ...DETAIL_CONTENT_FIELDS]
  } else {
    fieldsPassed = false
    fields = []
  }
  const requestBody = {
    fields,
    fieldsPassed,
    org,
    rootOrg,
    userId,
  }
  const response = await axios({
    ...axiosRequestConfig,
    data: requestBody,
    method: 'POST',
    url,
  })
  if (response.data.identifier) {
    return processContent(response.data)
  } else {
    throw new Error('NO_CONTENT')
  }
}

contentApi.get('/external-access/:id', async (req, res) => {
  try {
    const id = req.params.id
    const org = req.header('org')
    const rootOrg = req.header('rootOrg')
    if (!org || !rootOrg) {
      res.status(400).send(ERROR.ERROR_NO_ORG_DATA)
      return
    }
    const response = await axios.get(
      `${API_END_POINTS.externalContentAccess(id, extractUserIdFromRequest(req))}`,
      {
        ...axiosRequestConfig,
        headers: {
          org,
          rootOrg,
        },
      }
    )
    res.status(response.status).send(response.data)
  } catch (err) {
    res
      .status((err && err.response && err.response.status) || 500)
      .send((err && err.response && err.response.data) || err)
  }
})
