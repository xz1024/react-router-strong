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
        const { beforeEach, afterEach, isPrompt, setPromptPendding } = this.props;
        if (!isPrompt) {//首次加载不走prompt
            //首次加载的时候在mouted里做异步
            if (beforeEach) {
                __beforeEach.call(this, {
                    state: 'mount',
                    afterEach,// 首次加载的afterEach
                })
            } else {
                afterEach && afterEach()
            }
        } else {//切换的时候在prompt组件中做异步
            if (beforeEach) {
                //切换完毕后
                //重置 prompt 的 pedding状态
                setPromptPendding(true)
            }
            if (afterEach) {
                afterEach()
            }
        }
    }
    render() {
        const { wp, beforeEach, isPrompt } = this.props;
        if (isPrompt) {
            //切换的时候在prompt里做异步，此组件变为同步组件
            return wp
        };
        return (!beforeEach || this.state.finished) ? wp : null
    }
}
export default AsyncRoute