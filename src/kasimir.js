/* KasimirJS EMBED - documentation: https://kasimirjs.infracamp.org - Author: Matthias Leuffen <m@tth.es>*/

/* from core/init.js */



if (typeof KaToolsV1 === "undefined") {
    window.KaToolsV1 = class {
    }

    /**
     * The last element started by Autostarter
     * @type {HTMLElement|HTMLScriptElement}
     */
    window.KaSelf = null;
}


/* from core/dom-ready.js */
/**
 * Wait for DomContentLoaded or resolve immediate
 *
 * <example>
 * await MicxToolsVx.domReady();
 * </example>
 *
 * @return {Promise<string>}
 */
KaToolsV1.domReady = async ()=> {
    return new Promise((resolve) => {
        if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive")
            return resolve("loaded");
        document.addEventListener("DOMContentLoaded", ()=>resolve('DOMContentLoaded'));
    });
}

/* from core/query-select.js */
/**
 * Query a Element or trigger an Exception
 *
 * @param query
 * @param parent
 * @param exception
 * @return {HTMLElement}
 */
KaToolsV1.querySelector = (query, parent, exception) => {
    if (typeof exception === "undefined")
        exception = `querySelector '${query}' not found`
    if (typeof parent === "undefined" || parent === null)
        parent = document;
    let e = parent.querySelectorAll(query);
    if (e.length === 0) {
        console.warn(exception, "on parent: ", parent);
        throw exception;
    }
    return e[0];
}

/* from core/debounce.js */

KaToolsV1._debounceInterval = {i: null, time: null};

/**
 * Debounce a event
 *
 *
 *
 * @param min   Minimum Time to wait
 * @param max   Trigger event automatically after this time
 * @return {Promise<unknown>}
 */
KaToolsV1.debounce = async (min, max=null) => {
    if (max === null)
        max = min;
    let dbi = KaToolsV1._debounceInterval;
    return new Promise((resolve) => {
        if (dbi.time < (+new Date()) - max && dbi.i !== null) {
            return resolve();
        }
        if (dbi.i !== null) {
            return;
        }
        dbi.time = (+new Date());
        dbi.i = window.setTimeout(() => {
            dbi.i = null;
            return resolve('done');

        }, min);
    });

}

/* from core/sleep.js */
KaToolsV1.sleep = (sleepms) => {
    return new Promise((resolve) => {
        window.setTimeout(() => {
            return resolve('done');
        }, sleepms);
    });
}

/* from core/eval.js */


KaToolsV1.eval = (stmt, __scope, e, __refs) => {
    if (stmt.endsWith(";"))
        stmt = stmt.slice(0, -1);

    const reserved = ["var", "null", "let", "const", "function", "class", "in", "of", "for", "true", "false", "await", "$this"];
    let r = "var $this = e;";
    for (let __name in __scope) {
        if (reserved.indexOf(__name) !== -1)
            continue;
        if (__name.indexOf("-") !== -1) {
            console.error(`Invalid scope key '${__name}': Cannot contain - in scope:`, __scope);
            throw `eval() failed: Invalid scope key: '${__name}': Cannot contain minus char '-'`;
        }
        r += `var ${__name} = __scope['${__name}'];`
    }
    // If the scope was cloned, the original will be in $scope. This is important when
    // Using events [on.click], e.g.
    if (typeof __scope.$scope === "undefined") {
        r += "var $scope = __scope;";
    }
    try {
        // console.log(r + '(' + stmt + ')');
        return eval(r  + '('+stmt+')')
    } catch (ex) {
        console.error("cannot eval() stmt: '" + stmt + "': " + ex + " on element ", e, "(context:", __scope, ")");
        throw "eval('" + stmt + "') failed: " + ex;
    }
}

/* from core/str-to-camelcase.js */
/**
 * Transform any input to CamelCase
 *
 * Example: some-class => someClass
 *
 * @param str {string}
 * @return {string}
 */
