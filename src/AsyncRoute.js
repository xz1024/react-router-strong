import React from 'react'
import PropTypes from 'prop-types'
import { __beforeEach, log } from './utils'
import { __init } from './key'

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
        //log('AsyncRoute:componentDidMount')
        const { beforeEach, afterEach, isPrompt, setPromptPendding } = this.props;
        log('window[__init]', window[__init])
        if (!isPrompt || !window[__init]) {//首次加载不走prompt
            window[__init] = true;

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
        const { finished } = this.state;
        const { wp, beforeEach, isPrompt } = this.props;
        if (isPrompt && window[__init]) {//且首次加载的情况下
            //切换的时候在prompt里做异步，此组件（AsyncRoute）变为同步组件
            return wp
        };
        return (!beforeEach || finished) ? wp : null
    }
}
export default AsyncRoute