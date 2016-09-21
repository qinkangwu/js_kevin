/**
 *  常用功能框架封装 by Kevin
 */
var Kevin = function(){};

Kevin.prototype = {
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
        return document.getElementById(id);
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
        return context.querySelectorAll(str);
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
   css : function(context,key,value){
       var dom = $$.isString(context)?$$.$all(context) : context;
       //如果是数组
       if(dom.length){
           //先骨架骨架 -- 如果是获取模式 -- 如果是设置模式
           //如果value不为空，则表示设置
           if(value){
               for(var i = dom.length - 1; i >= 0; i--){
                   setStyle(dom[i],key, value);
               }
               //            如果value为空，则表示获取
           }else{
               return getStyle(dom[0]);
           }
           //如果不是数组
       }else{
           if(value){
               setStyle(dom,key, value);
           }else{
               return getStyle(dom);
           }
       }
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
    attr : function(context,key,value){
        var doms = $$.$all(context);
        //判断传入的参数，如果是两个就代表是获取属性
        if(arguments.length == 2){
            //获取属性
            return doms[0].getAttribute(key);
        }else if(arguments.length == 3){
            //设置值
            for(var i = 0 ; i < doms.length ; i++){
                doms[i].setAttribute(key,value);
            }
        }else{
            throw Error('函数参数错误')
        }
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
    addClass : function(context,str){
        var doms = $$.$all(context);
        for(var i = 0 ; i< doms.length ; i++){
            doms[i].className += ' ' + str;
        }
    },
    //删除类名
    removeClass : function(context,str){
        var doms = $$.$all(context);
        for(var i = 0 ; i< doms.length ; i++){
            doms[i].className = doms[i].className.replace(str,'');
        }
    },
    html : function(context,str){
        var doms = $$.$all(context);
        if(arguments.length == 1){
            //获取文本内容
            return doms[0].innerHTML;
        }
        if(arguments.length == 2){
            //设置文本内容
            for(var i = 0 ; i < doms.length ; i++){
                doms[i].innerHTML = str;
            }
        }

    },
    //隐藏
    hide : function(context){
        $$.css(context,'display','none');
    },
    //显示
    show : function(context){
        $$.css(context,'display','block')
    }
});

//动画框架
$$.extend($$,{
    animate : function(id,distance,duration){
        //将一个物体从x距离移动到y距离 花s秒
        var now = +new Date(); //计算时间差
        var tween = 0; //初始化动画时间进程
        var timer;
        timer = setInterval(move,1);
        //封装动画时间进程
        function getTween(now,pass,all){
            var tween;
            pass = +new Date();
            tween = (pass-now)/all;
            return tween;
        }
        //设置样式
        function setOneProperty(id,name,start,distance,tween){
            $$.css(id,name,(start+distance*tween)+'px');
        }
        //停止动画
        function stop(){
            clearInterval(timer);
        }
        //动画开始
        function move(){
            if(tween>=1){
                stop();
            }else{
                pass = +new Date();
                tween = getTween(now,pass,duration);
                setOneProperty(id,'left',0,distance,tween);
            }
        }


    }
});

