import React from 'react'
import PropTypes from 'prop-types'
import { Prompt } from 'react-router'
import { wrapParent, getRoute } from './utils'
import { preHistory, curHistory, __win_AllRoutes } from './key'
import { BrowserRouter, HashRouter, Route, Switch, Redirect } from 'react-router-dom';
let __init__ = false

export { rsUtils } from './utils';

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
        beforeEach && beforeEach(
            window[curHistory].route,
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
        // console.log("location:", location, "\n", "action:", action)
        const { pathname } = location
        const { beforeEach } = this.props

        this.pendding = true;
        let to = getRoute(pathname);
        beforeEach && beforeEach(
            to,
            window[preHistory].route,
            (params) => {
                this.pendding = false
                if (to.redirect) {
                    window[curHistory].push(to.redirect);
                    return
                }
                if (params && params.path) {
                    let r = getRoute(params.path)
                    if (r.redirect) {
                        window[curHistory].push(r.redirect);
                        return
                    }
                    window[curHistory].push(params.path);
                    return
                }
                if (action === 'POP') {
                    //回退
                    console.log("Backing up...")
                    window[curHistory].goBack()
                } else {
                    //跳转
                    console.log(`window[curHistory].push(${pathname})`)
                    window[curHistory].push(pathname)
                }
            }
        );
        return !beforeEach
    }
    __Prompt () {
        return (
            <Prompt
                message={(location, action) => {
                    // if (action === 'POP') {
                    //     console.log("Backing up...")
                    // }
                    if (!this.pendding) {
                        return true
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
                        this.pendding = true
                        const merge = {
                            ...props,
                            route: r
                        };
                        if (r.redirect) {
                            return <Redirect {...merge} to={r.redirect} />
                        }
                        let wp = wrapParent(r, null, merge)
                        return __init__ ? wp : <AsyncRoute wp={wp} beforeEach={beforeEach} />
                    },
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
            <Route key={indexPath} exact path="/" render={() => <Redirect to={indexPath} push />} />,
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
