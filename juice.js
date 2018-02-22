/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* 
*  Juice.js
*  Copyright 2018 Kameron Brooks
*  All Rights Reserved.
* 
*  MIT License
* 
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/*
 *   Prefix
 *   [t] = 1st letter of type
 *   [T] = full type
 *   [e] = strict t, (forces tagName instead of type)
 *   [E] = strict T
 *   [I] = id
 *   [p1] = 1st letter of parent node id
 *   [P] = parent node id
 */

let juice = function(params) {
    /* * * * * * * * * * * * * * * 
    *   JuiceElem
    *   this is the type of object returned by the juice function 
    *   that holds all element data and allows for further DOM manipulation
    * 
    *   The purpose of juice js is to eliminate the need for retrieving elements
    *   from the DOM by a string based method such as: 
    *       $('#id'),
    *       document.getElementById('id)  or
    *       parent.querySelector('#id)
    *   Juice does this by seaching the DOM and providing a property based
    *   approach for accessing DOM elements.
    * 
    *   Upon calling the juice function, the returned JuiceElem object will
    *   contain a property for each element that has an id. The name of the 
    *   property will be the the modified id of the element.
    * 
    * * * * * * * * * * * * * * * */
    function JuiceElem() {
    
    }
    // creates a new element in the DOM
    JuiceElem.prototype.create = function(params) {
        // find the element tagName
        let typeData = (params.type) ? params.type.split(/\W/) : [undefined, undefined];
        let type = typeData[0];
        // create element, default to span if none provided
        let elem = document.createElement(type || 'span');
        // find element type, if provided
        if (typeData.length > 1) {
            elem.type = typeData[1];
        }
        //set element id
        if (params.id !== undefined) {
            elem.id = params.id;
            if (this[params.id] !== undefined) {                    // check to see if property already exists within JuiceElem
                let c = 1;
                while (this[params.id + "_" + c] !== undefined) {   // give param a unique incremented property name if already taken
                    c += 1;
                }
                this[params.id + "_" + c] = elem;
            } else {
                this[params.id] = elem;
            }
        }
        // set class
        if (params.class !== undefined) {
            elem.className = params.class;
        }
        // set parent element
        if (params.parent != undefined) {
            elem.appendTo(params.parent);
        }
        // append child elements 
        if (params.children) {
            for (let i = 0; i < params.children.length; i += 1) {
                elem.appendChild(params.children[i]);
            }
        }
        // add event listeners 
        if (params.functions) {
            if (Array.isArray(params.functions)) {                      // handles a list of type [{name, func}, {name, func}, ...]
                for (let i = 0; i < params.functions.length; i += 1) {
                    var eventName = params.functions[i].name;
                    var eventFunc = params.functions[i].func;
                    if (eventName != null && eventFunc != null) {
                        elem.addEventListener(eventName, eventFunc);
                    }
    
                }
            } else if (typeof params.functions === 'object') {          // handles an object of type {callbackName : function(){}, callbackName : function(){}, ...}
                let keys = Object.keys(params.functions);
                for (let i = 0; i < keys.length; i += 1) {
                    elem.addEventListener(keys[i], params.functions[keys[i]]);
                }
            } else if (typeof params.functions === 'function') {        // handles a single function being passed 
                elem.addEventListener('click', params.functions);
            } else {
    
            }
        }
    
        if (params.style) {                                             // handles a style object 
            let keys = Object.keys(params.style);
            for (let i = 0; i < keys.length; i += 1) {
                elem.style[keys[i]] = params.style[keys[i]];
            }
        }
        // sets the element innerHTML, this will overwrite the children parameter
        if (params.innerHTML != null) {
            elem.innerHTML = params.innerHTML;
        }
        if (params.value !== undefined) {
            elem.value = params.value;
        }
        if (params.readOnly !== undefined) {
            elem.readOnly = params.readOnly;
        }
        // builds a table, if applicable
        if (params.type == "table") {
    
            let tCols = [];
            let tData = [];
            
            if (params.columnNames !== undefined) {
                tCols = params.columnNames
            } else {
                if (params.data !== undefined && Array.isArray(params.data) && params.data.length > 0) {
                    tCols = Object.keys(params.data[0]);
                }
            }
            let tRow = elem.insertRow(-1);
            let tCell = null;
            for (let ti = 0; ti < tCols.length; ti += 1) {
                tCell = tRow.insertCell(ti);
                tCell.innerHTML = tCols[ti];
            }
            if (params.data !== undefined) {
                for (let tj = 0; tj < params.data.length; tj += 1) {
                    tRow = elem.insertRow(-1);
                    for (ti = 0; ti < tCols.length; ti += 1) {
                        tCell = tRow.insertCell(ti);
                        tCell.innerHTML = params.data[tj][tCols[ti]];
    
                    }
                }
            }
        }
        return elem;
    
    };
    // Makes element names into save parameter names
    function makeNameSafe(name) {
        let id = (name).replace('-', '_');           // Make names safe      
        return id.replace(/[^\w]/g, '');             // Remove whitespace
    }
    // Returns the element name based on the supplied convention
    function getElementNameFromConvention(elem, namePattern) {
        if(!elem) return "";
        if(!namePattern) return makeNameSafe(elem.id);
        let tagName = elem.tagName.toLowerCase();
        let type = elem.getAttribute('type');
        let parentID = elem.parentElement.id || "";

        let meta = {
            t: (type || tagName).charAt(0),                     // [t] = 1st letter of type
            T: (type || tagName),                               // [T] = full type
            e: (tagName).charAt(0),                             // [e] = strict t, (forces tagName instead of type)
            E: (tagName),                                       // [E] = strict T
            I: makeNameSafe(elem.id),                                              // [I] = id
            p: (parentID != "") ? parentID.charAt(0) : "",      // [p] = 1st letter of parent node id
            P: parentID                                         // [P] = parent node id
        };
        // Replaces tags with respective element data
        return makeNameSafe(params.namePattern.toString()
            .replace('[t]', meta.t)
            .replace('[T]', meta.T)
            .replace('[e]', meta.e)
            .replace('[E]', meta.E)
            .replace('[I]', meta.I)
            .replace('[p]', meta.p)
            .replace('[P]', meta.P)
            .replace(/[^\w]/g, '')
    );

    }
    
    /* * * * * * * * * * * * * * * 
    *   Juice Function Logic
    *   
    *   @returns Populated JuiceElem
    * * * * * * * * * * * * * * * */
    if (!params) params = {};
    let output = new JuiceElem();
    let parent = document;
    // set base juice element based on params.element
    if (params.element != null) {
        if (params.element instanceof Element) {
            parent = params.element;
        } else {
            var e1 = document.getElementById(params.element.toString());
            if (e1 != null) {
                parent = e1;
            }
        }
    }
    // select all elements that have an id
    let elems = parent.querySelectorAll('*[id]');
    
    let count = elems.length;
    for (let i = 0; i < count; i += 1) {
        let id = makeNameSafe(elems[i].id);
        let varName = "";

        // Rename element variables by name pattern
        let convention = params.namePattern || params.nameConvention || params.namingConvention;
        if (convention) {
            varName = getElementNameFromConvention(elems[i],convention);
        } else {
            varName = id;
        }
        // add variables to global scope as well if global flag is set
        if (params.global) {
            window[varName] = elems[i];
        }
        // add to JuiceElem output object
        output[varName] = elems[i];
    }

    return output;
}

