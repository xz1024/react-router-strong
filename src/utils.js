
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
export function __beforeEach(state, location, action) {
    const { beforeEach } = this.props;
    const [pre, cur] = [window[preHistory], window[curHistory]];
    console.log('pre:', pre, '\n', 'cur', cur)
    console.log('state-----', state)
    if (state === 'mount') {
        const to = window[curHistory].route;
        const from = window[preHistory].route;
        if (to.redirect) {
            window[curHistory].push(to.redirect);
            return
        }
        beforeEach && beforeEach(to, from, (params) => {
            if (params && params.path) {
                let r = getRoute(params.path)
                window[curHistory].push(r.redirect || params.path);
                return
            }
            this.setState({
                finished: true
            })
        });
    } else if (state === 'prompt') {
        // console.log('window[curHistory]', window[curHistory])

        const { pathname, search } = location
        if (locationEqual(cur.location, location)) {
            return false
        }
        let getUrl = (pathname) => pathname + search
        this.promptPendding = true;
        const to = getRoute(pathname);
        const from = window[curHistory] ? window[curHistory].route : null;
        const next = (params) => {
            this.promptPendding = false
            if (to.redirect) {
                window[curHistory].push(getUrl(to.redirect));
                return
            }
            if (params && params.path) {
                let r = getRoute(params.path)
                if (r.redirect) {
                    window[curHistory].push(getUrl(r.redirect));
                    return
                }
                window[curHistory].push(getUrl(params.path));
                return
            }
            if (action === 'POP') {
                //回退
                console.log("Backing up...")
                window[curHistory].goBack()
            } else {
                //跳转
                console.log(`window[curHistory].push(${pathname})`)
                window[curHistory].push(getUrl(pathname))
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