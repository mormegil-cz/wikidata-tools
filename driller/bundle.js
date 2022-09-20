/*! For license information please see bundle.js.LICENSE.txt */
(()=>{var t={588:function(t){var e;e=function(t){var e=function(t){return new e.lib.init(t)};function n(t,e){return e.offset[t]?isNaN(e.offset[t])?e.offset[t]:e.offset[t]+"px":"0px"}function o(t,e){return!(!t||"string"!=typeof e||!(t.className&&t.className.trim().split(/\s+/gi).indexOf(e)>-1))}return e.defaults={oldestFirst:!0,text:"Toastify is awesome!",node:void 0,duration:3e3,selector:void 0,callback:function(){},destination:void 0,newWindow:!1,close:!1,gravity:"toastify-top",positionLeft:!1,position:"",backgroundColor:"",avatar:"",className:"",stopOnFocus:!0,onClick:function(){},offset:{x:0,y:0},escapeMarkup:!0,style:{background:""}},e.lib=e.prototype={toastify:"1.11.2",constructor:e,init:function(t){return t||(t={}),this.options={},this.toastElement=null,this.options.text=t.text||e.defaults.text,this.options.node=t.node||e.defaults.node,this.options.duration=0===t.duration?0:t.duration||e.defaults.duration,this.options.selector=t.selector||e.defaults.selector,this.options.callback=t.callback||e.defaults.callback,this.options.destination=t.destination||e.defaults.destination,this.options.newWindow=t.newWindow||e.defaults.newWindow,this.options.close=t.close||e.defaults.close,this.options.gravity="bottom"===t.gravity?"toastify-bottom":e.defaults.gravity,this.options.positionLeft=t.positionLeft||e.defaults.positionLeft,this.options.position=t.position||e.defaults.position,this.options.backgroundColor=t.backgroundColor||e.defaults.backgroundColor,this.options.avatar=t.avatar||e.defaults.avatar,this.options.className=t.className||e.defaults.className,this.options.stopOnFocus=void 0===t.stopOnFocus?e.defaults.stopOnFocus:t.stopOnFocus,this.options.onClick=t.onClick||e.defaults.onClick,this.options.offset=t.offset||e.defaults.offset,this.options.escapeMarkup=void 0!==t.escapeMarkup?t.escapeMarkup:e.defaults.escapeMarkup,this.options.style=t.style||e.defaults.style,t.backgroundColor&&(this.options.style.background=t.backgroundColor),this},buildToast:function(){if(!this.options)throw"Toastify is not initialized";var t=document.createElement("div");for(var e in t.className="toastify on "+this.options.className,this.options.position?t.className+=" toastify-"+this.options.position:!0===this.options.positionLeft?(t.className+=" toastify-left",console.warn("Property `positionLeft` will be depreciated in further versions. Please use `position` instead.")):t.className+=" toastify-right",t.className+=" "+this.options.gravity,this.options.backgroundColor&&console.warn('DEPRECATION NOTICE: "backgroundColor" is being deprecated. Please use the "style.background" property.'),this.options.style)t.style[e]=this.options.style[e];if(this.options.node&&this.options.node.nodeType===Node.ELEMENT_NODE)t.appendChild(this.options.node);else if(this.options.escapeMarkup?t.innerText=this.options.text:t.innerHTML=this.options.text,""!==this.options.avatar){var o=document.createElement("img");o.src=this.options.avatar,o.className="toastify-avatar","left"==this.options.position||!0===this.options.positionLeft?t.appendChild(o):t.insertAdjacentElement("afterbegin",o)}if(!0===this.options.close){var i=document.createElement("span");i.innerHTML="&#10006;",i.className="toast-close",i.addEventListener("click",function(t){t.stopPropagation(),this.removeElement(this.toastElement),window.clearTimeout(this.toastElement.timeOutValue)}.bind(this));var s=window.innerWidth>0?window.innerWidth:screen.width;("left"==this.options.position||!0===this.options.positionLeft)&&s>360?t.insertAdjacentElement("afterbegin",i):t.appendChild(i)}if(this.options.stopOnFocus&&this.options.duration>0){var r=this;t.addEventListener("mouseover",(function(e){window.clearTimeout(t.timeOutValue)})),t.addEventListener("mouseleave",(function(){t.timeOutValue=window.setTimeout((function(){r.removeElement(t)}),r.options.duration)}))}if(void 0!==this.options.destination&&t.addEventListener("click",function(t){t.stopPropagation(),!0===this.options.newWindow?window.open(this.options.destination,"_blank"):window.location=this.options.destination}.bind(this)),"function"==typeof this.options.onClick&&void 0===this.options.destination&&t.addEventListener("click",function(t){t.stopPropagation(),this.options.onClick()}.bind(this)),"object"==typeof this.options.offset){var l=n("x",this.options),a=n("y",this.options),u="left"==this.options.position?l:"-"+l,c="toastify-top"==this.options.gravity?a:"-"+a;t.style.transform="translate("+u+","+c+")"}return t},showToast:function(){var t;if(this.toastElement=this.buildToast(),!(t="string"==typeof this.options.selector?document.getElementById(this.options.selector):this.options.selector instanceof HTMLElement||"undefined"!=typeof ShadowRoot&&this.options.selector instanceof ShadowRoot?this.options.selector:document.body))throw"Root element is not defined";var n=e.defaults.oldestFirst?t.firstChild:t.lastChild;return t.insertBefore(this.toastElement,n),e.reposition(),this.options.duration>0&&(this.toastElement.timeOutValue=window.setTimeout(function(){this.removeElement(this.toastElement)}.bind(this),this.options.duration)),this},hideToast:function(){this.toastElement.timeOutValue&&clearTimeout(this.toastElement.timeOutValue),this.removeElement(this.toastElement)},removeElement:function(t){t.className=t.className.replace(" on",""),window.setTimeout(function(){this.options.node&&this.options.node.parentNode&&this.options.node.parentNode.removeChild(this.options.node),t.parentNode&&t.parentNode.removeChild(t),this.options.callback.call(t),e.reposition()}.bind(this),400)}},e.reposition=function(){for(var t,e={top:15,bottom:15},n={top:15,bottom:15},i={top:15,bottom:15},s=document.getElementsByClassName("toastify"),r=0;r<s.length;r++){t=!0===o(s[r],"toastify-top")?"toastify-top":"toastify-bottom";var l=s[r].offsetHeight;t=t.substr(9,t.length-1),(window.innerWidth>0?window.innerWidth:screen.width)<=360?(s[r].style[t]=i[t]+"px",i[t]+=l+15):!0===o(s[r],"toastify-left")?(s[r].style[t]=e[t]+"px",e[t]+=l+15):(s[r].style[t]=n[t]+"px",n[t]+=l+15)}return this},e.lib.init.prototype=e.lib,e},t.exports?t.exports=e():this.Toastify=e()}},e={};function n(o){var i=e[o];if(void 0!==i)return i.exports;var s=e[o]={exports:{}};return t[o].call(s.exports,s,s.exports,n),s.exports}(()=>{"use strict";var t=n(588);const e=vis,o=document.getElementById.bind(document),i=["en","cs"],s=/!?\^?[a-z]*:(P[1-9][0-9]*|[A-Za-z]+)[*+?]?([|/]!?\^?[a-z]*:(P[1-9][0-9]*|[A-Za-z]+)[*+?]?)*/,r="http://www.wikidata.org/entity/",l=r.length,a="http://www.wikidata.org/prop/",u=a.length;let c=1;class d{constructor(t,e){this.property=t,this.count=e}}class p{constructor(t,e,n){this.shape=e,this.count=n,this.id=p.currentId++,this.caption=t}get caption(){return this._caption}set caption(t){this._caption=t,this.label=this.count?`${t}\n${this.count}`:t}}p.currentId=0;class f extends p{constructor(t){super(t,"circle")}canQuery(){return!1}}class h extends p{constructor(t,e,n){super(t,e,n),this.availableProperties=null}canQuery(){return!0}}class m extends h{constructor(t,e,n){super(t,"box",n),this.query=e}computeQuery(){return this.query}}function v(t,e){return t.toFixed(0).padStart(e,"0")}function y(t){return t.substring(l)}function w(t){return t.substring(u)}function g(t){return t.startsWith(r)?y(t):t.startsWith(a)?w(t):t}let b={};function E(t){var e;return null!==(e=b[t])&&void 0!==e?e:null}function k(t,e){for(const n of e){const e=t[n];if(e&&e.value)return e.value}return null}function T(t,e){var n;switch(t){case"uri":const t=g(e);return t?null!==(n=E(t))&&void 0!==n?n:t:e;case"http://www.w3.org/2001/XMLSchema#dateTime":const o=new Date(e);return`${o.getUTCFullYear()}-${v(o.getUTCMonth()+1,2)}-${v(o.getUTCDate(),2)}`;default:return e}}function L(t,e){switch(t){case"uri":return e.startsWith(r)?"wd:"+y(e):`<${e}>`;case"http://www.w3.org/2001/XMLSchema#dateTime":return`"${e}"^^xsd:dateTime`;default:const t=JSON.stringify(e);return`'${t.substring(1,t.length-1).replace(/'/g,"\\'")}'`}}function N(e,n){t({text:e,className:n}).showToast()}function C(t){N(t,"warning")}function x(t){N(t,"error")}function S(t,e,n){t.style.display=e?n:"none"}const P=new e.DataSet([]),$=new e.DataSet([]);window.onload=function(){const t=o("selectionLabel"),n=o("selectionCount"),r=o("selectionToolbox"),l=o("editQuerySparql"),u=o("editQueryCaption"),p=o("boxDrillPropProperty"),h=o("dlgQuery"),v=o("dlgDrillProp"),_=o("btnUnion"),O=o("btnIntersect"),Q=o("btnMinus"),R=o("btnDeleteNode"),M=o("btnWqs"),W=o("btnDrillProp"),D=o("btnDrillCustomProp");o("selectionLabel").addEventListener("click",(function(){const t=J();if(!t)return;const e=prompt("Node caption:",t.caption);e&&(P.remove(t),t.caption=e,P.add(t),K())})),_.addEventListener("click",(function(){const t=H();t.length<=1||Z("union","{ "+V(t," } UNION { ")+" }").then((e=>B(t,e)))})),O.addEventListener("click",(function(){const t=H();t.length<=1||Z("intersect","{ "+V(t," } { ")+" }").then((e=>B(t,e)))})),Q.addEventListener("click",(function(){const t=H();t.length<=1||Z("minus","{ "+V(t," } MINUS { ")+" }").then((e=>B(t,e)))})),o("btnAddQuery").addEventListener("click",(function(){u.value="",u.placeholder=`Query ${c}`,l.value="VALUES ?item { wd:Q42 }",h.showModal()})),o("btnDeleteNode").addEventListener("click",(function(){const t=J();t&&(j&&(clearTimeout(j),j=null),F===t?(P.remove(t.id),R.innerText="Del!",K()):(F=t,R.innerText="Sure?",j=window.setTimeout((()=>{F=null,R.innerText="Del!"}),2e3)))})),M.addEventListener("click",(function(){const t=J();t&&t.canQuery()&&window.open("https://query.wikidata.org/#"+encodeURIComponent(`SELECT ?item ?itemLabel WHERE {\n\t${t.computeQuery().replace(/\\n/g,"\n\t")}\n\tSERVICE wikibase:label { bd:serviceParam wikibase:language "${i.join(",")}". }\n}`))})),W.addEventListener("click",(function(){const t=J();if(!(null==t?void 0:t.canQuery()))return;const e=t.availableProperties;e?z(e):function(t){let e=[];et(`SELECT ?driller_prop ?driller_count WHERE { { SELECT ?driller_prop (COUNT(?item) AS ?driller_count) WHERE { { ${t.computeQuery()} } ?item ?driller_prop []. } GROUP BY ?driller_prop\n}FILTER(STRSTARTS(STR(?driller_prop), "${a}P")) } ORDER BY DESC (?driller_count)`).then((t=>{let n=t.length;if(!n)return C("No properties found"),Promise.resolve();let o=[];for(let i=0;i<n;++i){const n=t[i].driller_prop.value,s=+t[i].driller_count.value,r=w(n);e.push(new d(r,s)),b[r]||o.push(a+r)}return o.length?tt(o):Promise.resolve()})).then((()=>{if(!e.length)return;const n=e.length;for(let t=0;t<n;++t){const n=e[t];n.label=E(n.property)}t.availableProperties=e,K(),N(`${n} properties loaded`,"info"),z(e)})).catch((t=>{x("WQS request failed")}))}(t)})),D.addEventListener("click",(function(){const t=J();if(!(null==t?void 0:t.canQuery()))return;const e=prompt("Property: ","wdt:P31");e&&(s.test(e)?G(t,e,e.replace(/(wdt|wikibase):/g,"")):C("Invalid property path syntax"))})),h.addEventListener("close",(function(){h.returnValue&&Z(u.value||`Query ${c}`,l.value)})),v.addEventListener("close",(function(){if(!v.returnValue)return;const t=J();if(!(null==t?void 0:t.canQuery()))return;if(!p.selectedOptions.length)return;const e=p.selectedOptions[0].value;G(t,`p:${e}/ps:${e}`,E(e))}));const q={nodes:P,edges:$},A=new e.Network(o("display"),q,{interaction:{multiselect:!0},nodes:{scaling:{min:1,max:10,label:{enabled:!0,min:10,max:50}}}});function I(t){P.add(t),A.focus(t.id),A.fit()}function U(t,e){$.add({id:$.length,from:t.id,to:e.id,arrows:"to"})}A.on("selectNode",K),A.on("deselectNode",K),o("btnZoomFit").addEventListener("click",(()=>A.fit())),o("btnZoomPlus").addEventListener("click",(()=>X(1.4142))),o("btnZoomMinus").addEventListener("click",(()=>X(.7071)));let F=null,j=null;function H(){return A.getSelectedNodes().map((t=>P.get(t))).filter((t=>t.canQuery()))}function V(t,e){const n=[];for(const e of t)n.push(e.computeQuery());return n.join(e)}function B(t,e){if(e)for(const n of t)U(n,e)}function z(t){p.innerHTML="";for(let e=0;e<t.length;++e){let n=t[e];const o=document.createElement("option");o.value=n.property,o.text=`${n.property} ${n.label} (${n.count})`,p.add(o)}v.showModal()}function Y(t,e,n,o){const i=new m(t,e,n);1===n&&(i.url=o,i.linkLabel=`1 (${y(o)})`);const s=i;return s.mass=s.value=1+Math.log10(n),i}function Z(t,e){return et(`SELECT (COUNT(?item) AS ?driller_count) (SAMPLE(?item) AS ?driller_item) WHERE { ${e} }`).then((n=>{if(1!=n.length)return void x("Unexpected result from WQS query");const o=+n[0].driller_count.value;if(0===o)return C("No such item"),null;const i=Y(t,e,o,n[0].driller_item.value);return I(i),A.selectNodes([i.id]),K(),++c,i})).catch((t=>(x("WQS request failed"),null)))}function G(t,e,n){et(`SELECT ?driller_value (COUNT(?item) AS ?driller_count) (SAMPLE(?item) AS ?driller_item) WHERE { { ${t.computeQuery()} } ?item ${e} ?driller_value } GROUP BY ?driller_value\nORDER BY DESC(?driller_count)\nLIMIT 11`).then((t=>{let e=t.length;if(!e)return void C("No such claim");e>10&&(C("Too many values, showing 10 most common"),e=10);let n=[];if("uri"===t[0].driller_value.type){for(let o=0;o<e;++o)n.push(t[o].driller_value.value);return tt(n).then((n=>({resultCount:e,queryResults:t})))}return{resultCount:e,queryResults:t}})).then((({resultCount:o,queryResults:i})=>{const s=new f(n);I(s),U(t,s);const r=i[0].driller_value.type,l=i[0].driller_value.datatype,a="literal"===r?l:r;for(let n=0;n<o;++n){const o=i[n].driller_value.value,r=+i[n].driller_count.value,l=i[n].driller_item.value,u=T(a,o),c=L(a,o),d=Y(u,`{ { ${t.computeQuery()} } ?item ${e} ${c} }`,r,l);I(d),U(s,d)}A.focus(s.id),A.fit(),A.selectNodes([s.id]),K()})).catch((t=>{x("WQS request failed")}))}function X(t){A.moveTo({scale:A.getScale()*t,position:A.getViewPosition()})}function J(){const t=A.getSelectedNodes();return 1===t.length?P.get(t[0]):null}function K(){const e=A.getSelectedNodes(),o=1===e.length?P.get(e[0]):null,i=e.length>1&&0===e.map((t=>P.get(t))).filter((t=>!t||!t.canQuery())).length;let s;o?(t.innerText=o.caption,o.url?n.innerHTML=`<a href="${o.url}">${o.linkLabel}</a>`:n.innerText=o.count?""+o.count:"",r.style.visibility="visible",s=o.canQuery()):(t.innerText="",n.innerText="",r.style.visibility="hidden",s=!1),S(_,i,"inline"),S(O,i,"inline"),S(Q,i,"inline"),S(M,s,"inline"),S(W,s,"inline"),S(D,s,"inline")}function tt(t){it();const e=t.map(g).filter((t=>t&&!E(t))),n=e.length;let o=Promise.resolve();for(let t=0;t<n;t+=50){let s=e.slice(t,Math.min(t+50,n));o=o.then((()=>fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&ids=${s.join("%7C")}&props=labels&languages=${i.join("%7C")}`).then((t=>200!==t.status?t.text().then((e=>{throw console.error("Failed executing API request",s,t,e),e})):t.json())).then((t=>{var e;const n=t.entities;for(const t in n){const o=n[t];b[t]=null!==(e=k(o.labels,i))&&void 0!==e?e:t}}))))}return o.finally(st)}function et(t){return it(),fetch("https://query.wikidata.org/sparql?format=json&query="+encodeURIComponent(t)).then((e=>200!==e.status?e.text().then((n=>{throw console.error("Failed executing SPARQL query",t,e,n),n})):e.json())).then((t=>t.results.bindings)).finally(st)}let nt=1;const ot=o("spinner");function it(){++nt,1==nt&&(ot.style.display="block")}function st(){--nt,0==nt&&(ot.style.display="none")}K(),st()}})()})();