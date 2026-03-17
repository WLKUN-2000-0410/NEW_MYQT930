class legend {
    chart = '';
    #count = 0;
    names = new Map();
    #tag = ''
    marks = new Map()

    initLegend(legendId, par, c) {
        let str = '<div class="legendBtn">\n' +
            '                        <button type="button" class="btn btn-secondary btn-sm" btntype="0" ><span data-locale="legend-btn-selectAll">全选</span></button>\n' +
            '                        <button type="button" class="btn btn-secondary btn-sm" btntype="1" ><span data-locale="legend-btn-unselectAll">全不选</span></button>\n' +
            '                        <button type="button" class="btn btn-secondary btn-sm" btntype="2" ><span data-locale="legend-btn-inverse">反选</span></button>\n' +
            '                    </div>\n' +
            '                    <div id="legendItem" class=' + legendId + '>\n' +
            '                    </div>'
        $(str).appendTo('#' + legendId)
        this.chart = c;
        this.#tag = legendId
        //保持滚动条在底部
        par.scrollTop('.' + legendId)
        $('.legendBtn button').click((e) => {
            let idx = Number($(e.currentTarget).attr('btnType'))
            switch (idx) {
                case 0: {
                    this.checkAllOrNot(true)
                }
                    break
                case 1: {
                    this.checkAllOrNot(false)
                }
                    break
                case 2: {
                    this.invertCheck()
                }
                    break
            }
        })
    }

    addLegend(line, x, y) {
        let [name, color] = [line.name(), line.get_color()]
        if (this.names.has(name)) return;
        if (this.marks.has(name)) return;
        let str = '<div class="legendItem1" linename=' + name + ' >' +
            '                       <div class="legendItemBtn" >\n' +
            '                            <input class="custom-checkbox" type="checkbox" checked="checked" lineName=' + name + ' ' + '/>\n' +
            '                            <div style=background-color:' + color + '></div>\n' +
            '                            <button class="btn btn-outline-secondary btn-sm" type="button" data-toggle="collapse" data-target=#leg' + this.#count + ' aria-expanded="false" aria-controls=leg' + this.#count + ' title=' + name + '>' + name + '</button>\n' +
            '                        </div>\n' +
            '                        <div class="collapse" id=leg' + this.#count + '>\n' +
            '                            <div class="card card-body">\n' +
            /*  '                                 <button type="button" index="0" class="btn btn-outline-secondary btn-sm"><img alt="" src="source/image/saveFile.png"></button>\n' +*/
            '                                 <button type="button" index="1" class="btn btn-outline-secondary btn-sm"><img alt="" src="source/image/delete.png"></button>\n' +
            '                                 <button type="button" index="2" class="btn btn-outline-secondary btn-sm"><img alt="" src="source/image/rename.png"></button>\n' +
            '                                 <button type="button" index="3" class="btn btn-outline-secondary btn-sm"><img alt="" src="source/image/updateColor.png"></button>\n' +
            '                             </div>\n' +
            '                         </div>' +
            '</div>'
        $(str).appendTo('.' + this.#tag)
        if (x !== undefined && y !== undefined) {
            this.marks.set(name, {x: x, y: y})
        }
        this.names.set(name, line)
        //监听复选框
        $('.legendItemBtn input[type=checkbox]').click((e) => {
            let ck = $(e.target).prop('checked')
            let name = $(e.target).attr('lineName')
            this.isShow(name, ck)
        })

        $('#leg' + this.#count + ' button').click((e) => {
            let index = Number($(e.currentTarget).attr('index'))
            let name = $(e.currentTarget).parents('.legendItem1').attr('lineName')
            let tag = $(e.currentTarget).parents('.legendItem1')
            switch (index) {
                case 0: {
                    this.saveFile(name, this)
                }
                    break;
                case 1: {
                    this.deleteCurrentLine(name)
                }
                    break;
                case 2: {
                    this.rename(tag, name, this)
                }
                    break;
                case 3: {
                    this.recolor(tag, name, this)
                }
                    break;

            }
        })
        this.#count++;
    }

    //显示&隐藏曲线
    isShow(name, Ck) {
        let line = this.names.get(name)
        if (line === undefined) return
        line.set_visible(Ck)
        if (typeof mapping !== 'undefined') {
            let pos = this.marks.get(name)
            if (pos !== undefined) {
                mapping.heatmap.isVisible_mark(pos.x, pos.y, Ck)
            }
        }
    }

    //删除当前曲线
    deleteCurrentLine(name) {
        this.chart.remove_line(name)
        this.names.delete(name)
        $('.legendItemBtn button').each(function () {
            let t = $(this).text()
            if (t === name) {
                $(this).parents('.legendItem1').remove()
            }
        })
        lineProcess.DeleteLineDataParams([name]);
        if (typeof mapping !== 'undefined') {
            let pos = this.marks.get(name)
            if (pos !== undefined) {
                mapping.heatmap.remove_mark(pos.x, pos.y)
                this.marks.delete(name)
            }
        }
        //$(".legendItem1[lineName="+name+"]").remove()
    }

    //重命名
    rename(tag, name, par) {
        $.get('html/algorithm/rename.html?' + new Date().getTime(), function (str) {
            jeBox.open({
                cell: 'rename',
                title: [$.i18n.prop('popup-algorithm-rename'), {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: true, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [300, 200],
                zIndex: 1,
                content: str,
                success: function (id, index) {
                    initRename(name)
                    $('#saveName').click(function () {
                        let newName = $('#new_name').val()
                        if (newName === '') return jeBox.msg($.i18n.prop('tips-legend-newName'), {icon: 1})
                        tag.attr('lineName', newName)
                        tag.children('.legendItemBtn').find('button').text(newName)
                        tag.children('.legendItemBtn').find('button').attr('title', newName)
                        tag.children('.legendItemBtn').find('input[type=checkbox]').attr('lineName', newName)
                        let line = par.chart.series(name)
                        line.rename(newName)
                        par.names.delete(name)
                        par.names.set(newName, line)
                        lineProcess.UpdateLineNameParams(name, newName);
                        console.log(typeof mapping)
                        if (typeof mapping !== 'undefined') {
                            let temp = mapping.mLegend.marks.get(name)
                            if (temp !== undefined) {
                                mapping.mLegend.marks.delete(name)
                                mapping.mLegend.marks.set(newName, temp)
                            }
                        }
                        jeBox.close(index)
                    })
                }
            })
        })
    }

    //修改颜色
    recolor(tag, name, par) {
        $.get('html/algorithm/recolor.html?' + new Date().getTime(), function (str) {
            jeBox.open({
                cell: 'recolor',
                title: [$.i18n.prop('popup-algorithm-recolor'), {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: true, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [300, 150],
                zIndex: 1,
                content: str,
                success: function (id, index) {
                    initRecolor(name)
                    $('#upColor').click(function (e) {
                        let color = $('#custom').val()
                        let line = par.chart.all_series().get(name)
                        tag.children('.legendItemBtn').find('div').css('background', color)
                        line.set_color(color)
                        jeBox.close(index)
                    })
                }
            })
        })
    }

    //保存文件 &单条
    saveFile(name, par) {
        let suc = function () {
            main.getSavefilePathPram()
            $('div.fileType select').val('.txt');
            $('div .fileType select option[value=\'.hdr\']').hide()
            $('div .fileType select option[value=\'.png\']').hide()
            $('div .fileType select option[value=\'.jpg\']').hide()
            $('div .fileType select option[value=\'.csv\']').hide()
            $('div.saveFilePathAndName button.chooseFilePaths').click(function (event) {
                event.stopPropagation();
            });
            $('div.saveFilePathAndName button').click(function (event) {
                let index = $(this).index('div.saveFilePathAndName button');
                switch (index) {
                    case 0:
                        //选取文件夹
                        break;
                    case 1:
                        //保存数据
                        let fileName = $('div.saveFilePathAndName input').get(0).value;
                        let filePath = $('div.saveFilePath')
                        break;
                }
                event.stopPropagation();
            });
        }
        let end = function () {
            if (main.isOpenChecked) {
                main.isOpenChecked = false;
                console.log(main.saveFilePath);

                let [saveData, MaxLen] = ['', 0];
                let lines = par.chart.active_series();
                if (lines.length === 0) return;
                var lineNames = new Array();
                lineNames.push(name);
                MaxLen = Math.max(MaxLen, par.chart.series(name).get_length())

                for (var i = 0; i < MaxLen; i++) {
                    let strLine = ''

                    let lineData = [par.chart.series(name)]
                    strLine += '\t'
                    strLine += lineData[0].get_data().x[i] == undefined ? '' : lineData[0].get_data().x[i]
                    strLine += '\t'
                    strLine += lineData[0].get_data().y[i] == undefined ? '' : lineData[0].get_data().y[i]

                    strLine = strLine.substr(1)
                    strLine += '\n'
                    saveData += strLine;
                }
                websocket.send(funcCode.getLineTitleByNames, {path: lineNames}, false)
                main.setCallbacks(funcCode.getLineTitleByNames, rev => {
                    let strInfos = rev.getTiptitle()
                    let infos = JSON.parse(strInfos);
                    for (var i = 0; i < infos.length; i++) {
                        infos[i].unit = $($('span.showUnit').get(0)).html();
                    }
                    strInfos = JSON.stringify(infos);
                    if (localStorage.getItem('lg') === 'zh') {
                        strInfos = getZHTitle(strInfos);
                    }
                    let filecd = '';
                    filecd += '[Info]\n'
                    filecd += strInfos
                    filecd += '\n'
                    filecd += '[Data]\n'
                    filecd += saveData
                    websocket.send(funcCode.SaveLineDataPram, {path: main.saveFilePath, content: filecd}, false)
                    main.setSaveFilePathPram(main.saveFilePath.substring(0, main.saveFilePath.lastIndexOf('\\') + 1));
                });
            }
        }
        main.setSaveFilePathPram(main.saveFilePath.substring(0, main.saveFilePath.lastIndexOf('\\') + 1));
        main.saveFileByPath(suc, end)
    };

    //全选 & 全不选
    checkAllOrNot(ct) {
        let lines = this.chart.all_series();
        for (let line of lines.values()) {
            line.set_visible(ct)
            $('.legendItemBtn input[type=checkbox]').prop('checked', ct)

            if (typeof mapping !== 'undefined') {
                let pos = this.marks.get(line.name())
                if (pos !== undefined) {
                    mapping.heatmap.isVisible_mark(pos.x, pos.y, ct)
                }
            }
        }

    }

    //反选
    invertCheck() {
        let lines = this.chart.all_series();
        for (let line of lines.values()) {
            let checked = !line.is_visible()
            let name = line.name()
            line.set_visible(checked)
            // $(".legendItemBtn button").each(function () {
            //     let t= $(this).text()
            //     if (t === name){
            //         console.log($(this).prev('.custom-checkbox'));
            //     }
            // })
            $('.legendItemBtn input[type=checkbox][lineName=' + name + ']').prop('checked', checked)
            if (typeof mapping !== 'undefined') {
                let pos = this.marks.get(name)
                if (pos !== undefined) {
                    mapping.heatmap.isVisible_mark(pos.x, pos.y, checked)
                }
            }
        }
    }
}

