
import React from 'react'
import { __win_AllRoutes, curHistory } from './key'
export const wrapParent = (r, comp = null, props) => {
    let target = r.component ? <r.component  {...props}> {r.children ? comp : null}</r.component> : null;
    if (r.__parent && r.__parent.component) {
        return wrapParent(r.__parent, target, props)
    }
    return target
}
export const getRoute = (pathname) => {
    return window[__win_AllRoutes].find(d => d.props.__r.path === pathname).props.__r;
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
export const rsUtils = utils;