# react-router-strong

## Install

```bash
npm install react-router-strong --save
 
```

---

```javascript
import React from 'react'
import RouterStrong from 'react-router-strong'
import Home from '../views/Home'
import Layout from './views/Layout'
import Car from './views/Car'
import BWM from './views/BWM'
 

const routes = [
    {
        path: "/app",
        component: Layout,
        redirect: '/app/home',
        children: [
            {
                path: '/app/home', aliasPath: ['/home'], component: Home
            },
            {
                path: '/app/car',
                component: Car,
                children: [
                    {
                        path: '/app/car/bwm', component: BWM
                    }
                ]
            },
        ]
    },
]
export default () => (
    <div className="app">
        <RouterStrong
            indexPath='/app/home'
            noFoundPath='/404'
            mode={'history'}
            isSwitch={true}
            routes={routes}
        >
        </RouterStrong>
    </div>
);

```
