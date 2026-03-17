algorithm = new class{
    chart = ''
    name= ''
    newName = ''
    lines = main.chart.active_series()
    data = {}
    org = ''
    detectionTable = ''
    TableData = []
    baseY = []
    lineMap = new Map()
    initAlgorithm(c,index){
        this.chart = new chart_xy(c)
        this.lines.forEach(cur=>{
            this.org = cur
            this.name= cur.name()
            this.data = cur.get_data()
            this.lineMap.set(cur.name(),cur)
        })
        let line = this.chart.add_series(this.name,0)
        //this.chart.legend_box().set_visible(true)
        if(index!=undefined){
        	let dataX = [];
        	for (var i=0;i<this.data.y.length;i++) {
        		dataX.push(i);
        	}
        	line.add_array(dataX,this.data.y)
        }else{
        	line.add_array(this.data.x,this.data.y)
        }
        
    }
    #addLine(name,tag,data){
        this.newName = name + tag
        let line = this.chart.add_series(name+tag,0)
        let org= this.lineMap.get(name).get_data()
        this.chart.legend_box().set_visible(true)
        line.add_array(org.x,data)
    }
    //拟合
    fit(y2,dom){
        let name = $("#fitLines").val()
        let y1 = this.lineMap.get(name).get_data().y;
        if (y2.length === 0)return jeBox.msg($.i18n.prop('tips-algorithm-base'),{icon:1})
        let y = []
        for (let i = 0; i < y1.length; i++) {
           y.push(y1[i]-y2[i])
        }
        this.#addLine(name,'_fit',y)
        this.perform(dom)
    }
    //平滑
    smooth(){
        let funNum = $("#smoothMode").get(0).selectedIndex
        let name = $("#smoothLines").val()
        let data = this.lineMap.get(name).get_data()
        let value  = Number($("#smoothValue").val())
        websocket.send(funcCode.SmoothParams,{funNum:funNum,value:value,size:data.x.length,arr:data.y})
        main.setCallbacks(funcCode.SmoothParams,rev =>{
            let y = rev.getPdList()
            this.#addLine(name,'_smooth',y)
        })
    }
    //归一化
    normalize(dom){
        let name = $("#norLines").val()
        let norTp = $("#norMode").get(0).selectedIndex
        let data = this.lineMap.get(name).get_data()
        let code = norTp ===0?funcCode.NormalizationParams:funcCode.NormalizationMinParams
        let tag  = norTp ===0?'_Normalization':'_NormalizationMin'
        websocket.send(code,{size:data.x.length,arr:data.y})
        main.setCallbacks(code,rev =>{
            let y = rev.getPdList()
            this.#addLine(name,tag,y)
            this.perform(dom)
        })
    }
    //寻峰
    findPeak(){
        let data ={}
        let name = $("#detectSec").val()
        let org = this.lineMap.get(name).get_data()
        this.chart.series(name). remove_all_marks();
        data.peakI = Number($("#peakI").val())
        data.peakW = Number($("#peakW").val())
        data.dB = Number($("#dB").val())
        data.pof = Number($("#pOF").val())
        data.smoothW = Number($("#smoothW").val())
        data.smoothT = Number($("#smoothT").val())
        data.xSize = org.x.length
        data.xArr = org.x
        data.YSize = org.y.length
        data.yArr = org.y
        this.TableData = [];
        websocket.send(funcCode.PeakDetectionParams,data)
        main.setCallbacks(funcCode.PeakDetectionParams,rev=>{
            let arr = rev.getPdList()
            this.chart.series(name).remove_all_marks()
            for (let i = 0; i < arr.length/7; i++) {
                this.chart.series(name).add_mark(arr[i*7+1],arr[i*7+2])
                this.TableData.push({
                    "num":arr[i*7],
                    "peakPos":arr[i*7+1].toFixed(3),
                    "peakH":arr[i*7+2].toFixed(3),
                    "halfHW":arr[i*7+3].toFixed(3),
                    "peakA":arr[i*7+4].toFixed(3),
                    "peakS":arr[i*7+5].toFixed(3),
                    "peakE":arr[i*7+6].toFixed(3)
                })
            }
            this.detectionTable.setData(this.TableData,false)
        })
    }
    //峰面积&半高宽
    peakAreaHWH(){
        let [start,end] = [Number($("#hWAPs").val()),Number($("#hWAPe").val())]

        let XData = [];
        for (let i = 0; i < this.data.x.length; i++) {
            XData.push(this.data.x[i]);
        }
        XData.push(start);
        XData.push(end);
        XData.sort(function(a,b){return a-b});
        let [s,e] = [XData.indexOf(start),XData.indexOf(end)]

        let x = this.data.x.slice(s,e-1);
        let y = this.data.y.slice(s,e-1);
        let newData = x.concat(y);
        console.log(newData);
        websocket.send(funcCode.FWHMParams,{size:x.length,data:newData});
        websocket.send(funcCode.AreaParams,{size:x.length,data:newData})
        main.setCallbacks(funcCode.FWHMParams,rev =>{
            let fwh = rev.getPdList()
            $("input#hafWidth").val(fwh[0].toFixed(2));
        })
        main.setCallbacks(funcCode.AreaParams,rev =>{
            let pa = rev.getPdList()
            $("input#area").val(pa[0].toFixed(2));
        })
    }
    //执行
    perform(dom){
        let length = this.chart.active_series().length
        if(length===1){return jeBox.msg($.i18n.prop('tips-algorithm-curve'),{icon:1})}
        $(dom).attr('disabled','disabled')
        $(dom).prevAll('input,select').attr('disabled','disabled')
        $(dom).next('button').removeAttr('disabled')
        jeBox.msg($.i18n.prop('tips-algorithm-perf'),{icon:2})
    }
    //恢复
    restore(dom,tag){
        $(dom).prevAll('input,select,button').removeAttr('disabled')
        $(dom).attr('disabled','disabled')
        this.chart.remove_line(this.newName)
        let name = this.newName.replace(tag,"");
        let data = this.lineMap.get(name).get_data()
        main.chart.series(name).add_y(data.y)
    }
    //擦除射线
    swipe(idx,y,name){
        websocket.send(funcCode.ErasingRay,{index:idx,ypd:y},false)
        main.setCallbacks(funcCode.ErasingRay,rev=>{
            let yArray = rev.getYpdList()
            if(name.indexOf('_Fix')!==-1){
                this.chart.series(name).add_y(yArray)
            }else {
                this.#addLine(name,'_Fix',yArray)
            }
        })

    }
    //数据截取
    Interception(dom){
        let name = $("#dataInterLines").val()
        let data = this.lineMap.get(name).get_data()
        let [data_x,dataIS,dataIE]= [data.x,$('#dataIS'),$('#dataIE')];
        let newData_x = [];
        let newData_y = [];
        for (let i = 0; i <  data_x.length; i++) {
            newData_x.push(data_x[i]);
            newData_y.push(data.y[i]);
        }

        newData_x.push(parseFloat(dataIS.val()));
        newData_x.push(parseFloat(dataIE.val()));
        newData_x.sort(function(a,b){return a-b;});
        let start = newData_x.indexOf(parseFloat(dataIS.val()));
        let end = newData_x.indexOf(parseFloat(dataIE.val()))-1;
        newData_x = newData_x.slice(start,end);
        newData_y=newData_y.slice(start,end);
        this.newName = name+"_interception"
        let line = this.chart.add_series(name+"_interception",0)
        this.chart.legend_box().set_visible(true)
        line.add_array(newData_x,newData_y)
        this.perform(dom)
    }
	//nm转化cm参数
	nmToCmParams()
	{
		
	}
	//cm转化nm参数
	cmToNmParams()
	{
		
	}
	//添加曲线处理结果到主界面
    addToMainLine(name,x,y,tag){
        let lineInfo = {}
        websocket.send(funcCode.getLineTitleByName, {lineName:name.replace(tag,"")},false)
        main.setCallbacks(funcCode.getLineTitleByName,rev=>{
            let result =  rev.getTiptitle();
            console.log(result)
            if(result!==''){
                lineInfo = JSON.parse(rev.getTiptitle())
                lineInfo.unit = $($("span.showUnit").get(0)).text();
            }
            let line = main.chart.add_series(name, 0);
            line.add_array(x, y);
            main.legend.addLegend(line)
            lineInfo.name = name
            lineProcess.AddLineDataParams(lineInfo,x,y,lineInfo.haveTitle,lineInfo.dataFrom);
        })
        //lineProcess.AddLineDataParams({},x,y,false,0);
    }

	//更新主界面曲线&&缓存
    updateMainLine(name,y){
        main.chart.series(name).add_y(y)
        lineProcess.updateYAxisParams(name,y)
    }
    //更新主界面的曲线
    /**
     *name  曲线名称
     *x     x轴数据
     *y     y轴数据
     *type  0:更新y轴数据,1:更新x,y轴数据
     *
     */
    updateLineByName(name,x,y,type){
        console.log(name);
        //let line = main.chart.add_series(name,0)
        let line = main.chart.series(name)
        line.add_array(x,y);
        //更新
        if (type==0) {
            //
            lineProcess.updateYAxisParams(name,y);
        } else{
            //
            lineProcess.updateXYAxisParams(name,x,y,$($("span.showUnit").get(0)).html());
        }
    }
}()

