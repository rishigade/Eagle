/*               "Copyright 2020 Infosys Ltd.
               Use of this source code is governed by GPL v3 license that can be found in the LICENSE file or at https://opensource.org/licenses/GPL-3.0
               This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3" */
import { NsContent } from '../../_services/widget-content.model'

export interface IReqMarkAsComplete {
  content_type: NsContent.EContentTypes,
  current: ['1'],
  max_size: 1,
  mime_type: NsContent.EMimeTypes,
  user_id_type: 'uuid',
}