KaToolsV1.strToCamelCase = function (str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

/* from core/apply.js */

KaToolsV1.apply = (selector, scope, recursive=false) => {
    if (typeof selector === "string")
        selector = KaToolsV1.querySelector(selector);

    let attMap = {
        "textcontent": "textContent",
        "htmlcontent": "htmlContent"
    }

    for(let attName of selector.getAttributeNames()) {
        //console.log(attName);
        if ( ! attName.startsWith("ka.")) {
            continue;
        }

        let attVal = selector.getAttribute(attName);

        let attType = attName.split(".")[1];
        let attSelector = attName.split(".")[2];
        if (typeof attSelector === "undefined")
            attSelector = null;


        let registerEventHandler = function(element, action, callbackOrCode, scope) {
            if (typeof element._ka_on === "undefined")
                element._ka_on = {};

            if (typeof element._ka_on[action] === "undefined")
                element.addEventListener(action, (e) => element._ka_on[action](e));

            element._ka_on[action] = async(e) => {
                scope["$event"] = e;
                if (typeof callbackOrCode === "function") {
                    return callbackOrCode(... await KaToolsV1.provider.arguments(callbackOrCode, {
                        ...scope,
                        "$event": e,
                        "$this": element,
                        "$scope": scope
                    }));
                } else {
                    return KaToolsV1.eval(callbackOrCode, scope, element);
                }
            };
        }

        if (attType === "on") {
            let attScope = {$scope: scope, ...scope}
            if (attSelector !== null) {
                registerEventHandler(selector, attSelector, attVal, attScope);
            } else {
                let callBackMap = KaToolsV1.eval(attVal, attScope, selector);
                for(let curAction in callBackMap) {
                    registerEventHandler(selector, curAction, callBackMap[curAction], attScope);
                }

            }
            continue;
        }

        let r = null;
        if (typeof attVal !== "undefined" && typeof attVal !== null && attVal !== "")
            r = KaToolsV1.eval(attVal, scope, selector);

        switch (attType) {
            case "ref":
                if (typeof scope.$ref === "undefined")
                    scope.$ref = {};
                // Allow ref without parameter to use $ref.$last
                if (r !== null)
                    scope.$ref[r] = selector;
                scope.$ref.$last = selector;
                break;

            case "classlist":
                if (attSelector  !== null) {
                    if (r === true) {
                        selector.classList.add(attSelector)
                    } else {
                        selector.classList.remove(attSelector)
                    }
                    break;
                }
                for (let cname in r) {
                    if (r[cname] === true) {
                        selector.classList.add(cname);
                    } else {
                        selector.classList.remove(cname);
                    }
                }
                break;

            case "style":
                if (attSelector  !== null) {

                    selector.style[KaToolsV1.strToCamelCase(attSelector)] = r;
                    break;
                }
                for (let cname in r) {
                    selector.style[KaToolsV1.strToCamelCase(cname)] = r[cname];
                }
                break;

            case "bindarray":
                if (attSelector === "default")
                    continue;
                if (typeof r === "undefined") {
                    // Bind default values
                    if (selector.hasAttribute("ka.bind.default")) {
                        scope = {$scope: scope, ...scope};
                        scope = {$scope: scope, ...scope, __curVal: KaToolsV1.eval(selector.getAttribute("ka.bind.default"), scope, selector)}
                        KaToolsV1.eval(`${attVal} = __curVal`, scope, selector);
                        r = scope.__curVal;
                    }
                }
                if ( ! Array.isArray(r)) {
                    console.error("kap:bindarr: Not an array!", r, selector);
                    return;
                }
                if (r.indexOf(selector.value) === -1)
                    selector.checked = false;
                else
                    selector.checked = true;

                if (typeof selector._kap_bind === "undefined") {
                    selector.addEventListener("change", (event) => {

                        let arr = KaToolsV1.eval(attVal, scope, selector);

                        if (arr.indexOf(selector.value) === -1 && selector.checked)
                            arr.push(selector.value);
                        if (arr.indexOf(selector.value) !== -1 && ! selector.checked)
                            arr = arr.filter((e) => e !== selector.value);
                        scope = {$scope: scope, ...scope, __curVal: arr};
                        KaToolsV1.eval(`${attVal} = __curVal`, scope, selector);
                        if (scope.$on && scope.$on.change)
                            scope.$on.change(event);
                    })
                    selector._kap_bind = true;
                }
                break;

            case "bind":
                if (attSelector === "default")
                    continue;
                if (typeof r === "undefined") {
                    // Bind default values
                    if (selector.hasAttribute("ka.bind.default")) {
                        scope = {$scope: scope, ...scope};
                        scope = {$scope: scope, ...scope, __curVal: KaToolsV1.eval(selector.getAttribute("ka.bind.default"), scope, selector)}
                        KaToolsV1.eval(`${attVal} = __curVal`, scope, selector);
                        r = scope.__curVal;
                    }
                }
                if (selector.type === "checkbox" || selector.type === "radio") {
                    if (selector.hasAttribute("value")) {
                        if (r === selector.getAttribute("value"))
                            selector.checked = true;
                        else
                            selector.checked = false;
                    } else {
                        if (r === true)
                            selector.checked = true;
                        else
                            selector.checked = false;
                    }
                } else {
                    selector.value = typeof r !== "undefined" ? r : "";
                }

                if (typeof selector._kap_bind === "undefined") {
                    selector.addEventListener("change", (event) => {

                        let value = null;
                        if (selector.type === "checkbox" || selector.type === "radio") {
                            if (selector.hasAttribute("value")) {
                                if (selector.checked === false)
                                    return;
                                value = selector.getAttribute("value");
                            } else {
                                value = selector.checked
                            }
                        } else {
                            value = selector.value
                        }
                        scope = {$scope: scope, ...scope, __curVal: value}
                        KaToolsV1.eval(`${attVal} = __curVal`, scope, selector);
                        if (scope.$on && scope.$on.change)
                            scope.$on.change(event);
                    })
                    selector.addEventListener("keyup", (event) => {
                        scope = {$scope: scope,...scope, __curVal: selector.value}
                        KaToolsV1.eval(`${attVal} = __curVal`, scope, selector);
                        if (scope.$on && scope.$on.change)
                            scope.$on.change(event);

                    })
                    selector._kap_bind = true;
                }
                break;

            case "options":
                let value = selector.value;
                selector.innerHTML = "";
                for (let option in r) {
                    if (isNaN(option)) {
                        selector.appendChild(new Option(r[option], option));
                    } else {
                        if (typeof r[option].text !== "undefined") {
                            selector.appendChild(new Option(r[option].text, r[option].value));
                        } else {
                            selector.appendChild(new Option(r[option], r[option]));
                        }
                    }
                }
                if (value !== null)
                    selector.value = value;
                break;

            case "attr":
                if (attSelector  !== null) {
                    if (r === null || r === false) {
                        selector.removeAttribute(attSelector)
                    } else {
                        selector.setAttribute(attSelector, r);
                    }
                    break;
                }
                for (let cname in r) {
                    if (r[cname] ===null || r[cname] === false) {
                        selector.removeAttribute(cname);
                    } else {
                        selector.setAttribute(cname, r[cname]);
                    }
                }
                break;

            case "prop":
                if (attSelector  !== null) {
                    // Set Property directly
                    selector[attSelector] = r;
                    break;
                }
                for (let cname in r) {
                    selector[cname] = r[cname];
                }
                break;

            default:
                if (typeof attMap[attType] !== "undefined")
                    attType = attMap[attType];
                if (typeof selector[attType] === "undefined") {
                    console.warn("apply(): trying to set undefined property ", attType, "on element", selector);
                }
                selector[attType] = r;
                break;
        }



    }
    if (recursive) {
        for (let e of selector.children) {
            KaToolsV1.apply(e, scope, recursive);
        }
    }
}

/* from core/elwalk.js */
/**
 *
 * @param {HTMLElement} elem
 * @param fn
 * @param recursive
 */
KaToolsV1.elwalk = (elem, fn, recursive=false, includeFirst=false) => {
    if (Array.isArray(elem))
        elem.children = elem;
    if (typeof elem.children === "undefined")
        return;
    if (includeFirst && elem instanceof HTMLElement) {
        let ret = fn(elem);
        if (ret === false)
            return false;
    }
    for(let child of elem.children) {
        let ret = fn(child);
        if (ret === false)
            continue; // No recursiion

        if (recursive && typeof child.children !== "undefined")
            KaToolsV1.elwalk(child, fn, recursive);

    }
}

/* from core/is-constructor.js */
/**
 * Returns true if fn in parameter 1 is a contructor
 *
 *
 * @param fn
 * @returns {boolean}
 */
KaToolsV1.is_constructor = (fn) => {
    return fn.toString().startsWith("class")
}

/* from tpl/templatify.js */

KaToolsV1._ka_el_idx = 0;
/**
 * Generate a renderable Template from <template> Element
 *
 * @param {HTMLElement|string} elem
 * @return {HTMLTemplateElement}
 */
KaToolsV1.templatify = (elem, returnMode=true) => {
    if (typeof elem === "string")
        elem = KaToolsV1.querySelector(elem);
    if ( ! (elem instanceof Node)) {
        console.error("[ka-templatify] Parameter 1 is not a html element: ", elem)
        throw `[ka-templify] Parameter 1 is not a html element: ${elem}`;
    }

    if (returnMode) {
        let returnTpl = document.createElement("template");
        returnTpl.setAttribute("_kaidx", (KaToolsV1._ka_el_idx++).toString())
        /* @var {HTMLTemplateElement} returnTpl */
        returnTpl.innerHTML = elem.innerHTML
            .replace(/\[\[(.*?)\]\]/g, (matches, m1) => `<span ka.textContent="${m1}"></span>`);

        KaToolsV1.templatify(returnTpl.content, false);
        return returnTpl;
    }

    if (elem instanceof HTMLTemplateElement)
        elem = elem.content;

    let wrapElem = (el, attName, attVal) => {
        let tpl = document.createElement("template");
        tpl.setAttribute("_kaidx", (KaToolsV1._ka_el_idx++).toString())
        let clonedEl = el.cloneNode(true);
        clonedEl.removeAttribute(attName);
        tpl.content.append(clonedEl);
        tpl.setAttribute(attName, attVal);
        el.replaceWith(tpl);
        return tpl;
    }

    KaToolsV1.elwalk(elem, (el) => {
        //console.log(el);
        if ( ! el instanceof HTMLElement)
            return;
        let tpl = null;
        for (let attrName of el.getAttributeNames()) {
            if (attrName === "ka.for") {
                tpl = wrapElem(el, "ka.for", el.getAttribute("ka.for"));
                KaToolsV1.templatify(tpl, false);
                break;
            }
            if (attrName === "ka.if") {
                tpl = wrapElem(el, "ka.if", el.getAttribute("ka.if"));
                KaToolsV1.templatify(tpl, false);
                break;
            }
        }
    }, true, false);
}

/* from tpl/template.js */



KaToolsV1.Template = class {

    constructor(template) {
        this.template = template;
        if (typeof this.template.__kachilds === "undefined")
            this.template.__kachilds = [];
        if (typeof this.template.__kasibling === "undefined")
            this.template.__kasibling = this.template.nextElementSibling;

        this.$scope = {};
    }

    _error(msg) {
        console.error(`[ka-template] ${msg} on element`, this.template);
        throw `[ka-template] ${msg} on element` + this.template;
    }

    _appendTemplate() {
        let elements = this.template.content;

        let elList = [];
        for (let curE of elements.children) {
            curE = curE.cloneNode(true);
            curE._ka_maintained_by = this.template.getAttribute("_kaidx");
            elList.push(curE);
            this.template.parentNode.insertBefore(curE, this.template.__kasibling);
        }
        this.template.__kachilds.push(elList);
    }

    _removeLastChild() {
        if (this.template.__kachilds.length === 0)
            return;
        let childs = this.template.__kachilds[this.template.__kachilds.length - 1];
        for (let curE of childs) {
            this.template.parentElement.removeChild(curE);
        }
        this.template.__kachilds.length = this.template.__kachilds.length - 1;

    }

    _renderFor($scope, stmt) {
        //console.log("kachilds", this.template.__kachilds);
        let matches = stmt.match(/^(let)?\s*(?<target>.+)\s+(?<type>of|in|repeat)\s+(?<select>.+)$/);
        if (matches === null) {
            this._error(`Can't parse ka.for='${stmt}'`);
        }
        let selectVal = KaToolsV1.eval(matches.groups.select, $scope, this.template);

        if (matches.groups.type === "repeat") {
            if (typeof selectVal !== "number")
                this._error(`Error ka.for='${stmt}': Selected val must be number in repeat loop`);
            selectVal = new Array(selectVal).fill(null);
        }

        let eIndex = 0;
        for (let index in selectVal) {
            let curScope = {$scope: $scope, ...$scope};
            curScope[matches.groups.target] = index;

            if (matches.groups.type === "of")
                curScope[matches.groups.target] = selectVal[index];

            if (this.template.__kachilds.length < eIndex + 1) {
                //console.log("append", eIndex, this.template.__kachilds.length);
                this._appendTemplate();
            }
            this._maintain(curScope, this.template.__kachilds[eIndex], eIndex);
            eIndex++;
        }
        for(let remIdx = eIndex; remIdx < this.template.__kachilds.length; ) {
            this._removeLastChild();
        }

    }

    _maintain($scope, childs, forIndex=0) {
        for (let child of childs) {
            child._ka_for_index = forIndex;
            KaToolsV1.elwalk(child, (el) => {
                //console.log("walk", el);
                if (el instanceof HTMLTemplateElement) {
                    //console.log("maintain", el);
                    let r = new this.constructor(el);
                    r.render($scope);
                    return false;
                }

                if (typeof el._ka_maintained_by !== "undefined" && el._ka_maintained_by !== this.template.getAttribute("_kaidx")) {
                    return false;
                }

                KaToolsV1.apply(el, $scope);
                if (el instanceof HTMLElement && el.tagName.indexOf("-") !== -1)
                    return false; // Skip CustomElements, must have - in name, (apply but don't go into elements)
            }, true, true);
        }
    }


    _renderIf($scope, stmt) {
         let selectVal = KaToolsV1.eval(stmt, $scope, this.template);
        if (selectVal === true) {
            if (this.template.__kachilds.length === 0)
                this._appendTemplate();

            this._maintain($scope, this.template.__kachilds[0]);
        } else {
            this._removeLastChild();
        }
    }

    /**
     * Remove all rendered elements
     */
    dispose() {
        for(;this.template.__kachilds.length > 0;)
            this._removeLastChild();
    }


    /**
     * Render / Update the Template
     *
     * Once the scope in parameter 1 was set, it will render
     * without any parameters. Scope is available via property $scope
     *
     * @param $scope
     */
    render($scope = null) {
        if ($scope === null)
            $scope = this.$scope;
        this.$scope = $scope;

        if (this.template.hasAttribute("ka.for")) {
            this._renderFor($scope, this.template.getAttribute("ka.for"));
        } else if (this.template.hasAttribute("ka.if")) {
            this._renderIf($scope, this.template.getAttribute("ka.if"));
        } else {
            if (typeof this.template._ka_active === "undefined") {
                this._appendTemplate();
                this.template._ka_active = true;
            }
            this._maintain($scope, this.template.__kachilds);
        }
    }
};

/* from app/getArgs.js */
/**
 * Return array of arguments of the function
 *
 * <example>
 *     function f1(arg1, arg2=null) {}
 *
 *     assert(KaToolsV1.getArgs(f1) === ["arg1", "arg2"])
 * </example>
 *
 * @param func
 * @returns {string[]}
 */
KaToolsV1.getArgs = (func) => {
    return (func + '')
        .replace(/[/][/].*$/mg,'') // strip single-line comments
        .replace(/^(.*?)=>.*$/s, (m, m1) => m1)
        .replace(/\s+/g, '') // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
        .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean).map(e => e.replace(")", "")).filter(e => e !== "");
}

