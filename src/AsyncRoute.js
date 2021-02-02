import React from 'react'
import PropTypes from 'prop-types'
import { __beforeEach } from './utils'

class AsyncRoute extends React.Component {
    constructor(props) {
        super();
        this.state = {
            finished: false,
        }
    }
    static propsTypes = {
        beforeEach: PropTypes.func,
    }
    componentDidMount() {
        console.log('AsyncRoute:componentDidMount');
        const { beforeEach, afterEach, isPrompt, setPromptPendding } = this.props;
        if (beforeEach) {
            setPromptPendding(true)
            if (!isPrompt) {
                __beforeEach.call(this, 'mount')
            }
        }
        if (afterEach) {
            afterEach()
        }
    }
    render() {
        const { wp, beforeEach, isPrompt } = this.props;
        if (isPrompt) return wp;
        return (!beforeEach || this.state.finished) ? wp : null
    }
}
export default AsyncRoute