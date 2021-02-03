import React from 'react'
import PropTypes from 'prop-types'
import { Prompt } from 'react-router'
import {
    wrapParent,
    inorderRoutes,
    completeAllRoutes,
    __beforeEach
} from './utils'
import AsyncRoute from './AsyncRoute'
import { preHistory, curHistory, __win_AllRoutes } from './key'
import { BrowserRouter, HashRouter, Route, Switch, Redirect } from 'react-router-dom';
export { rsUtils } from './utils';


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
        this.promptPendding = !!props.beforeEach;
        /**
         *  Promp (true) --> Route( render)
         */
    }
    static propsTypes = {
        routes: PropTypes.array.isRequired,
        mode: PropTypes.string,
        beforeEach: PropTypes.func,
        afterEach: PropTypes.func,
        isSwitch: PropTypes.bool,
    }

    message(location, action) {
        this.isPrompt = true;
        /**
         * 返回值为
         * true直接执行render
         * false阻断路由跳转
         */
        // if (action === 'POP') {
        //     return true
        // }
        console.log('this.promptPendding', this.promptPendding)

        if (!this.promptPendding) {
            //★★★重点★★★
            //跳转相同的pathname的时候不能在组件里重置promptPendding
            if (location.pathname === window[curHistory].location.pathname) {
                this.promptPendding = true
            }
            return true
        }
        //切换的时候，有beforeEach为false阻止跳转
        return __beforeEach.call(this, {
            state: 'prompt',
            location,
            action
        });
    }
    render() {
        const {
            config, mode, isSwitch = true,
            indexPath, noFoundPath, beforeEach, afterEach
        } = this.props;

        const Router = mode === 'history' ? BrowserRouter : HashRouter;

        let routesArr = config.map((r) => {
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
                        //console.log('render-props', props);
                        const merge = {
                            ...props,
                            route: r
                        };
                        if (r.redirect) {
                            return <Redirect {...merge} to={r.redirect} />
                        }
                        let wp = wrapParent(r, null, merge)
                        return (
                            <AsyncRoute
                                wp={wp}
                                setPromptPendding={(bool) => this.promptPendding = bool}
                                isPrompt={this.isPrompt}
                                beforeEach={beforeEach}
                                afterEach={afterEach}
                            />
                        )
                    }
                });

                return <Route {...routeParams(r)} />
            };
            return inorderRoutes(r, route, []);
        }).flat();
        let AllRoutes = completeAllRoutes(routesArr, indexPath, noFoundPath);
        return (
            <Router>
                <Prompt message={this.message.bind(this)} />
                {this.props.children}
                {
                    isSwitch ? <Switch>  {AllRoutes}  </Switch> : AllRoutes
                }
            </Router>
        )
    }
}

export default RouterStrong
