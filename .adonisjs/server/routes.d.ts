import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'rooms.create': { paramsTuple?: []; params?: {} }
    'rooms.join': { paramsTuple?: []; params?: {} }
    'rooms.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'reports.index': { paramsTuple?: []; params?: {} }
    'reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'rooms.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'reports.index': { paramsTuple?: []; params?: {} }
    'reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'rooms.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'reports.index': { paramsTuple?: []; params?: {} }
    'reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'rooms.create': { paramsTuple?: []; params?: {} }
    'rooms.join': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}