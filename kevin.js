/**
 *  常用功能框架封装 by Kevin
 */

(function(w){
    var Kevin = function(){};

    Kevin.prototype = {
        elements : [],
        //拷贝对象,扩充功能
        extend : function(target,source){
            for(var i in source){
                target[i] = source[i];
            }
            return target;
        }
    };

    var $$ = new Kevin();
    //字符串相关操作
    $$.extend($$,{
        //去除左边空格
        ltrim : function(str){
            return str.replace(/(^\s*)/g,'');
        },
        //去除右边空格
        rtrim : function(str){
            return str.replace(/(\s*$)/g,'');
        },
        //去除两边空格
        trim : function(str){
            return str.replace(/(^\s*)|(\s*$)/g,'');
        },
        //数据绑定简易版
        formateString : function(str,data){
            return str.replace(/@\((\w+)\)/g,function(match,key){
                return typeof data[key] === 'undefined' ? '' : data[key];
            })
        },
        //查询字符串
        queryString : function(){
            var str = window.location.search.substring(1); //获取参数
            var arr = str.split('&'); //分割参数
            var json = {};
            for(var i = 0 ; i < arr.length ; i++){
                var c = arr[i].indexOf("="); //获取=的位置
                if(c == -1){
                    continue;
                }
                var d = arr[i].substring(0,c); //获取参数键
                var e = arr[i].substring(c+1); //获取参数值
                json[d] = e; //存储数据
            }
            return json;
        }
    });

    //数据类型判断
    $$.extend($$,{
        isNumber : function(val){
            return typeof val === 'number' && isFinite(val);
        },
        isBoolean : function(val){
            return typeof val === 'boolean';
        },
        isString : function(val){
            return typeof val === 'string';
        },
        isUndefined : function(val){
            return typeof val === 'undefined';
        },
        isObj : function(str){
            if(str === null || str === 'undefined'){
                return false;
            }
            return typeof str === 'object'
        },
        isNull : function(val){
            return val === null;
        },
        isArray : function(arr){
            if(arr === null || arr === 'undefined'){
                return false;
            }
            return arr.constructor === Array;
        }
    });

    //选择器相关操作
    $$.extend($$,{
        //根据ID获取DOM
        $id : function(id){
            this.elements.push(document.getElementById(id));
            return this;
        },
        //根据标签名获取DOM
        $tag : function(tag,id){
            var dom = $$.getDOM(id);
            if(dom){
                return dom.getElementsByTagName(tag);
            }else{
                return document.getElementsByTagName(tag);
            }
        },
        //根据class获取DOM
        $class : function(clsName,id){
            if(document.getElementsByClassName){
                return document.getElementsByClassName(clsName);
            }else{
                var elements = [];
                var doms;
                if(id){
                    //如果传入ID 缩小范围
                    var dom = $$.getDOM(id);
                    //获取容器所有元素
                    doms = dom.getElementsByTagName('*');
                }else{
                    //获取文档所有元素
                    doms = document.getElementsByTagName('*');
                }
                //遍历元素数组，定位到该class的DOM  保存起来返回
                for(var i = 0 ; i < doms.length ; i++){
                    if(doms[i].className == clsName){
                        elements.push(doms[i]);
                    }
                }
                return elements;
            }
        },
        $group : function(str){
            //把传入的在选择器分隔，逐个击破
            var arr = str.split(',');
            var result = [];
            for(var i = 0 ; i < arr.length ; i++){
                var item = arr[i];
                //获取选择器第一个字符
                var first = item.charAt(0);
                //获取字符的位置
                var index = item.indexOf(first);
                //截取第一个字符返回
                var name = item.slice(index+1);
                //判断第一个字符是什么
                if(first == '#'){
                    //ID选择器
                    result.push($$.$id(name));

                }else if(first == '.'){
                    //类选择器 有可能是一个数组
                    var list = $$.$class(name);
                    //利用apply向数组借用push方法 用数组push数组
                    Array.prototype.push.apply(result,list);
                }else{
                    //节点选择器
                    var list2 = $$.$tag(item);
                    Array.prototype.push.apply(result,list2);
                }
            }
            return result;
        },
        $layer : function (select){
            //个个击破法则 -- 寻找击破点
            var sel = $$.trim(select).split(' ');
            var result=[];
            var context=[];
            for(var i = 0, len = sel.length; i < len; i++){
                result=[];
                var item = $$.trim(sel[i]);
                var first = sel[i].charAt(0);
                var index = item.indexOf(first);
                var name = item.slice(index+1);
                if(first ==='#'){
                    //如果是#，找到该元素，
                    pushArray([$$.$id(name)]);
                    context = result;
                }else if(first ==='.'){
                    //如果是.
                    //找到context中所有的class为【s-1】的元素 --context是个集合
                    if(context.length){
                        for(var j = 0, contextLen = context.length; j < contextLen; j++){
                            pushArray($$.$class(name, context[j]));
                        }
                    }else{
                        pushArray($$.$class(name));
                    }
                    context = result;
                }else{
                    //如果是标签
                    //遍历父亲，找到父亲中的元素==父亲都存在context中
                    if(context.length){
                        for(var j = 0, contextLen = context.length; j < contextLen; j++){
                            pushArray($$.$tag(item, context[j]));
                        }
                    }else{
                        pushArray($$.$tag(item));
                    }
                    context = result;
                }
            }

            return context;

            //封装重复的代码
            function pushArray(doms){
                for(var j= 0, domlen = doms.length; j < domlen; j++){
                    result.push(doms[j])
                }
            }
        },
        $groupLayer : function(str){
            //分割选择器
            var arr = str.split(',');
            var result = [];
            //依次调用层次选择器
            for(var i = 0 ; i < arr.length ; i++){
                var doms = $$.$layer(arr[i]);
                Array.prototype.push.apply(result,doms);
            }
            return result;
        },
        //H5选择器，内置多组，分层
        $all : function(str,scope){
            var context = scope || document;
            this.elements = context.querySelectorAll(str);
            return this;
        },
        getDOM : function(id){
            var dom ;
            //如果传入的不是一个字符串
            if($$.isString(id)){
                dom = document.getElementById(id);
            }else{
                dom = id;
            }
            return dom;
        }
    });

    //事件处理
    $$.extend($$,{
        on : function(id,type,fn){
            var dom = $$.getDOM(id);
            if(dom.addEventListener){
                dom.addEventListener(type,fn,false);
            }else{
                //兼容低版本IE
                dom.attachEvent('on'+type,fn);
            }

        },
        //接触绑定事件
        un : function(id,type,fn){
            var dom = $$.getDOM(id);
            if(dom.removeEventListener){
                dom.removeEventListener(type,fn);
            }else if(dom.detachEvent){
                dom.detachEvent(type,fn);
            }
        },
        //点击事件
        click : function(id,fn){
            $$.on(id,'click',fn);
        },
        //鼠标移入
        mouseover : function(id,fn){
            $$.on(id,'mouseover',fn);
        },
        //鼠标移除
        mouseout : function(id,fn){
            $$.on(id,'mouseout',fn);
        },
        //jq hover事件
        hover : function(id,fn1,fn2){
            if(fn1){
                $$.on(id,'mouseover',fn1);
            }
            if(fn2){
                $$.on(id,'mouseout',fn2);
            }
        },
        //获取Event对象
        getEvent : function(evt){
            //兼容IE
            return evt?evt:window.event;
        },
        //获取事件目标
        getTarget : function(evt){
            var e = $$.getEvent(evt);
            return e.target || e.srcElement;
        },
        preventDefault : function(evt){
            var e = $$.getEvent(evt);
            if(e.preventDefault){
                e.preventDefault()
            }else if(e.returnValue){
                e.returnValue = false;
            }
        },
        //阻止冒泡行为
        stopPropagation : function(evt){
            var e = $$.getEvent(evt);
            if(e.stopPropagation){
                e.stopPropagation();
            }else{
                e.cancelBubble = true;
            }
        }
    });

    //css 内容 相关操作
    $$.extend($$,{
        //CSS操作
        css : function(key,value){
            var doms = this.elements;
            for(var i = 0 ; i < doms.length ; i++){
                setStyle(doms[i],key,value);
            }
            return this;
            function getStyle(dom){
                if(dom.currentStyle){
                    return dom.currentStyle[key];
                }else{
                    return getComputedStyle(dom,null)[key];
                }
            }
            function setStyle(dom,key,value){
                dom.style[key] = value;
            }
        },
        //属性操作
        attr : function(key,value){
            var doms = this.elements;
            //判断传入的参数，如果是两个就代表是获取属性
            for(var i = 0 ; i < doms.length ; i++){
                doms[i].setAttribute(key,value);
            }
            return this;
        },
        //去除属性
        removeAttr : function(){
            //将伪数组转换成真数组
            var list = Array.prototype.slice.call(arguments);
            //获取作用域
            var context = list[0];
            //获取节点
            var doms = $$.$all(context);
            var names = list[1].slice(1);
            for(var i = 0 ; i < doms.length ; i++){
                for(var j = 0 ; j<list.length ; j++){
                    doms[i].removeAttribute(list[j]);
                }
            }
        },
        //添加类名
        addClass : function(str){
            var doms = this.elements;
            for(var i = 0 ; i< doms.length ; i++){
                doms[i].className += ' ' + str;
            }
            return this;
        },
        //删除类名
        removeClass : function(str){
            var doms = this.elements;
            for(var i = 0 ; i< doms.length ; i++){
                doms[i].className = doms[i].className.replace(str,'');
            }
            return this;
        },
        html : function(str){
            var doms = this.elements;
            for(var i = 0 ; i < doms.length ; i++){
                doms[i].innerHTML = str;
            };
            return this;

        },
        //隐藏
        hide : function(){
            var doms = this.elements;
            for(var i = 0 ; i < doms.length ; i++){
                $$.css('display','none');
            }
            return this;
        },
        //显示
        show : function(){
            var doms = this.elements;
            for(var i = 0 ; i < doms.length ; i++){
                $$.css('display','block');
            }
            return this;
        }
    });

    //动画框架
    function Animate(){
        this.timer;
        this.queen = [];
    }
    Animate.prototype = {
        run : function(){
            var that = this;
            that.timer = setInterval(function(){that.move(that.loop())},16)
        },
        loop : function(){
            for(var i = 0 ; i< this.queen.length ; i++){
                var obj = this.queen[i];
                this.move(obj);
            }
        },
        move : function(obj){
            var pass = +new Date();
            var that = this;
            /*计算动画时间进程*/
            var tween = this.getTween(obj.now,pass,obj.duration,'easeOutBounce');
            //动画停止的条件
            if(tween>=1) {
                /*停止动画*/
                that.stop()
            }else {
                /*动起来*/
                that.setManyProperty(obj.id,obj.styles,tween)
            }
        },
        /*停止*/
        stop : function(){
            /*var tween = 1;*/
            var that = this;
            clearInterval(that.timer);
        },
        //设置一个样式
        /*未来一旦代码变化 只需要更改一个地方*/
        setOneProperty : function(id,name,start,juli,tween){
            /*透明度 不需要px
             但是width top height left right px*/
            if(name == 'opacity'){
                $$.css(id,name,start + juli*tween)
            }else{
                $$.css(id,name,(start + juli*tween)+'px')
            }
        },
        /*10--30%  - - 不 断变化 */
        setManyProperty : function(id,styles,tween){
            for(var i =0;i<styles.length;i++){
                var item = styles[i];
                this.setOneProperty(id,item.name,item.start,item.juli,tween)
            }
        },
        getTween : function(now,pass,all,ease){
            var eases = {
                //线性匀速
                linear:function (t, b, c, d){
                    return (c - b) * (t/ d);
                },
                //弹性运动
                easeOutBounce:function (t, b, c, d) {
                    if ((t/=d) < (1/2.75)) {
                        return c*(7.5625*t*t) + b;
                    } else if (t < (2/2.75)) {
                        return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
                    } else if (t < (2.5/2.75)) {
                        return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
                    } else {
                        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
                    }
                },
                //其他
                swing: function (t, b, c, d) {
                    return this.easeOutQuad(t, b, c, d);
                },
                easeInQuad: function (t, b, c, d) {
                    return c*(t/=d)*t + b;
                },
                easeOutQuad: function (t, b, c, d) {
                    return -c *(t/=d)*(t-2) + b;
                },
                easeInOutQuad: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t + b;
                    return -c/2 * ((--t)*(t-2) - 1) + b;
                },
                easeInCubic: function (t, b, c, d) {
                    return c*(t/=d)*t*t + b;
                },
                easeOutCubic: function (t, b, c, d) {
                    return c*((t=t/d-1)*t*t + 1) + b;
                },
                easeInOutCubic: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t*t + b;
                    return c/2*((t-=2)*t*t + 2) + b;
                },
                easeInQuart: function (t, b, c, d) {
                    return c*(t/=d)*t*t*t + b;
                },
                easeOutQuart: function (t, b, c, d) {
                    return -c * ((t=t/d-1)*t*t*t - 1) + b;
                },
                easeInOutQuart: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
                    return -c/2 * ((t-=2)*t*t*t - 2) + b;
                },
                easeInQuint: function (t, b, c, d) {
                    return c*(t/=d)*t*t*t*t + b;
                },
                easeOutQuint: function (t, b, c, d) {
                    return c*((t=t/d-1)*t*t*t*t + 1) + b;
                },
                easeInOutQuint: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
                    return c/2*((t-=2)*t*t*t*t + 2) + b;
                },
                easeInSine: function (t, b, c, d) {
                    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
                },
                easeOutSine: function (t, b, c, d) {
                    return c * Math.sin(t/d * (Math.PI/2)) + b;
                },
                easeInOutSine: function (t, b, c, d) {
                    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
                },
                easeInExpo: function (t, b, c, d) {
                    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
                },
                easeOutExpo: function (t, b, c, d) {
                    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
                },
                easeInOutExpo: function (t, b, c, d) {
                    if (t==0) return b;
                    if (t==d) return b+c;
                    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
                    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
                },
                easeInCirc: function (t, b, c, d) {
                    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
                },
                easeOutCirc: function (t, b, c, d) {
                    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
                },
                easeInOutCirc: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
                    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
                },
                easeInElastic: function (t, b, c, d) {
                    var s=1.70158;var p=0;var a=c;
                    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                    if (a < Math.abs(c)) { a=c; var s=p/4; }
                    else var s = p/(2*Math.PI) * Math.asin (c/a);
                    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                },
                easeOutElastic: function (t, b, c, d) {
                    var s=1.70158;var p=0;var a=c;
                    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                    if (a < Math.abs(c)) { a=c; var s=p/4; }
                    else var s = p/(2*Math.PI) * Math.asin (c/a);
                    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
                },
                easeInOutElastic: function (t, b, c, d) {
                    var s=1.70158;var p=0;var a=c;
                    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
                    if (a < Math.abs(c)) { a=c; var s=p/4; }
                    else var s = p/(2*Math.PI) * Math.asin (c/a);
                    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
                },
                easeInBack: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c*(t/=d)*t*((s+1)*t - s) + b;
                },
                easeOutBack: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
                },
                easeInOutBack: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
                    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
                },
                easeInBounce: function (t, b, c, d) {
                    return c - this.easeOutBounce (d-t, 0, c, d) + b;
                },
                easeInOutBounce: function (t, b, c, d) {
                    if (t < d/2) return this.easeInBounce (t*2, 0, c, d) * .5 + b;
                    return this.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
                }
            }
            var yongshi = pass -now;
            return eases[ease](yongshi,0,1,all)
        },
        add : function(id,json,duration){
            this.adapterMany(id,json,duration);
            this.run();
        },
        adapter : function(id,json,duration){
            var obj = {};
            obj.id = id;
            obj.now = +new Date();
            obj.pass = +new Date();
            obj.tween = 0;
            obj.duration = duration;
            obj.styles = this.getStyles(id,json);
            return obj;
        },
        adapterMany : function(id,json,duration){
            var obj = this.adapter(id,json,duration)
            this.queen.push(obj);
        },
        getStyles : function(id,source){
            var styles=[];
            for(var item in source){
                /*   name :item
                 start:parseFloat($$.css(id,item))
                 juli:最终的位置 -- 起始位置  source[item] - start*/
                var style={};
                style.name = item;
                style.start = parseFloat($$.css(id,item));
                style.juli = parseFloat(source[item]) - style.start;
                styles.push(style)

            }
            return styles;
        }
    };
    //实例化动画组件
    $$.animate = function(id,json,duration){
        var animate = new Animate();
        animate.add(id,json,duration);
    };

    //模拟jq
    function $(context){
        return $$.$all(context);
    }

    w.$ = $;
})(window);