/* from app/provider.js */

KaToolsV1.provider = new class {

    constructor() {
        this._services = {};
    }


    /**
     * Get / wait for a value
     *
     * @param name
     * @returns {Promise<unknown>}
     */
    async get(name) {
        return new Promise(async (resolve, reject) => {
            let service = this._services[name];
            if (typeof service === "undefined") {
                // get before defined function
                this._services[name] = {
                    cb: null,
                    params: null,
                    state: null,
                    promises: [{resolve, reject}]
                }
                return
            }

            // Already resolved/rejected: Resolve/Reject Promise immediately
            if(service.state === "resolved")
                return resolve(service.value);
            if(service.state === "rejected")
                return reject(service.value);

            // Not resolved/rejected yet? Queue Promise
            service.promises.push({resolve, reject});
            await this._resolve(name);
        });
    }


    async _resolve(name) {
        let service = this._services[name];

        // Resolve only once
        if (service.state !== null)
            return;
        service.state = "waiting";

        try {
            service.value = await service.cb(...await this.arguments(service.cb, service.params));
            service.state = "resolved";
            service.promises.forEach(prom => prom.resolve(service.value));
        } catch (e) {
            service.value = await service.cb(...await this.arguments(service.cb, service.params));
            service.state = "rejected";
            service.promises.forEach(prom => prom.reject(e));
        }
    }

    /**
     * Build arguments list depending on the name of arguments determined
     * by KaToolsV1.getArgs()
     *
     * @param cb {function}
     * @param params {object}
     * @returns {Promise<Array>}
     */
    async arguments(cb, params = {}) {
        return new Promise(async (resolve, reject) => {
            let args = KaToolsV1.getArgs(cb);
            let retArgs = [];
            for(let i = 0; i < args.length; i++) {
                let argName = args[i];
                if(params[argName]) {
                    retArgs.push(params[argName]);
                    continue;
                }
                try {
                    retArgs.push(await this.get(argName))
                } catch(e) {
                    return reject(e);
                }
            }
            resolve(retArgs);
        });
    }


    /**
     * Define a fixed value
     *
     * @param name {string}
     * @param value {any}
     */
    defineValue(name, value) {
        this.defineService(name, () => value);
    }

    /**
     * Define a service (callback to return the value)
     *
     * @param name {string}
     * @param callback {function}
     * @param params {object}
     */
    defineService(name, callback, params={}) {
        let service = this._services[name];
        if (typeof service === "undefined") {
            this._services[name] = {
                cb: callback,
                params: params,
                state: null,
                promises: []
            }
            return;
        }
        // Resolve queued Promises
        service.cb = callback;
        service.params = params;

        if (service.promises.length > 0) {
            // Resolve Promises added before define
            this._resolve(name);
        }

    }
}();

