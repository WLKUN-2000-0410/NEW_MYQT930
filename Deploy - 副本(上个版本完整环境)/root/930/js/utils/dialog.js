dialog = new class{

    //测试方案弹窗
    showTestBox(t,idx){
        let url = t?"html/scan/steadyTestPlan.html":"html/scan/wavelengthTestPlan.html"
        $.get(url+'?'+new Date().getTime(), function (str) {
            jeBox.open({
                title: [$.i18n.prop('popup-testPlan-title1'), {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: true, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [520, 400],
                zIndex: 1,
                content: str,
                success: function () {
                    main.translate(undefined)
                    initTestBox(idx)
                }
            })
        })
    }

    //保存测试方案弹窗
    saveTestBox(){
        let str = '<div id="addTestPlan" style="display:inline-flex;width: 100%;height: 100%;justify-content: space-evenly;align-items: center;">' +
            '<span data-locale="popup-testPlan-title2">方案名称</span>' +
            '<input type="text" style="width: 50%" id="testPlanName" >' +
            '<button type="button" class="btn btn-secondary btn-sm" data-locale="popup-confirm" onclick="main.saveTestPlan(this)">确定</button>' +
            '</div>'
        jeBox.open({
            title: [$.i18n.prop('popup-testPlan-title2'), {
                'text-align': 'center',
                'font-size': '1.5em'
            }],
            type: 'dialog',
            maskLock: true, //是否遮罩
            maskClose: false,
            isDrag: true,
            shadow: true,
            closeBtn: true,
            boxSize: [400,90],
            zIndex: 1,
            content: str,
            success:function () {
                main.translate(undefined)
            }
        })
    }
    //打开导出txt数据弹窗
    showExportTxtBox(code,data){
        $.get('html/file/exportTxtFile.html?'+new Date().getTime(), function (str) {
            jeBox.open({
                title: [$.i18n.prop('popup-file-title2'), {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: true, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [700, 200],
                zIndex: 1,
                content: str,
                success:()=>initExportBox(code,data)

            })
        })
    }

}()