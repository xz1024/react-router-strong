# react-router-strong

## Install

```bash
npm install react-router-strong --save
# or
yarn add react-router-strong
```

---

```javascript
import React from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import RouterStrong from 'react-router-strong'

import Home from './views/Home'

const App = () => (
  <RouterStrong>
    <Router>
      <Switch>
        <Route exact path="/home" component={Home} />
        <Route render={() => <div>404 Not Found</div>} />
      </Switch>
    </Router>
  </RouterStrong>
)

export default App
```
