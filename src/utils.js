
import React from 'react'
import { __win_AllRoutes, curHistory } from './key'
export const wrapParent = (r, comp = null, props) => {
    let target = r.component ? <r.component  {...props}> {r.children ? comp : null}</r.component> : null;
    if (r.__parent && r.__parent.component) {
        return wrapParent(r.__parent, target, props)
    }
    return target
}
export const getRoute = (path) => {
    let find = window[__win_AllRoutes].find(d => d.props.__r && d.props.__r.path === path)
    return find ? find.props.__r : { path };
}
export const locationEqual = (a, b) => {
    if (typeof a !== 'object' || typeof b !== 'object') {
        return false
    }
    if (!a.pathname || !b.pathname) {
        return false
    }
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash
}
const utils = {};
Object.defineProperty(utils, 'history', {
    get () {
        return window[curHistory]
    }
})
Object.defineProperty(utils, 'route', {
    get () {
        return window[curHistory] ? window[curHistory].route : null
    }
})
Object.defineProperty(utils, 'push', {
    get () {
        return function (abc) {
            window[curHistory].push(abc)
        }
    }
})
export const rsUtils = utils;