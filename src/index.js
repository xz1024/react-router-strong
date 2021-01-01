import React from 'react'
import PropTypes from 'prop-types'
import { Prompt } from 'react-router'
import { wrapParent, getRoute, locationEqual } from './utils'
import { preHistory, curHistory, __win_AllRoutes } from './key'
import { BrowserRouter, HashRouter, Route, Switch, Redirect } from 'react-router-dom';
export { rsUtils } from './utils';
let __init__ = false

class AsyncRoute extends React.Component {
    constructor(props) {
        super();
        this.state = {
            finished: false
        }
    }
    static propsTypes = {
        beforeEach: PropTypes.func,
    }
    componentDidMount () {
        const { beforeEach } = this.props;
        let to = window[curHistory].route;
        if (to.redirect) {
            window[curHistory].push(to.redirect);
            return
        }
        beforeEach && beforeEach(
            to,
            window[preHistory].route,
            (params) => {
                if (params && params.path) {
                    let r = getRoute(params.path)
                    if (r.redirect) {
                        window[curHistory].push(r.redirect);
                        return
                    }
                    window[curHistory].push(params.path);
                    return
                }
                __init__ = true;
                this.setState({
                    finished: true
                })
            }
        );
    }
    render () {
        const { wp } = this.props
        return this.state.finished ? wp : null
    }
}
/**
 * 1 重复路由跳转问题；包括重定向前后一样的路由
 * 2 所有：路由参数 的考虑(无需考虑锚点)
 * 3 跳转不存在路由去跳转404 ；包括find方法中容错处理
 */

/**
 * promp(ifEqual) --> beforeEach --> next() --> push( to/redirect )
 *         |               |  
 *       return            |  -->  next({path}) --> push( path/redirect )
 *                     
 * */
class RouterStrong extends React.Component {
    constructor(props) {
        super();
        this.pendding = true
        this.state = {
            init: !props.beforeEach
        }
    }
    static propsTypes = {
        routes: PropTypes.array.isRequired,
        mode: PropTypes.string,
        beforeEach: PropTypes.func,
        isSwitch: PropTypes.bool,
    }
    __beforeEach (location, action) {
        console.log('window[curHistory]', window[curHistory])

        const { pathname, search } = location
        const { beforeEach } = this.props

        let getUrl = (pathname) => pathname + search
        this.pendding = true;
        const to = getRoute(pathname);
        const from = window[curHistory].route;
        const next = (params) => {
            this.pendding = false
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
    __Prompt () {
        return (
            <Prompt
                message={(location, action) => {
                    console.log('Prompt-----')
                    console.log("location:", location, "\n", "action:", action)

                    // if (action === 'POP') {
                    //     return true
                    // }
                    if (!this.pendding) {
                        return true
                    }
                    let islocationEqual = locationEqual(window[curHistory].location, location)
                    console.log('locationEqual', islocationEqual)
                    if (islocationEqual) {
                        return false
                    }
                    return this.__beforeEach(location, action);
                }}
            />
        )
    }

    render () {
        const {
            routes = [],
            mode,
            isSwitch = true,
            indexPath = '/',
            noFoundPath = '/404',
            beforeEach
        } = this.props;
        if (!beforeEach) {
            __init__ = true
        }
        const Router = mode === 'history' ? BrowserRouter : HashRouter;

        let AllRoutes = routes.map((r) => {
            const route = (r) => {
                const routeParams = (r) => ({
                    key: r.path,
                    exact: true,
                    path: r.path,
                    __r: r,
                    __parent: r.__parent,
                    render: (props) => {
                        props.history = { ...props.history, route: r };
                        window[preHistory] = window[curHistory] || {};
                        window[curHistory] = props.history;
                        console.log('render-props', props);
                        this.pendding = !!beforeEach

                        const merge = {
                            ...props,
                            route: r
                        };
                        if (r.redirect) {
                            return <Redirect {...merge} to={r.redirect} />
                        }
                        let wp = wrapParent(r, null, merge)
                        return __init__ ? wp : <AsyncRoute wp={wp} beforeEach={beforeEach} />
                    }
                });

                return <Route {...routeParams(r)} />
            };
            let res = [];
            function inorder (r) {
                if (r.path && (r.component || r.redirect)) {
                    res.push(route(r))
                }
                if (Array.isArray(r.children) && r.children.length) {
                    for (let x of r.children) {
                        x['__parent'] = r;
                        inorder(x)
                    }
                }
                if (Array.isArray(r.aliasPath) && r.aliasPath.length) {
                    r.aliasPath.forEach((path) => {
                        if (!/^\//.test(path)) { path = '/' + path }
                        res.push(route(Object.assign({}, r, { path, aliasPath: null })))
                    })
                }
                return res
            }
            return inorder(r)
        }).flat().filter(Boolean);
        AllRoutes = AllRoutes.concat([
            <Route key={indexPath} exact path="/" render={() => <Redirect to={indexPath} />} />,
            <Route key={noFoundPath} render={() => <Redirect to={noFoundPath} />} />
        ]);
        window[__win_AllRoutes] = AllRoutes;
        console.log(`window['${__win_AllRoutes}']:`, window[__win_AllRoutes])

        return (
            <Router>
                {this.props.children}
                {this.__Prompt()}
                {
                    isSwitch ? <Switch>  {AllRoutes}  </Switch> : AllRoutes
                }
            </Router>
        )
    }
}

export default RouterStrong
