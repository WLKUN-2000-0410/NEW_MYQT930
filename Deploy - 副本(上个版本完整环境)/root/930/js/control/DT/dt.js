dt = new class{
    //读取位移台位置
    readDtPos(pos){
        websocket.send(funcCode.MCEGetPosition,{"isAxis":pos},false)
        main.setCallbacks(funcCode.MCEGetPosition+pos,rev=>{
            let [idx,pos,arr]= [rev.getIaxis(),rev.getPdvalue(),["X","Y","Z"]]
            if(pos<0) pos = 0
            $("#dt"+arr[idx]+"CurPos").val(pos.toFixed(1))
        })
    }
    //位移台归零
    dtZero(pos){
    	let arr = ["X","Y","Z"]
    	var newCurPos = 0;
    	$("#dt"+arr[pos]+"CurPos").val(newCurPos.toFixed(1))
        websocket.send(funcCode.MCEMotorBackZero,{"isAxis":pos})
    }
    //位移台相对位移
    setDtMove(pos,flag,sign){
        let value = parseFloat($("#dt"+flag+"Move").val())
        if(isNaN(value)) return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        let arr = ["X","Y","Z"]
        var newCurPos = parseFloat($("#dt"+arr[pos]+"CurPos").val())+(sign*value);
        if (newCurPos<0) newCurPos =0
        $("#dt"+arr[pos]+"CurPos").val(newCurPos.toFixed(1))
        websocket.send(funcCode.MCEMotorMove,{"isAxis":pos,"dValue":sign*value},false)
        main.setCallbacks(funcCode.MCEMotorMove,rev=>{})
    }
    //位移台相对移动
   	moveMotor(iAxis,nPos){
   		websocket.send(funcCode.MCEMotorMove,{"isAxis":iAxis,"dValue":nPos},false)
        main.setCallbacks(funcCode.MCEMotorMove,rev=>{})
   	}
    
    //位移台绝对位移
    setDtMoveTo(pos,flag){
        let value = parseFloat($("#dt"+flag+"MoveTo").val())
        if(isNaN(value)) return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        let arr = ["X","Y","Z"]
        $("#dt"+arr[pos]+"CurPos").val(value.toFixed(1))
        websocket.send(funcCode.MCEMotorMoveTo,{"isAxis":pos,"dValue":value})
    }
    //位移台设置速度
    setDtVelocity(dTemp){
        websocket.send(funcCode.MCESetVelocity,{"dTemp":dTemp})
        device.dT.fval = dTemp
    }
    //位移台移动加速度
    setDtAccVelocity(dTemp){
        websocket.send(funcCode.MCESetAccVelocity,{"dTemp":dTemp})
        device.dT.fAccval = dTemp
    }
    //位移台停止
    MCEMotorStop(){
        websocket.send(funcCode.MCEMotorStop,{})
    }
    //位移台设置虚拟控制杆使用
    MCESetJoyStick(use){
        websocket.send(funcCode.MCESetJoyStick,{"enAble":use})
    }
}()