/* from ce/ce_define.js */
/**
 * Define a new CustomElement
 *
 * @param elementName
 * @param controller
 * @param template
 * @param options
 * @returns {Promise<void>}
 */
KaToolsV1.ce_define = async (elementName, controller, template=null, options={waitEvent: null}) => {
    template = await template;
    let ctrlClass = null;
    if ( KaToolsV1.is_constructor(controller)) {
        ctrlClass = controller;
        ctrlClass.__callback = null;
    } else {
        ctrlClass = class extends KaToolsV1.CustomElement{};
        ctrlClass.__callback = controller;
    }

    ctrlClass.__tpl = template;
    ctrlClass.__options = options;

    customElements.define(elementName, ctrlClass);

}

/* from ce/html.js */


KaToolsV1.html = (htmlContent) => {
    let e = document.createElement("template");
    e.innerHTML = htmlContent;
    return e;
}

/* from ce/htmlFile.js */
KaToolsV1.RemoteTemplate = class {
    constructor(url) {
        this.url = url;
        this.tpl = null;
    }

    /**
     *
     * @return {Promise<HTMLTemplateElement>}
     */
    async load() {
        if (this.tpl === null)
            this.tpl = await KaToolsV1.loadHtml(this.url);
        return this.tpl;
    }
}


/**
 * Load the Template on usage from remote location
 *
 *
 * @param url {string}
 * @return {KaToolsV1.RemoteTemplate}
 */
