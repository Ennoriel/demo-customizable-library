
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_options(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            option.selected = ~value.indexOf(option.__value);
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Input.svelte generated by Svelte v3.38.2 */

    const file$6 = "src\\Input.svelte";

    function create_fragment$7(ctx) {
    	let input;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "style", /*style*/ ctx[0]);
    			attr_dev(input, "type", "text");
    			input.value = "demo text";
    			attr_dev(input, "class", "svelte-x0gwsc");
    			add_location(input, file$6, 28, 0, 697);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*style*/ 1) {
    				attr_dev(input, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, []);
    	let { style } = $$props;
    	const writable_props = ["style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({ style });

    	$$self.$inject_state = $$props => {
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [style];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { style: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*style*/ ctx[0] === undefined && !("style" in props)) {
    			console.warn("<Input> was created without expected prop 'style'");
    		}
    	}

    	get style() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Card.svelte generated by Svelte v3.38.2 */

    const file$5 = "src\\Card.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-67qp4d");
    			add_location(div, file$5, 11, 0, 291);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\NumberInput.svelte generated by Svelte v3.38.2 */

    const file$4 = "src\\NumberInput.svelte";

    function create_fragment$5(ctx) {
    	let input;
    	let mounted;
    	let dispose;
    	let input_levels = [{ type: "number" }, /*props*/ ctx[1]];
    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$4, 5, 0, 61);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [{ type: "number" }, dirty & /*props*/ 2 && /*props*/ ctx[1]]));

    			if (dirty & /*value*/ 1 && to_number(input.value) !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NumberInput", slots, []);
    	let { props } = $$props;
    	let { value } = $$props;
    	const writable_props = ["props", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NumberInput> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ props, value });

    	$$self.$inject_state = $$props => {
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, props, input_input_handler];
    }

    class NumberInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { props: 1, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NumberInput",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*props*/ ctx[1] === undefined && !("props" in props)) {
    			console.warn("<NumberInput> was created without expected prop 'props'");
    		}

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<NumberInput> was created without expected prop 'value'");
    		}
    	}

    	get props() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ColorInput.svelte generated by Svelte v3.38.2 */

    const file$3 = "src\\ColorInput.svelte";

    function create_fragment$4(ctx) {
    	let input;
    	let mounted;
    	let dispose;
    	let input_levels = [{ type: "color" }, /*props*/ ctx[1]];
    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$3, 5, 0, 61);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [{ type: "color" }, dirty & /*props*/ 2 && /*props*/ ctx[1]]));

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ColorInput", slots, []);
    	let { props } = $$props;
    	let { value } = $$props;
    	const writable_props = ["props", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ColorInput> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ props, value });

    	$$self.$inject_state = $$props => {
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, props, input_input_handler];
    }

    class ColorInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { props: 1, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorInput",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*props*/ ctx[1] === undefined && !("props" in props)) {
    			console.warn("<ColorInput> was created without expected prop 'props'");
    		}

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<ColorInput> was created without expected prop 'value'");
    		}
    	}

    	get props() {
    		throw new Error("<ColorInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<ColorInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ColorInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ColorInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\SelectInput.svelte generated by Svelte v3.38.2 */

    const file$2 = "src\\SelectInput.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (10:1) {#each props.options as option}
    function create_each_block$2(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[3] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[3];
    			option.value = option.__value;
    			add_location(option, file$2, 10, 2, 135);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*props*/ 2 && t_value !== (t_value = /*option*/ ctx[3] + "")) set_data_dev(t, t_value);

    			if (dirty & /*props*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[3])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(10:1) {#each props.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*props*/ ctx[1].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	let select_levels = [/*props*/ ctx[1]];
    	let select_data = {};

    	for (let i = 0; i < select_levels.length; i += 1) {
    		select_data = assign(select_data, select_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_attributes(select, select_data);
    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$2, 5, 0, 61);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			if (select_data.multiple) select_options(select, select_data.value);
    			select_option(select, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*props*/ 2) {
    				each_value = /*props*/ ctx[1].options;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			set_attributes(select, select_data = get_spread_update(select_levels, [dirty & /*props*/ 2 && /*props*/ ctx[1]]));
    			if (dirty & /*props*/ 2 && select_data.multiple) select_options(select, select_data.value);

    			if (dirty & /*value, props*/ 3) {
    				select_option(select, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SelectInput", slots, []);
    	let { props } = $$props;
    	let { value } = $$props;
    	const writable_props = ["props", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectInput> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(0, value);
    		$$invalidate(1, props);
    	}

    	$$self.$$set = $$props => {
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ props, value });

    	$$self.$inject_state = $$props => {
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, props, select_change_handler];
    }

    class SelectInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { props: 1, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectInput",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*props*/ ctx[1] === undefined && !("props" in props)) {
    			console.warn("<SelectInput> was created without expected prop 'props'");
    		}

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<SelectInput> was created without expected prop 'value'");
    		}
    	}

    	get props() {
    		throw new Error("<SelectInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<SelectInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SelectInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\GenericInput.svelte generated by Svelte v3.38.2 */

    // (21:28) 
    function create_if_block_2(ctx) {
    	let selectinput;
    	let updating_value;
    	let current;

    	function selectinput_value_binding(value) {
    		/*selectinput_value_binding*/ ctx[5](value);
    	}

    	let selectinput_props = { props: /*props*/ ctx[2] };

    	if (/*value*/ ctx[0] !== void 0) {
    		selectinput_props.value = /*value*/ ctx[0];
    	}

    	selectinput = new SelectInput({ props: selectinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(selectinput, "value", selectinput_value_binding));

    	const block = {
    		c: function create() {
    			create_component(selectinput.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectinput, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selectinput_changes = {};
    			if (dirty & /*props*/ 4) selectinput_changes.props = /*props*/ ctx[2];

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				selectinput_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			selectinput.$set(selectinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectinput, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(21:28) ",
    		ctx
    	});

    	return block;
    }

    // (16:27) 
    function create_if_block_1(ctx) {
    	let colorinput;
    	let updating_value;
    	let current;

    	function colorinput_value_binding(value) {
    		/*colorinput_value_binding*/ ctx[4](value);
    	}

    	let colorinput_props = { props: /*props*/ ctx[2] };

    	if (/*value*/ ctx[0] !== void 0) {
    		colorinput_props.value = /*value*/ ctx[0];
    	}

    	colorinput = new ColorInput({ props: colorinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(colorinput, "value", colorinput_value_binding));

    	const block = {
    		c: function create() {
    			create_component(colorinput.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(colorinput, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const colorinput_changes = {};
    			if (dirty & /*props*/ 4) colorinput_changes.props = /*props*/ ctx[2];

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				colorinput_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			colorinput.$set(colorinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(colorinput, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(16:27) ",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#if type === "number"}
    function create_if_block$1(ctx) {
    	let numberinput;
    	let updating_value;
    	let current;

    	function numberinput_value_binding(value) {
    		/*numberinput_value_binding*/ ctx[3](value);
    	}

    	let numberinput_props = { props: /*props*/ ctx[2] };

    	if (/*value*/ ctx[0] !== void 0) {
    		numberinput_props.value = /*value*/ ctx[0];
    	}

    	numberinput = new NumberInput({ props: numberinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(numberinput, "value", numberinput_value_binding));

    	const block = {
    		c: function create() {
    			create_component(numberinput.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(numberinput, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const numberinput_changes = {};
    			if (dirty & /*props*/ 4) numberinput_changes.props = /*props*/ ctx[2];

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				numberinput_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			numberinput.$set(numberinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(numberinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(numberinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(numberinput, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:0) {#if type === \\\"number\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[1] === "number") return 0;
    		if (/*type*/ ctx[1] === "color") return 1;
    		if (/*type*/ ctx[1] === "select") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GenericInput", slots, []);
    	let { type } = $$props;
    	let { props } = $$props;
    	let { value } = $$props;
    	const writable_props = ["type", "props", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GenericInput> was created with unknown prop '${key}'`);
    	});

    	function numberinput_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function colorinput_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function selectinput_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		NumberInput,
    		ColorInput,
    		SelectInput,
    		type,
    		props,
    		value
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		type,
    		props,
    		numberinput_value_binding,
    		colorinput_value_binding,
    		selectinput_value_binding
    	];
    }

    class GenericInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { type: 1, props: 2, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GenericInput",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[1] === undefined && !("type" in props)) {
    			console.warn("<GenericInput> was created without expected prop 'type'");
    		}

    		if (/*props*/ ctx[2] === undefined && !("props" in props)) {
    			console.warn("<GenericInput> was created without expected prop 'props'");
    		}

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<GenericInput> was created without expected prop 'value'");
    		}
    	}

    	get type() {
    		throw new Error("<GenericInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<GenericInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get props() {
    		throw new Error("<GenericInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<GenericInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<GenericInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<GenericInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\InputGroup.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\InputGroup.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[4] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (18:0) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*option*/ ctx[0].data;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*option*/ 1) {
    				each_value = /*option*/ ctx[0].data;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(18:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (8:0) {#if option.data.length == 1}
    function create_if_block(ctx) {
    	let label;
    	let t0_value = /*option*/ ctx[0].attr + "";
    	let t0;
    	let t1;
    	let t2_value = (/*option*/ ctx[0].data[0].unit || /*option*/ ctx[0].data[0].indication || "") + "";
    	let t2;
    	let t3;
    	let label_for_value;
    	let t4;
    	let genericinput;
    	let updating_value;
    	let t5;
    	let hr;
    	let current;

    	function genericinput_value_binding(value) {
    		/*genericinput_value_binding*/ ctx[1](value);
    	}

    	let genericinput_props = {
    		type: /*option*/ ctx[0].data[0].type,
    		props: {
    			.../*option*/ ctx[0].data[0],
    			name: /*option*/ ctx[0].attr
    		}
    	};

    	if (/*option*/ ctx[0].data[0].value !== void 0) {
    		genericinput_props.value = /*option*/ ctx[0].data[0].value;
    	}

    	genericinput = new GenericInput({
    			props: genericinput_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(genericinput, "value", genericinput_value_binding));

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			t4 = space();
    			create_component(genericinput.$$.fragment);
    			t5 = space();
    			hr = element("hr");
    			attr_dev(label, "for", label_for_value = /*option*/ ctx[0].attr);
    			add_location(label, file$1, 8, 1, 132);
    			add_location(hr, file$1, 16, 1, 385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			append_dev(label, t3);
    			insert_dev(target, t4, anchor);
    			mount_component(genericinput, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, hr, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*option*/ 1) && t0_value !== (t0_value = /*option*/ ctx[0].attr + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*option*/ 1) && t2_value !== (t2_value = (/*option*/ ctx[0].data[0].unit || /*option*/ ctx[0].data[0].indication || "") + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*option*/ 1 && label_for_value !== (label_for_value = /*option*/ ctx[0].attr)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			const genericinput_changes = {};
    			if (dirty & /*option*/ 1) genericinput_changes.type = /*option*/ ctx[0].data[0].type;

    			if (dirty & /*option*/ 1) genericinput_changes.props = {
    				.../*option*/ ctx[0].data[0],
    				name: /*option*/ ctx[0].attr
    			};

    			if (!updating_value && dirty & /*option*/ 1) {
    				updating_value = true;
    				genericinput_changes.value = /*option*/ ctx[0].data[0].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			genericinput.$set(genericinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(genericinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(genericinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t4);
    			destroy_component(genericinput, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(8:0) {#if option.data.length == 1}",
    		ctx
    	});

    	return block;
    }

    // (19:1) {#each option.data as d}
    function create_each_block$1(ctx) {
    	let label;
    	let t0_value = /*option*/ ctx[0].attr + "";
    	let t0;
    	let t1;
    	let t2_value = /*d*/ ctx[3].attr + "";
    	let t2;
    	let t3;
    	let t4_value = (/*d*/ ctx[3].unit || /*d*/ ctx[3].indication || "") + "";
    	let t4;
    	let t5;
    	let label_for_value;
    	let t6;
    	let genericinput;
    	let updating_value;
    	let t7;
    	let hr;
    	let current;

    	function genericinput_value_binding_1(value) {
    		/*genericinput_value_binding_1*/ ctx[2](value, /*d*/ ctx[3]);
    	}

    	let genericinput_props = {
    		type: /*d*/ ctx[3].type,
    		props: {
    			.../*d*/ ctx[3],
    			name: `${/*option*/ ctx[0].attr}_${/*d*/ ctx[3].attr}`
    		}
    	};

    	if (/*d*/ ctx[3].value !== void 0) {
    		genericinput_props.value = /*d*/ ctx[3].value;
    	}

    	genericinput = new GenericInput({
    			props: genericinput_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(genericinput, "value", genericinput_value_binding_1));

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = text(" (");
    			t4 = text(t4_value);
    			t5 = text(")");
    			t6 = space();
    			create_component(genericinput.$$.fragment);
    			t7 = space();
    			hr = element("hr");
    			attr_dev(label, "for", label_for_value = `${/*option*/ ctx[0].attr}_${/*d*/ ctx[3].attr}`);
    			add_location(label, file$1, 19, 2, 430);
    			add_location(hr, file$1, 27, 2, 664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			append_dev(label, t3);
    			append_dev(label, t4);
    			append_dev(label, t5);
    			insert_dev(target, t6, anchor);
    			mount_component(genericinput, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, hr, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*option*/ 1) && t0_value !== (t0_value = /*option*/ ctx[0].attr + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*option*/ 1) && t2_value !== (t2_value = /*d*/ ctx[3].attr + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*option*/ 1) && t4_value !== (t4_value = (/*d*/ ctx[3].unit || /*d*/ ctx[3].indication || "") + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*option*/ 1 && label_for_value !== (label_for_value = `${/*option*/ ctx[0].attr}_${/*d*/ ctx[3].attr}`)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			const genericinput_changes = {};
    			if (dirty & /*option*/ 1) genericinput_changes.type = /*d*/ ctx[3].type;

    			if (dirty & /*option*/ 1) genericinput_changes.props = {
    				.../*d*/ ctx[3],
    				name: `${/*option*/ ctx[0].attr}_${/*d*/ ctx[3].attr}`
    			};

    			if (!updating_value && dirty & /*option*/ 1) {
    				updating_value = true;
    				genericinput_changes.value = /*d*/ ctx[3].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			genericinput.$set(genericinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(genericinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(genericinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t6);
    			destroy_component(genericinput, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(19:1) {#each option.data as d}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*option*/ ctx[0].data.length == 1) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputGroup", slots, []);
    	let { option } = $$props;
    	const writable_props = ["option"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputGroup> was created with unknown prop '${key}'`);
    	});

    	function genericinput_value_binding(value) {
    		if ($$self.$$.not_equal(option.data[0].value, value)) {
    			option.data[0].value = value;
    			$$invalidate(0, option);
    		}
    	}

    	function genericinput_value_binding_1(value, d) {
    		if ($$self.$$.not_equal(d.value, value)) {
    			d.value = value;
    			$$invalidate(0, option);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ("option" in $$props) $$invalidate(0, option = $$props.option);
    	};

    	$$self.$capture_state = () => ({ GenericInput, option });

    	$$self.$inject_state = $$props => {
    		if ("option" in $$props) $$invalidate(0, option = $$props.option);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [option, genericinput_value_binding, genericinput_value_binding_1];
    }

    class InputGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { option: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputGroup",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*option*/ ctx[0] === undefined && !("option" in props)) {
    			console.warn("<InputGroup> was created without expected prop 'option'");
    		}
    	}

    	get option() {
    		throw new Error("<InputGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set option(value) {
    		throw new Error("<InputGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var inputOptions = [
    		
    		/*{
    			attr: "background-color",
    			data: [
    				{
    					type: "color",
    					value: "#33ff33",
    				}
    			]
    		},
    		{
    			attr: "color",
    			data: [
    				{
    					type: "color",
    					value: "#33ffff",
    				}
    			]
    		},
    		{
    			attr: "border",
    			data: [
    				{
    					attr: "thickness",
    					type: "number",
    					min: 0,
    					max: 5,
    					step: 1,
    					unit: "px",
    					value: 1,
    				},
    				{
    					attr: "format",
    					type: "select",
    					options: ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"],
    					value: "solid",
    				},
    				{
    					attr: "color",
    					type: "color",
    					value: "#ff3333",
    				}
    			]
    		}*/
    		{
    			attr: "border-width",
    			data: [
    				{
    					type: "number",
    					min: 0,
    					max: 5,
    					step: 1,
    					unit: "px",
    					value: 1,
    				}
    			]
    		},
    		{
    			attr: "border-style",
    			data: [
    				{
    					type: "select",
    					options: ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"],
    					value: "solid",
    				}
    			]
    		}
    	];

    var mainOptions = [
    	{
    		attr: "font-size",
    		data: [
    			{
    				type: "number",
    				min: 12,
    				max: 24,
    				unit: "px",
    				step: 1,
    				value: 16,
    			}
    		]
    	},
    	{
    		attr: "size",
    		data: [
    			{
    				type: "number",
    				indication: "base unit (8px) multiplier",
    				min: 2,
    				max: 5,
    				step: 1,
    				value: 3,
    			}
    		]
    	},
    	{
    		attr: "border-radius",
    		data: [
    			{
    				type: "number",
    				min: 0,
    				max: 1,
    				step: 0.05,
    				unit: "em",
    				value: 0.2,
    			}
    		]
    	},
    	{
    		attr: "text-color",
    		data: [
    			{
    				type: "color",
    				value: "#333333",
    			}
    		]
    	},
    	{
    		attr: "primary-color",
    		data: [
    			{
    				type: "color",
    				value: "#8f7cea",
    			}
    		]
    	}
    ];

    const hexToDec = hex => parseInt(hex, 16);

    const decToHex = dec => Math.round(dec).toString(16).padStart(2, '0');

    const getDarkShade = (r, g, b, i) => `${decToHex(i * r)}${decToHex(i * g)}${decToHex(i * b)}`;
    const getLightShade = (r, g, b, i) => `${decToHex(r + (255 - r) * i)}${decToHex(g + (255 - g) * i)}${decToHex(b + (255 - b) * i)}`;

    const getShades = (hex, name, occ=5) => {
    	console.log('!!');
    	// 5 occ from 0.1 to 1
    	let r = hexToDec(hex.substring(1, 3));
    	let g = hexToDec(hex.substring(3, 5));
    	let b = hexToDec(hex.substring(5, 7));
    	return Array.from(Array(occ)).map((_, i) => i * 0.9 / (occ - 1) + 0.05)
    								 .reverse()
    	               .reduce((acc, fact, i) => `${acc} --${name}-d${i}: #${getDarkShade(r, g, b, fact)};--${name}-l${i}: #${getLightShade(r, g, b, 1 - fact /* varies between 0 and 0.9 */)};`, "")
    };

    var colorUtils = {hexToDec, decToHex, getDarkShade, getShades};

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[7] = list;
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (34:1) <Card>
    function create_default_slot(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: { style: /*style*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty & /*style*/ 4) input_changes.style = /*style*/ ctx[2];
    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(34:1) <Card>",
    		ctx
    	});

    	return block;
    }

    // (41:1) {#each mainOptions as option}
    function create_each_block_1(ctx) {
    	let inputgroup;
    	let updating_option;
    	let current;

    	function inputgroup_option_binding(value) {
    		/*inputgroup_option_binding*/ ctx[4](value, /*option*/ ctx[6], /*each_value_1*/ ctx[9], /*option_index_1*/ ctx[10]);
    	}

    	let inputgroup_props = {};

    	if (/*option*/ ctx[6] !== void 0) {
    		inputgroup_props.option = /*option*/ ctx[6];
    	}

    	inputgroup = new InputGroup({ props: inputgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(inputgroup, "option", inputgroup_option_binding));

    	const block = {
    		c: function create() {
    			create_component(inputgroup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(inputgroup, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const inputgroup_changes = {};

    			if (!updating_option && dirty & /*mainOptions*/ 2) {
    				updating_option = true;
    				inputgroup_changes.option = /*option*/ ctx[6];
    				add_flush_callback(() => updating_option = false);
    			}

    			inputgroup.$set(inputgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(inputgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(41:1) {#each mainOptions as option}",
    		ctx
    	});

    	return block;
    }

    // (47:1) {#each inputOptions as option}
    function create_each_block(ctx) {
    	let inputgroup;
    	let updating_option;
    	let current;

    	function inputgroup_option_binding_1(value) {
    		/*inputgroup_option_binding_1*/ ctx[5](value, /*option*/ ctx[6], /*each_value*/ ctx[7], /*option_index*/ ctx[8]);
    	}

    	let inputgroup_props = {};

    	if (/*option*/ ctx[6] !== void 0) {
    		inputgroup_props.option = /*option*/ ctx[6];
    	}

    	inputgroup = new InputGroup({ props: inputgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(inputgroup, "option", inputgroup_option_binding_1));

    	const block = {
    		c: function create() {
    			create_component(inputgroup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(inputgroup, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const inputgroup_changes = {};

    			if (!updating_option && dirty & /*inputOptions*/ 1) {
    				updating_option = true;
    				inputgroup_changes.option = /*option*/ ctx[6];
    				add_flush_callback(() => updating_option = false);
    			}

    			inputgroup.$set(inputgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(inputgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(47:1) {#each inputOptions as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let body;
    	let card;
    	let t0;
    	let hr0;
    	let t1;
    	let t2;
    	let hr1;
    	let t3;
    	let each1_anchor;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*mainOptions*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*inputOptions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			body = element("body");
    			create_component(card.$$.fragment);
    			t0 = space();
    			hr0 = element("hr");
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			hr1 = element("hr");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    			attr_dev(body, "style", /*mainTheme*/ ctx[3]);
    			attr_dev(body, "class", "svelte-17hr2w5");
    			add_location(body, file, 32, 0, 993);
    			add_location(hr0, file, 38, 1, 1070);
    			add_location(hr1, file, 44, 1, 1153);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			mount_component(card, body, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(target, anchor);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope, style*/ 2052) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);

    			if (!current || dirty & /*mainTheme*/ 8) {
    				attr_dev(body, "style", /*mainTheme*/ ctx[3]);
    			}

    			if (dirty & /*mainOptions*/ 2) {
    				each_value_1 = /*mainOptions*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(t2.parentNode, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*inputOptions*/ 1) {
    				each_value = /*inputOptions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(card);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let style;
    	let mainTheme;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function inputgroup_option_binding(value, option, each_value_1, option_index_1) {
    		each_value_1[option_index_1] = value;
    		$$invalidate(1, mainOptions);
    	}

    	function inputgroup_option_binding_1(value, option, each_value, option_index) {
    		each_value[option_index] = value;
    		$$invalidate(0, inputOptions);
    	}

    	$$self.$capture_state = () => ({
    		Input,
    		Card,
    		InputGroup,
    		inputOptions,
    		mainOptions,
    		colorUtils,
    		style,
    		mainTheme
    	});

    	$$self.$inject_state = $$props => {
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("mainTheme" in $$props) $$invalidate(3, mainTheme = $$props.mainTheme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*inputOptions*/ 1) {
    			$$invalidate(2, style = inputOptions.reduce(
    				(acc, option) => {
    					let value = option.data.reduce((acc, d) => `${acc} ${d.value}${d.unit || ""} `, "");
    					return `${acc}${option.attr}: ${value};`;
    				},
    				""
    			));
    		}

    		if ($$self.$$.dirty & /*mainOptions*/ 2) {
    			$$invalidate(3, mainTheme = mainOptions.reduce(
    				(acc, option) => {
    					if (option.data.length === 1 && option.data[0].type === "color") {
    						return `${acc}${colorUtils.getShades(option.data[0].value, option.attr)};`;
    					} else {
    						let value = option.data.reduce((acc, d) => `${acc} ${d.value}${d.unit || ""} `, "");
    						return `${acc}--${option.attr}: ${value};`;
    					}
    				},
    				""
    			));
    		}
    	};

    	return [
    		inputOptions,
    		mainOptions,
    		style,
    		mainTheme,
    		inputgroup_option_binding,
    		inputgroup_option_binding_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
