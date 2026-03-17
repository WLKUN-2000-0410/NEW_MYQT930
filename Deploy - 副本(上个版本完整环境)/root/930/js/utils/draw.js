draws = new class{
    boxW =1;boxH=1;boxL=1;boxT=1;drawType = true;scSize = 10;scTxt = "5μm"
    /**
     * 画线
     * @param{Object} par  画图区域 id
     * @param{Object} line 画图显示的线 id
     */
   drawsLine(par,line){
        let [startPos,startMove] = [2,false];
        par.mousedown(event=>{
            startMove = true
            line.css("left",event.offsetX+"px")
            line.css("top",event.offsetY+"px")
            startPos = event.offsetX
        })
        par.mousemove(event=>{
            if (!startMove)return
            let width;
            if (startPos>event.offsetX) {
                width = startPos-event.offsetX;
                line.css("left",event.offsetX+"px");
            }else{
                width = event.offsetX-startPos;
            }
            line.css("width",width+"px");
        })
        par.mouseup(event=>{
            let width;
            startMove = false
            if (startPos>event.offsetX) {
                width = startPos-event.offsetX;
                line.css("left",event.offsetX+"px");
            }else{
                width = event.offsetX-startPos;
            }
            line.css("width",width+"px");
        })
    }
   /**
    * 画框
    * @param{Object} par 画图区域 id
    *@param{Object} box 画图显示的框 id
    */
    drawsBox(par,box){
        let [arr,startMove] = [[],false];
        par.mousedown(event=>{
            startMove = true;
            box.html("");
            arr = []
            box.css({"top":event.offsetY+"px","left":event.offsetX+"px","width":"0px","height":"0px"});
            arr.push(event.offsetX);
            arr.push(event.offsetY);
        })
       par.mousemove(event=> {
           if (!startMove)return
           [arr[2],arr[3]]=[event.offsetX,event.offsetY];
           let [width,height,left,top] = [Math.abs(arr[0]-arr[2]),Math.abs(arr[1]-arr[3]),arr[0]>arr[2]?arr[2]:arr[0],arr[3]>arr[1]?arr[1]:arr[3]];
           box.css({'width': width+'px',"height":height+"px","left":left+"px","top":top+"px"});
       })
       par.mouseup(event=>{
           startMove =false;
           [arr[2],arr[3]]=[event.offsetX,event.offsetY];
           let [width,height,left,top] = [Math.abs(arr[0]-arr[2]),Math.abs(arr[1]-arr[3]),arr[0]>arr[2]?arr[2]:arr[0],arr[3]>arr[1]?arr[1]:arr[3]];
           box.css({'width': width+'px',"height":height+"px","left":left+"px","top":top+"px"});
           [this.boxW,this.boxH,this.boxL,this.boxT] = [width,height,left,top]
       })
   }
    /**
     * @param {jQuery.dom} clickArea
     */
	moveCamera(clickArea){
		clickArea.mousedown(event=>{
			let [x,y,w,h] = [event.offsetX,event.offsetY,clickArea.width(),clickArea.height()];
			var xGap = (x-w/2)*(device.camera.mirrorPos)
			var yGap = h/2-y;
			fConfig.lensConf.forEach(cur => {
	            if (camera.lenName === cur.name) {
	            	dt.moveMotor(0,xGap/cur.scale);
	            	dt.moveMotor(1,yGap/cur.scale);
	            }
	        });
		});
	}


   /**
    * 画图 特别区分
    *   @param{Object} par 画图区域 id
    *   @param{Object} line 画图显示的线 id
    *   @param{Object} box 画图显示的框 id
    */
    drawsPic(par,line,box){
       let [startPos,arr,startMove] = [2,[],false];
       par.mousedown(function (event){
           startMove = true
           if(draws.drawType){
               line.css("left",event.offsetX+"px")
               line.css("top",event.offsetY+"px")
               startPos = event.offsetX
               console.log(startPos,event.offsetX)
           }else {
               box.html("");
               arr = []
               box.css({"top":event.offsetY+"px","left":event.offsetX+"px","width":"0px","height":"0px"});
               arr.push(event.offsetX);
               arr.push(event.offsetY);
           }
       })
       par.mousemove(function (event){
           if (!startMove)return
           if(draws.drawType){
               let width;
               console.log(startPos,event.offsetX)
               if (startPos>event.offsetX) {
                   width = startPos-event.offsetX;
                   line.css("left",event.offsetX+"px");
               }else{
                   width = event.offsetX-startPos;
               }
               line.css("width",width+"px");
           }else {
               [arr[2],arr[3]]=[event.offsetX,event.offsetY];
               let [width,height,left,top] = [Math.abs(arr[0]-arr[2]),Math.abs(arr[1]-arr[3]),arr[0]>arr[2]?arr[2]:arr[0],arr[3]>arr[1]?arr[1]:arr[3]];
               box.css({'width': width+'px',"height":height+"px","left":left+"px","top":top+"px"});
           }
       })
       par.mouseup(function (event){
           startMove = false
           if (draws.drawType) {
               let width;
               console.log(startPos,event.offsetX)
               if (startPos>event.offsetX) {
                   width = startPos-event.offsetX;
                   line.css("left",event.offsetX+"px");
               }else{
                   width = event.offsetX-startPos;
               }
               line.css("width",width+"px");
           }else {
               [arr[2],arr[3]]=[event.offsetX,event.offsetY];
               let [width,height,left,top] = [Math.abs(arr[0]-arr[2]),Math.abs(arr[1]-arr[3]),arr[0]>arr[2]?arr[2]:arr[0],arr[3]>arr[1]?arr[1]:arr[3]];
               box.css({'width': width+'px',"height":height+"px","left":left+"px","top":top+"px"});
               [draws.boxW,draws.boxH,draws.boxL,draws.boxT] = [width,height,left,top]
           }

       })
   }
}()