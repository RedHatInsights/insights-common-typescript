/*
 *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
*****************************************************************************/
function m(b,a){m=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b}||function(a,b){for(var d in b)Object.prototype.hasOwnProperty.call(b,d)&&(a[d]=b[d])};return m(b,a)}function p(b,a){function f(){this.constructor=b}if("function"!==typeof a&&null!==a)throw new TypeError("Class extends value "+String(a)+" is not a constructor or null");m(b,a);b.prototype=null===a?Object.create(a):(f.prototype=a.prototype,new f)}
function q(b,a,f,h){function d(a){return a instanceof f?a:new f(function(b){b(a)})}return new (f||(f=Promise))(function(f,g){function c(a){try{e(h.next(a))}catch(n){g(n)}}function k(a){try{e(h["throw"](a))}catch(n){g(n)}}function e(a){a.done?f(a.value):d(a.value).then(c,k)}e((h=h.apply(b,a||[])).next())})}
function r(b,a){function f(a){return function(b){return h([a,b])}}function h(e){if(k)throw new TypeError("Generator is already executing.");for(;d;)try{if(k=1,g&&(c=e[0]&2?g["return"]:e[0]?g["throw"]||((c=g["return"])&&c.call(g),0):g.next)&&!(c=c.call(g,e[1])).done)return c;if(g=0,c)e=[e[0]&2,c.value];switch(e[0]){case 0:case 1:c=e;break;case 4:return d.label++,{value:e[1],done:!1};case 5:d.label++;g=e[1];e=[0];continue;case 7:e=d.ops.pop();d.trys.pop();continue;default:if(!(c=d.trys,c=0<c.length&&
c[c.length-1])&&(6===e[0]||2===e[0])){d=0;continue}if(3===e[0]&&(!c||e[1]>c[0]&&e[1]<c[3]))d.label=e[1];else if(6===e[0]&&d.label<c[1])d.label=c[1],c=e;else if(c&&d.label<c[2])d.label=c[2],d.ops.push(e);else{c[2]&&d.ops.pop();d.trys.pop();continue}}e=a.call(b,d)}catch(u){e=[6,u],g=0}finally{k=c=0}if(e[0]&5)throw e[1];return{value:e[0]?e[1]:void 0,done:!0}}var d={label:0,sent:function(){if(c[0]&1)throw c[1];return c[1]},trys:[],ops:[]},k,g,c,l;return l={next:f(0),"throw":f(1),"return":f(2)},"function"===
typeof Symbol&&(l[Symbol.iterator]=function(){return this}),l}
var t=function(b){function a(){return null!==b&&b.apply(this,arguments)||this}p(a,b);a.prototype.build=function(){var a=this.getUrl()+this.buildQueryString();return{method:this.getMethod(),endpoint:a,body:this.getData(),config:this._config}};return a}(function(){function b(a,b){this._method=a;this._url=b}b.prototype.queryParams=function(a){this._queryParams=a;return this};b.prototype.data=function(a){this._data=a;return this};b.prototype.config=function(a){this._config=a;return this};b.prototype.getMethod=
function(){return this._method};b.prototype.getUrl=function(){return this._url};b.prototype.getQueryParams=function(){return this._queryParams};b.prototype.getData=function(){return this._data};b.prototype.buildQueryString=function(){var a=""===(new URL(this.getUrl(),"http://dummybase")).searchParams.toString()?"?":"&",b=this.getQueryParams();return b&&(b=this.urlSearchParams(b).toString(),""!==b)?a+b:""};b.prototype.urlSearchParams=function(a){function b(a,b){void 0!==b&&(Array.isArray(b)?b.forEach(function(b){return h.append(a,
b.toString())}):h.append(a,b.toString()))}var h=new URLSearchParams,d=0;for(a=Object.entries(a);d<a.length;d++){var k=a[d];b(k[0],k[1])}return h};return b}()),v=0;function actionBuilder(b,a){return new t(b,a)};function suppressValidateError(b){"test"!==process.env.NODE_ENV&&console.error("suppressValidateError should only be used for testing");v+=null!==b&&void 0!==b?b:1};
function validateSchemaResponseInterceptor(){return function(b,a){return q(void 0,void 0,void 0,function(){var f,h;return r(this,function(){if(null===(h=b.config)||void 0===h?0:h.rules){a:{for(var d={},k=0,g=b.config.rules;k<g.length;k++){var c=g[k];if(c.status===a.status){var l=c.zod.safeParse(a.payload);if(l.success){f={type:c.type,status:c.status,value:l.data,errors:d};break a}else d[c.status]||(d[c.status]=[]),d[c.status].push(l.error)}}"production"!==process.env.NODE_ENV&&(0<v?v--:(k=
b.method.toUpperCase()+": "+b.endpoint,console.error("All validations failed for request "+k,"with:\nrequest body:",b.body,"\nresponse status:",a.status,"\nresponse body:",a.payload,"\nerrors:",a.error)));f={type:"undefined",status:void 0,value:a.payload,errors:d}}a.payload=f}return[2,a]})})}};export{t as ReactFetchingLibraryActionBuilder,actionBuilder,suppressValidateError,validateSchemaResponseInterceptor}
//# sourceMappingURL=react-fetching-library.js.map
