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

