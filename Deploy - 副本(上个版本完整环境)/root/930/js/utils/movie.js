movie = new class{
    par = ''
    img = ""
    parent = ''
    scale = 1
    minScale = 1
    maxScale = 128
    isPointerdown = false // 按下标识
    divLeft = 0;
    divTop = 0;
    oldOffsetX = 0;
    oldOffsetY = 0;
    diff = {
        x: 0,
        y: 0
    } // 相对于上一次pointermove移动差值
    lastPointermove = {
        x: 0,
        y: 0
    } // 用于计算diff
    zoom = {
        show: {width:1,height:1}, //影像显示宽度
        real: {
            width: 1003,
            height: 267,
            bin_h: 1,
            bin_v: 1
        },
        offset_x: undefined,
        offset_y: undefined,
    }
    org = [];
    firstTime = true;
    //初始化影像
    initMovie(i,p){
        this.par = p
        this.img = $("#"+i)
        this.image = document.getElementById(i);
        this.parent = $("#"+p);
        this.image.addEventListener('pointerdown', function(e) {
            movie.isPointerdown = true;
            movie.image.setPointerCapture(e.pointerId);
            this.point = {
                x: e.clientX,
                y: e.clientY
            };
            movie.lastPointermove = {
                x: e.clientX,
                y: e.clientY
            };
        });
        // 绑定 pointermove
        this.image.addEventListener('pointermove', function(e) {
            if (movie.isPointerdown && movie.scale > 1) {
                const current1 = {
                    x: e.clientX,
                    y: e.clientY
                };
                movie.diff.x = current1.x - movie.lastPointermove.x;
                movie.diff.y = current1.y - movie.lastPointermove.y;
                movie.lastPointermove = {
                    x: current1.x,
                    y: current1.y
                };
                movie.zoom.offset_x += movie.diff.x;
                movie.zoom.offset_y += movie.diff.y;
                movie.image.style.transform = 'translate3d(' + movie.zoom.offset_x + 'px, ' + movie.zoom.offset_y + 'px, 0) scale(' + movie.scale + ')';
            }
            e.preventDefault();
        });
        // 绑定 pointerup
        this.image.addEventListener('pointerup', function(e) {
            if (movie.isPointerdown) {
                movie.isPointerdown = false;
            }
        });
        // 绑定 pointercancel
        this.image.addEventListener('pointercancel', function(e) {
            if (movie.isPointerdown) {
                movie.isPointerdown = false;
            }
        });
    }
    div_click(dom,event){
    	console.log(event.offsetX,event.offsetY)
    	$(dom).find("div.rowed").css("top" ,event.offsetY*100.0/$(dom).height()+"%")
    	$(dom).find("div.lined").css("left",event.offsetX*100.0/$(dom).width()+"%")
    }
    //ccd影像处理
    show (w,h,data) {
        if (data.length === 1) {
            this.org = data;
            return;
        }

        this.zoom.real = {
            width: w,
            height: h,
            bin_h: 1,
            bin_v: 1
        };
        this.zoom.show = this.getImgSize(this.zoom.real.width, this.zoom.real.height, this.parent.width(), this.parent.height());
        this.image.src = 'data:image/jpg;base64,' + data;
        this.image.style.width = this.zoom.show.width + 'px';
        this.image.style.height = this.zoom.show.height + 'px';
        console.log(movie.firstTime)
        if (movie.firstTime) {
            movie.firstTime = false;
            console.log(this.image.style.width,this.image.style.height)

            // this.image.style.transform = 'translate3d(' + 0 + 'px, ' + (this.parent.height() - this.zoom.show.height) * 0.5 + 'px, 0) scale(1)';
            //
            // this.zoom.offset_x = 0;
            // this.zoom.offset_y = (this.parent.height() - this.zoom.show.height) * 0.5;
        }
    };
    // 滚轮缩放
    m_mousewheel(e) {
		this.oldOffsetX = e.offsetX*1.0;
		this.oldOffsetY = e.offsetY*1.0;
		this.divLeft = e.offsetX*1.0 - this.img.parent().scrollLeft()*1.0;
		this.divTop = e.offsetY*1.0 - this.img.parent().scrollTop()*1.0;
        let ev = window.event || e;
        if (ev.deltaY > 0) {
            this.#narrowImg(0.1)
        }
        if (ev.deltaY < 0) {
            this.#enlargeImg(1)
        }
        //Chorme
        //let wheel = ev.originalEvent.wheel;
        //let detal = ev.originalEvent.detail;
        // if (ev.originalEvent.wheel) { //判断浏览器IE,谷歌滚轮事件
        //     if (wheel > 0) { //当滑轮向上滚动时
        //         this.#enlargeImg(1);
        //     }
        //     if (wheel < 0) { //当滑轮向下滚动时
        //         this.#narrowImg(0.1);
        //     }
        // } else if (ev.originalEvent.detail) {  //Firefox滚轮事件
        //     if (detal > 0) { //当滑轮向下滚动时
        //         this.#enlargeImg(2);
        //     }
        //     if (detal < 0) { //当滑轮向上滚动时
        //         this.#narrowImg(0.1);
        //     }
        // }
        //ev.stopPropagation();
        // let parent_pos = this.getElementPos(this.par);
        // let ratio = 1.1;
        // // 缩小
        // if (ev.deltaY > 0) {
        //     ratio = 1 / 1.1;
        // }
        // // 限制缩放倍数
        // const _scale = this.scale * ratio;
        // if (_scale > this.maxScale) {
        //     ratio = this.maxScale / this.scale;
        //     this.scale = this.maxScale;
        // } else if (_scale < this.minScale) {
        //     ratio = this.minScale / this.scale;
        //     this.scale = this.minScale;
        // } else {
        //     this.scale = _scale;
        // }
        // // 目标元素是img说明鼠标在img上，以鼠标位置为缩放中心，否则默认以图片中心点为缩放中心 CANVAS IMG
        // if (ev.target.tagName === 'IMG') {
        //     const origin = {
        //         x: (ratio - 1) * this.zoom.show.width * 0.5,
        //         y: (ratio - 1) * this.zoom.show.height * 0.5,
        //     };
        //     // 计算偏移量
        //     this.zoom.offset_x -= (ratio - 1) * (ev.clientX - this.zoom.offset_x - parent_pos.x) - origin.x;
        //     this.zoom.offset_y -= (ratio - 1) * (ev.clientY - this.zoom.offset_y - parent_pos.y) - origin.y;
        //     if (this.scale <= 1) {
        //         this.zoom.offset_x = 0;
        //         this.zoom.offset_y = (this.parent.height() - this.zoom.show.height) * 0.5;
        //         this.scale = 1;
        //     }
        // }
        // this.image.style.transform = 'translate3d(' + this.zoom.offset_x + 'px, ' + this.zoom.offset_y + 'px, 0) scale(' + this.scale + ')';
        // ev.preventDefault();
    };
    //单机显示坐标
    m_click(e){
        let x = e.offsetX *this.zoom.real.width/this.image.width;
        let y = e.offsetY *this.zoom.real.height/this.image.height;

        $('#coords').html('X:' + parseInt(x) + 'px' + ' - ' + 'Y:' +parseInt(y)+'px' );
    }
    img_click(e){
    	console.log(e);
    }
    //双击还原
    m_dbclick(e) {
        // this.zoom.offset_x = 0;
        // this.zoom.offset_y = (this.parent.height() - this.zoom.show.height) * 0.5;
        // this.image.style.transform = 'translate3d(' + 0 + 'px, ' + this.zoom.offset_y + 'px, 0) scale(' + 1 + ')';
        // this.scale = 1;
        this.img.animate({width:this.zoom.show.width+"px",height:this.zoom.show.height+"px"},0.1);
    };
    //获取当前坐标
    m_mousemove(e) {
        // let x = e.offsetX * (this.zoom.real.width / this.zoom.real.bin_h / this.image.width);
        // let y = e.offsetY * (this.zoom.real.height / this.zoom.real.bin_v / this.image.height);
        let x = e.offsetX *this.zoom.real.width/this.image.width;
        let y = e.offsetY *this.zoom.real.height/this.image.height;

        $('#coords').html('X:' + parseInt(x) + 'px' + ' - ' + 'Y:' +parseInt(y)+'px' );
    };
	
	
    #enlargeImg(wheel){
        let wdd = this.img.width()*5.0/4;
        let hdd = this.img.height()*5.0/4;
        this.img.css({width:wdd+"px",height:hdd+"px"});
        this.img.parent().css({width:"auto",height:"auto"});
        this.img.parent().css({width:"auto",height:"auto"});
        this.parent.scrollLeft(this.oldOffsetX*5/4-this.divLeft);
        this.parent.scrollTop(this.oldOffsetY*5/4-this.divTop);
    }
    #narrowImg(detal){
        let wdd = this.img.width()*4.0/5;
        let hdd = this.img.height()*4.0/5;
        this.img.css({width:wdd+"px",height:hdd+"px"});
        this.img.parent().css({width:"auto",height:"auto"});
        this.img.parent().css({width:"auto",height:"auto"});
        this.parent.scrollLeft(this.oldOffsetX*5/4-this.divLeft);
        this.parent.scrollTop(this.oldOffsetY*5/4-this.divTop);
    }
    //获取图片大小
    getImgSize(naturalWidth, naturalHeight, maxWidth, maxHeight) {
        let width = maxWidth;
        let height = (maxWidth / naturalWidth) * naturalHeight;

        return {
            width: width,
            height: height
        };
    }
    //获取容器偏移量
    getElementPos(elementId) {
        let ua = navigator.userAgent.toLowerCase();
        let isOpera = ua.indexOf('opera') !== -1;
        let isIE = ua.indexOf('msie') !== -1 && !isOpera; // not opera spoof
        let el = document.getElementById(elementId);
        if (el.parentNode === null || el.style.display === 'none') {
            return false;
        }
        let parent = null;
        let pos = [];
        let box;
        if (el.getBoundingClientRect) {
            //IE
            box = el.getBoundingClientRect();
            let scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            let scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
            return {
                x: box.left + scrollLeft,
                y: box.top + scrollTop
            };
        } else if (document.getBoxObjectFor) {
            // gecko
            box = document.getBoxObjectFor(el);
            let borderLeft = el.style.borderLeftWidth ? parseInt(el.style.borderLeftWidth) : 0;
            let borderTop = el.style.borderTopWidth ? parseInt(el.style.borderTopWidth) : 0;
            pos = [box.x - borderLeft, box.y - borderTop];
        } // safari & opera
        else {
            pos = [el.offsetLeft, el.offsetTop];
            parent = el.offsetParent;
            if (parent !== el) {
                while (parent) {
                    pos[0] += parent.offsetLeft;
                    pos[1] += parent.offsetTop;
                    parent = parent.offsetParent;
                }
            }
            if (ua.indexOf('opera') !== -1 || (ua.indexOf('safari') !== -1 && el.style.position === 'absolute')) {
                pos[0] -= document.body.offsetLeft;
                pos[1] -= document.body.offsetTop;
            }
        }
        if (el.parentNode) {
            parent = el.parentNode;
        } else {
            parent = null;
        }
        while (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML') {
            // account for any scrolled ancestors
            pos[0] -= parent.scrollLeft;
            pos[1] -= parent.scrollTop;
            if (parent.parentNode) {
                parent = parent.parentNode;
            } else {
                parent = null;
            }
        }
        return {
            x: pos[0],
            y: pos[1]
        };
    }

}()