KaToolsV1.htmlUrl = (url) => new KaToolsV1.RemoteTemplate(url);

/* from ce/loadHtml.js */


/**
 *
 * @param url {string}
 * @return {Promise<HTMLTemplateElement>}
 */
KaToolsV1.loadHtml = async (url) => {
    let e = document.createElement("template");
    let result = await fetch(url);
    if ( ! result.ok) {
        console.error(`[loadHtml] failed to load '${url}'`);
        throw `[loadHtml] failed to load '${url}'`
    }
    let body = await result.text();
    e.innerHTML = body;
    return e;
}

/* from ce/custom-element.js */

KaToolsV1.CustomElement = class extends HTMLElement {

    constructor(props) {
        super(props);
        /**
         *
         * @public
         * @property $tpl {KaToolsV1.Template}
         * @var {KaToolsV1.Template}
         */
        this.__tpl = null;

        this.__isConnected = false;
    }

    /**
     * The Template associated with this Element
     *
     * @return {KaToolsV1.Template}
     */
    get $tpl () {
        return this.__tpl
    }


    isConnected() {
        return this.isConnected;
    }

    /**
     * @abstract
     * @return {Promise<void>}
     */
    async connected() {
        console.warn("connected() method not overridden in", this);
    }

    async connectedCallback() {
        let callback = this.constructor.__callback;
        if (callback === null) {
        } else {
            callback.bind(this);
        }

        if (this.constructor.__tpl !== null) {
            let origTpl = this.constructor.__tpl;
            if (origTpl instanceof KaToolsV1.RemoteTemplate)
                origTpl = await origTpl.load();

            let tpl = KaToolsV1.templatify(origTpl);
            this.appendChild(tpl);
            this.__tpl = new KaToolsV1.Template(tpl);
        }

        if (this.constructor.__options.waitEvent !== null) {
            let wd = this.constructor.__options.waitEvent.split("@");
            let eventName = wd[0];
            let target = document;
            if (wd.length === 2) {
                target = KaToolsV1.querySelector(wd[1]);
            }
            target.addEventListener(eventName, async (event) => {
                callback(... await KaToolsV1.provider.arguments(callback, {
                    "$this": this,
                    "$tpl": this.$tpl,
                    "$event": event
                }));
                this.__isConnected = true;
            })
            return;
        }

        if (callback === null) {
            // Class: Call connected() Method
            this.connected(...await KaToolsV1.provider.arguments(this.connected, {
                "$this": this,
                "$tpl": this.$tpl
            }));
            this.__isConnected = true;
            return
        }

        // Function
        callback(... await KaToolsV1.provider.arguments(callback, {
            "$this": this,
            "$tpl": this.$tpl
        }));
        this.__isConnected = true;
    }

};

/* from core/autostart.js */

(async ()=>{
    await KaToolsV1.domReady();

    // Unescape entities replaced by jekyll template engine
    for (let e of document.querySelectorAll("template[ka-unescape]")) {
        let data = e.innerHTML;
        e.innerHTML = data.replaceAll("&lt;", "<")
            .replaceAll("&amp;", "&")
            .replaceAll("&gt;", ">");
    }

    for (let e of document.querySelectorAll("template[ka-autostart]")) {
        let ne = document.importNode(KaToolsV1.querySelector("script", e.content), true).cloneNode(true);
        KaSelf = ne;
        if (e.nextElementSibling === null) {
            ne.parentNode.append(ne);
            continue;
        }
        e.parentNode.insertBefore(ne, e.nextElementSibling);
    }
})()

/* from core/router.js */

