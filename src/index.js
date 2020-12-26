import React from 'react'
import { BrowserRouter, HashRouter, Route, Switch, Redirect } from 'react-router-dom';
class RouterStrong extends React.Component {
    render () {
        const { routes, mode, isSwitch = true, indexPath = '/', noFoundPath = '/404' } = this.props
        const Router = mode === 'history' ? BrowserRouter : HashRouter;
        return (
            <Router>
                {this.props.children}
                <Switch>
                    {routes.map((r) => {
                        const route = (r) => {
                            const Component = r.component
                            const routeParams = {
                                key: r.path,
                                exact: true,
                                path: r.path,
                                render: (props) => {
                                    const merge = {
                                        ...props,
                                    };
                                    return <Component {...merge} />;
                                },
                            };
                            return <Route {...routeParams} />
                        };
                        const addAliasPath = (r) => [
                            route(r),
                            Array.isArray(r.aliasPath) && r.aliasPath.length
                                ? r.aliasPath.map((path) => {
                                    return route(Object.assign({}, r, { path, aliasPath: null }));
                                })
                                : null,
                        ];

                        return r.component ? addAliasPath(r) : r.subs.map((r) => addAliasPath(r));
                    })
                    }
                    <Route exact path="/" render={() => <Redirect to={indexPath} push />} />
                    <Route render={() => <Redirect to={noFoundPath} />} />
                </Switch>
            </Router>
        )
    }
}
export default RouterStrong