
import React from 'react'
import { Route, Redirect } from 'react-router-dom';

import { __win_AllRoutes, preHistory, curHistory } from './key'
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
export const inorderRoutes = (r, route, res = []) => {
    if (r.path && (r.component || r.redirect)) {
        res.push(route(r))
    }
    if (Array.isArray(r.children) && r.children.length) {
        for (let x of r.children) {
            x['__parent'] = r;
            inorderRoutes(x, route, res)
        }
    }
    if (Array.isArray(r.aliasPath) && r.aliasPath.length) {
        for (let path of r.aliasPath) {
            if (!/^\//.test(path)) { path = '/' + path }
            res.push(route(Object.assign({}, r, { path, aliasPath: null })))
        }
    }
    return res
}
export const completeAllRoutes = (routesArr, indexPath, noFoundPath) => {
    routesArr = routesArr.concat([
        indexPath ? <Route key={indexPath} exact path="/" render={() => <Redirect to={indexPath} />} /> : null,
        noFoundPath ? <Route key={noFoundPath} render={() => <Redirect to={noFoundPath} />} /> : null
    ]).filter(Boolean);
    window[__win_AllRoutes] = routesArr;
    return routesArr
}
export function __beforeEach(params) {
    const { beforeEach } = this.props;
    const { state, afterEach, location, action } = params;
    const [pre, cur] = [window[preHistory] || {}, window[curHistory] || {}];
    if (state === 'mount') {
        const [to, from] = [cur.location, null]
        beforeEach(to, from, (params = {}) => {
            if (params && typeof params !== 'object') {
                throw TypeError('params type must be object')
            }
            if (params && params.path) {
                cur.push(params.path);
                return
            }
            this.setState({
                finished: true
            }, () => {
                afterEach()
            })
        });
    } else if (state === 'prompt') {

        console.log('location', location)
        if (locationEqual(cur.location, location)) {
            return false
        }
        const { pathname, search } = location
        const [to, from] = [location, cur.location]
        const next = (params) => {
            if (params && typeof params !== 'object') {
                throw TypeError('params type must be object')
            }
            //此处置为false为了next跳转时prompt能顺利跳转
            this.promptPendding = false

            if (params && params.path) {
                cur.push(params.path);
                return
            }
            if (action === 'POP') {
                //回退
                console.log("Backing up...")
                cur.goBack()
            } else {
                //跳转,补全search
                cur.push(pathname + search)
            }
        }
        beforeEach && beforeEach(to, from, next);
        return !beforeEach
    }

}
const utils = {};
Object.defineProperty(utils, 'history', {
    get() {
        return window[curHistory]
    }
})
Object.defineProperty(utils, 'route', {
    get() {
        return window[curHistory] ? window[curHistory].route : null
    }
})
Object.defineProperty(utils, 'push', {
    get() {
        return function (path) {
            window[curHistory]
                ? window[curHistory].push(path)
                : window.location.push(path)
        }
    }
})
export const rsUtils = utils;