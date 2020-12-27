import React from 'react'
import { BrowserRouter, HashRouter, Route, Switch, Redirect } from 'react-router-dom';
class RouterStrong extends React.Component {
    render () {
        const { routes = [], mode, isSwitch = true, indexPath = '/', noFoundPath = '/404' } = this.props
        const Router = mode === 'history' ? BrowserRouter : HashRouter;
        function wrapParent (r, comp = null, props) {
            let target = r.component ? <r.component  {...props}> {r.children ? comp : null}</r.component> : null;
            if (r.__parent && r.__parent.component) {
                return wrapParent(r.__parent, target, props)
            }
            return target
        }
        let AllRoutes = routes.map((r) => {
            const route = (r) => {
                const routeParams = (r) => ({
                    key: r.path,
                    exact: true,
                    path: r.path,
                    __parent: r.__parent,
                    __redirect: r.redirect,
                    render: (props) => {
                        const merge = {
                            ...props,
                        };
                        if (r.redirect) {
                            return <Redirect {...props} to={r.redirect} />
                        }
                        return wrapParent(r, null, props)
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
        //  console.log('AllRoutes', AllRoutes)
        return (
            <Router>
                {this.props.children}
                {
                    isSwitch ? <Switch>  {AllRoutes}  </Switch> : AllRoutes
                }
            </Router>
        )
    }
}

export default RouterStrong
