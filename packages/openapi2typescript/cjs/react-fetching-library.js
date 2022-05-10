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
'use strict';Object.defineProperty(exports,"__esModule",{value:!0});var extendStatics=function(c,b){extendStatics=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,c){b.__proto__=c}||function(b,c){for(var a in c)Object.prototype.hasOwnProperty.call(c,a)&&(b[a]=c[a])};return extendStatics(c,b)};
function __extends(c,b){function a(){this.constructor=c}if("function"!==typeof b&&null!==b)throw new TypeError("Class extends value "+String(b)+" is not a constructor or null");extendStatics(c,b);c.prototype=null===b?Object.create(b):(a.prototype=b.prototype,new a)}
function __awaiter(c,b,a,h){function e(b){return b instanceof a?b:new a(function(c){c(b)})}return new (a||(a=Promise))(function(a,g){function d(b){try{k(h.next(b))}catch(l){g(l)}}function f(b){try{k(h["throw"](b))}catch(l){g(l)}}function k(b){b.done?a(b.value):e(b.value).then(d,f)}k((h=h.apply(c,b||[])).next())})}
function __generator(c,b){function a(b){return function(c){return h([b,c])}}function h(a){if(f)throw new TypeError("Generator is already executing.");for(;e;)try{if(f=1,g&&(d=a[0]&2?g["return"]:a[0]?g["throw"]||((d=g["return"])&&d.call(g),0):g.next)&&!(d=d.call(g,a[1])).done)return d;if(g=0,d)a=[a[0]&2,d.value];switch(a[0]){case 0:case 1:d=a;break;case 4:return e.label++,{value:a[1],done:!1};case 5:e.label++;g=a[1];a=[0];continue;case 7:a=e.ops.pop();e.trys.pop();continue;default:if(!(d=e.trys,d=
0<d.length&&d[d.length-1])&&(6===a[0]||2===a[0])){e=0;continue}if(3===a[0]&&(!d||a[1]>d[0]&&a[1]<d[3]))e.label=a[1];else if(6===a[0]&&e.label<d[1])e.label=d[1],d=a;else if(d&&e.label<d[2])e.label=d[2],e.ops.push(a);else{d[2]&&e.ops.pop();e.trys.pop();continue}}a=b.call(c,e)}catch(n){a=[6,n],g=0}finally{f=d=0}if(a[0]&5)throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}var e={label:0,sent:function(){if(d[0]&1)throw d[1];return d[1]},trys:[],ops:[]},f,g,d,m;return m={next:a(0),"throw":a(1),"return":a(2)},
"function"===typeof Symbol&&(m[Symbol.iterator]=function(){return this}),m}
var ActionBuilder=function(){function c(b,a){this._method=b;this._url=a}c.prototype.queryParams=function(b){this._queryParams=b;return this};c.prototype.data=function(b){this._data=b;return this};c.prototype.config=function(b){this._config=b;return this};c.prototype.getMethod=function(){return this._method};c.prototype.getUrl=function(){return this._url};c.prototype.getQueryParams=function(){return this._queryParams};c.prototype.getData=function(){return this._data};c.prototype.buildQueryString=function(){var b=
""===(new URL(this.getUrl(),"http://dummybase")).searchParams.toString()?"?":"&",a=this.getQueryParams();return a&&(a=this.urlSearchParams(a).toString(),""!==a)?b+a:""};c.prototype.urlSearchParams=function(b){var a=new URLSearchParams,c=function(b,c){void 0!==c&&(Array.isArray(c)?c.forEach(function(c){return a.append(b,c.toString())}):a.append(b,c.toString()))},e=0;for(b=Object.entries(b);e<b.length;e++){var f=b[e];c(f[0],f[1])}return a};return c}(),ReactFetchingLibraryActionBuilder=function(c){function b(){return null!==
c&&c.apply(this,arguments)||this}__extends(b,c);b.prototype.build=function(){var a=this.getUrl()+this.buildQueryString();return{method:this.getMethod(),endpoint:a,body:this.getData(),config:this._config}};return b}(ActionBuilder),actionBuilder=function(c,b){return new ReactFetchingLibraryActionBuilder(c,b)},validatedResponse=function(c,b,a,h){return{type:c,status:b,value:a,errors:h}},suppressErrorCount=0,suppressValidateError=function(c){"test"!==process.env.NODE_ENV&&console.error("suppressValidateError should only be used for testing");
suppressErrorCount+=null!==c&&void 0!==c?c:1},logError=function(c,b){if("production"!==process.env.NODE_ENV)if(0<suppressErrorCount)suppressErrorCount--;else{var a=c.method.toUpperCase()+": "+c.endpoint;console.error("All validations failed for request "+a,"with:\nrequest body:",c.body,"\nresponse status:",b.status,"\nresponse body:",b.payload,"\nerrors:",b.error)}},validateSchema=function(c,b){for(var a={},h=0,e=c.config.rules;h<e.length;h++){var f=e[h];if(f.status===b.status){var g=f.zod.safeParse(b.payload);
if(g.success)return validatedResponse(f.type,f.status,g.data,a);a[f.status]||(a[f.status]=[]);a[f.status].push(g.error)}}logError(c,b);return validatedResponse("undefined",void 0,b.payload,a)},validateSchemaResponseInterceptor=function(c){return function(b,a){return __awaiter(void 0,void 0,void 0,function(){var c,e;return __generator(this,function(f){if(null===(e=b.config)||void 0===e?0:e.rules)c=validateSchema(b,a),a.payload=c;return[2,a]})})}};exports.ReactFetchingLibraryActionBuilder=ReactFetchingLibraryActionBuilder;
exports.actionBuilder=actionBuilder;exports.suppressValidateError=suppressValidateError;exports.validateSchemaResponseInterceptor=validateSchemaResponseInterceptor
//# sourceMappingURL=react-fetching-library.js.map
