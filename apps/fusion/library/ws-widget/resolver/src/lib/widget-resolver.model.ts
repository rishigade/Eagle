/*               "Copyright 2020 Infosys Ltd.
               Use of this source code is governed by GPL v3 license that can be found in the LICENSE file or at https://opensource.org/licenses/GPL-3.0
               This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3" */
import { Type } from '@angular/core'
import { SafeStyle } from '@angular/platform-browser'

export namespace NsWidgetResolver {
  export type UnitPermissionPrimitive = undefined | null | string
  export interface IUnitPermissionObject {
    all: UnitPermissionPrimitive | string[]
    none: UnitPermissionPrimitive | string[]
    some: UnitPermissionPrimitive | string[]
  }
  export type UnitPermission =
    | UnitPermissionPrimitive
    | string[]
    | IUnitPermissionObject
    | Pick<IUnitPermissionObject, 'all'>
    | Pick<IUnitPermissionObject, 'none'>
    | Pick<IUnitPermissionObject, 'some'>
    | Exclude<IUnitPermissionObject, 'all'>
    | Exclude<IUnitPermissionObject, 'none'>
    | Exclude<IUnitPermissionObject, 'some'>
  export interface IPermissions {
    enabled: boolean
    available: boolean
    roles?: UnitPermission
    features?: UnitPermission
    groups?: UnitPermission
  }

  export interface IBaseConfig {
    widgetType: string
    widgetSubType: string
  }

  export interface IRegistrationConfig extends IBaseConfig {
    component: Type<IWidgetData<any>>
  }

  export interface IRegistrationsPermissionConfig extends IBaseConfig {
    widgetPermission?: IPermissions
  }

  export interface IRenderConfigWithTypedData<T> extends IRegistrationsPermissionConfig {
    widgetData: T
    widgetInstanceId?: string
    widgetHostClass?: string
    widgetHostStyle?: { [key: string]: string }
  }
  export type IRenderConfigWithAnyData = IRenderConfigWithTypedData<any>
  export interface IWidgetData<T>
    extends Omit<IRenderConfigWithTypedData<T>, 'widgetPermission' | 'widgetHostStyle'> {
    widgetSafeStyle?: SafeStyle
    updateBaseComponent: (
      widgetType: string,
      widgetSubType: string,
      widgetInstanceId?: string,
      widgetHostClass?: string,
      widgetSafeStyle?: SafeStyle,
    ) => void
  }
}
