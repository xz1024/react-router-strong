# react-router-strong

## Install

```bash
npm install react-router-strong --save
 
```

---

```javascript
import React from 'react'
import RouterStrong from 'react-router-strong'
import A from '../views/A'
import B from '../views/B'

const config = [
    {
        name: 'a',
        path: '/a',
        component: A
    },
    {
        name: 'b',
        path: '/b',
        component: B
    }
]
 
const App = () => (
    <RouterStrong
        mode='history'
        routes={config}
    />
)

export default App
```
