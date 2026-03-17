autoFocus = new class{
    orgName = ''
    orgX = []
    initAutoFocus(){
        $("#peakMin").val(fConfig.autoFocus.peakMin)
        $("#peakMax").val(fConfig.autoFocus.peakMax)
        $("#sensitivity").val(fConfig.autoFocus.sensitivity)
        $("#tangoMin").val(fConfig.autoFocus.tangoMin)
        $("#tangoMax").val(fConfig.autoFocus.tangoMax)
        $("#stepSize").val(fConfig.autoFocus.stepSize)
    }
    startAutoFocus(){
        let expTime = fConfig.expTime
        let tango_max  = Number($("#tangoMax").val())
        let tango_min  = Number($("#tangoMin").val())
        let step  = Number($("#stepSize").val())
        let start = Number($("#peakMin").val())
        let end  = Number($("#peakMax").val())
        let accNum  = fConfig.totalnum
        let peak  = Number($("#sensitivity").val())
        let lines = main.chart.active_series()
        let xAxis = [];
        xAxis.push(start);
        xAxis.push(end);
        for (let i = 0; i < lines[lines.length-1].get_data().x.length; i++) {
            xAxis.push(lines[lines.length-1].get_data().x[i]);
            this.orgName = lines[lines.length-1].name()+"_autoFocus"
            this.orgX[i] = lines[lines.length-1].get_data().x[i]
        }
        xAxis.sort(function(a,b){return a-b;});
        start = xAxis.indexOf(start);
        end   = xAxis.indexOf(end);
        let data = {expTime: expTime,tango_max:tango_max,tango_min:tango_min,step:step,start:start,end:end,accNum: accNum,peak:peak}
        websocket.send(funcCode.commandRunAutoFocus,data)
        let arr = [1,2,3]
        arr.forEach(cur=>{
            main.setCallbacks(funcCode.commandRunAutoFocusTitle+'_'+cur,rev=>{main.log(funcCode.commandRunAutoFocusTitle+"-"+rev.getTiptitle(),'')})
        })
    }
    stopAutoFocus() {
        websocket.send(funcCode.commandStopAutoFocus,{})
    }
    //更新自动对焦数据
    updateAutoFocus(rev){
        let line = main.chart.add_series(this.orgName, 0);
        line.add_array(this.orgX,rev.getPdList())
        main.legend.addLegend(line)
    }
}()