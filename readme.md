# react-router-strong

## Install

```bash
npm install react-router-strong --save
 
```

[codesandbox在线demo](https://codesandbox.io/s/zen-feynman-6q6ef)
---

```javascript
import React from 'react'
import RouterStrong from 'react-router-strong'
import Home from '../views/Home'
import Layout from './views/Layout'
import Car from './views/Car'
import BWM from './views/BWM'
 

const config = [
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

const sleep = (time) => new Promise((resolve) => {
    setTimeout(() => {
        resolve()
    }, time)
})

export default () => (
    <div className="app">
        <RouterStrong
            indexPath='/app/home'
            noFoundPath='/404'
            mode={'history'}
            isSwitch={true}
            config={config}
             beforeEach={async (to, from, next) => {
                await sleep(2000)
                next()
            }}
            afterEach={() => {
                console.log('--------------afterEach-----------------------')
            }}
        >
        </RouterStrong>
    </div>
);

```
