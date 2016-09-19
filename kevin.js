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
    //根据class获取DOM
    $tag : function(tag){
        return document.getElementsByTagName(tag);
    }
});

//事件处理
$$.extend($$,{
    on : function(elem,type,fn){
        var dom = this.$id(elem);
        if(dom.addEventListener){
            dom.addEventListener(type,fn,false);
        }else{
            //兼容低版本IE
            dom.attachEvent('on'+type,fn);
        }

    }
});

