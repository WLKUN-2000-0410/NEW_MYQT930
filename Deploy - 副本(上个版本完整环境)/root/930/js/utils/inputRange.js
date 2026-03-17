inputRange = new class{

    //添加旧值
    addOldValue(domArr){
        domArr.forEach(dom=>{
            let old = dom.val()
            dom.attr('oldData',old)
        })
    }

    /**
     * @function 判断是否超出范围
     * @param dom 元素操作树
     * @param func 范围判断方法
     * @param flag 是否有其他单位最大最小值
     *
     */
    isOutRange(dom,func,flag){
        let old = dom.attr("oldData")
        let cur = parseFloat(dom.val())
        let min = parseFloat(dom.attr(flag?'minCM':'min'))
        let max = parseFloat(dom.attr(flag?'maxCM':'max'))
        if (func(dom, old, cur, min, max)) {
            dom.attr('oldData',cur)
            return cur
        }
    }

}()