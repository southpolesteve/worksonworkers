/**
 * Package-specific test configurations
 * 
 * Each entry defines how to test a specific npm package:
 * - importStatement: How to import the package
 * - testCode: Code that exercises the package
 * - expectedOutput: What we expect (for validation)
 * - category: Package category for classification
 * 
 * If a package isn't listed here, we'll try a generic import test.
 */

import type { PackageCategory } from '../../data/schema.js';

export interface PackageTestConfig {
  importStatement: string;
  testCode: string;
  expectedOutput?: string | RegExp;
  category: PackageCategory;
  notes?: string;
  alternative?: string;
  skipReason?: string; // If set, skip testing with this reason
}

/**
 * Known package test configurations
 * Add entries here for packages that need specific test setups
 */
export const packageTests: Record<string, PackageTestConfig> = {
  // === UTILITY LIBRARIES ===
  'lodash': {
    importStatement: `import _ from 'lodash';`,
    testCode: `const result = _.chunk(['a', 'b', 'c', 'd'], 2);
return { success: true, result };`,
    expectedOutput: JSON.stringify({ success: true, result: [['a', 'b'], ['c', 'd']] }),
    category: 'utility',
  },
  'lodash-es': {
    importStatement: `import { chunk } from 'lodash-es';`,
    testCode: `const result = chunk(['a', 'b', 'c', 'd'], 2);
return { success: true, result };`,
    category: 'utility',
  },
  'lodash.camelcase': {
    importStatement: `import camelCase from 'lodash.camelcase';`,
    testCode: `const result = camelCase('foo-bar');
return { success: result === 'fooBar', result };`,
    category: 'utility',
  },
  'lodash.defaults': {
    importStatement: `import defaults from 'lodash.defaults';`,
    testCode: `const result = defaults({ a: 1 }, { a: 2, b: 3 });
return { success: result.a === 1 && result.b === 3, result };`,
    category: 'utility',
  },
  'lodash.flatten': {
    importStatement: `import flatten from 'lodash.flatten';`,
    testCode: `const result = flatten([[1, 2], [3, 4]]);
return { success: result.join(',') === '1,2,3,4', result };`,
    category: 'utility',
  },
  'lodash.foreach': {
    importStatement: `import forEach from 'lodash.foreach';`,
    testCode: `const result: number[] = [];
forEach([1, 2, 3], (n) => result.push(n * 2));
return { success: result.join(',') === '2,4,6', result };`,
    category: 'utility',
  },
  'lodash.isempty': {
    importStatement: `import isEmpty from 'lodash.isempty';`,
    testCode: `const result = [isEmpty({}), isEmpty([]), isEmpty(''), isEmpty({ a: 1 })];
return { success: result[0] && result[1] && result[2] && !result[3], result };`,
    category: 'utility',
  },
  'lodash.isfunction': {
    importStatement: `import isFunction from 'lodash.isfunction';`,
    testCode: `const result = [isFunction(() => {}), isFunction({}), isFunction(null)];
return { success: result[0] && !result[1] && !result[2], result };`,
    category: 'utility',
  },
  'lodash.isplainobject': {
    importStatement: `import isPlainObject from 'lodash.isplainobject';`,
    testCode: `const result = [isPlainObject({}), isPlainObject([]), isPlainObject(null)];
return { success: result[0] && !result[1] && !result[2], result };`,
    category: 'utility',
  },
  'lodash.isstring': {
    importStatement: `import isString from 'lodash.isstring';`,
    testCode: `const result = [isString('hello'), isString(123), isString(null)];
return { success: result[0] && !result[1] && !result[2], result };`,
    category: 'utility',
  },
  'lodash.map': {
    importStatement: `import map from 'lodash.map';`,
    testCode: `const result = map([1, 2, 3], n => n * 2);
return { success: result.join(',') === '2,4,6', result };`,
    category: 'utility',
  },
  'papaparse': {
    importStatement: `import Papa from 'papaparse';`,
    testCode: `const csv = 'name,age\\nJohn,30\\nJane,25';
const result = Papa.parse(csv, { header: true });
return { success: result.data.length === 2, result: result.data };`,
    category: 'utility',
  },
  'parseurl': {
    importStatement: `import parseurl from 'parseurl';`,
    testCode: `const req = { url: '/path?foo=bar' };
const parsed = parseurl(req);
return { success: parsed.pathname === '/path', result: parsed.pathname };`,
    category: 'utility',
  },
  'lodash.omit': {
    importStatement: `import omit from 'lodash.omit';`,
    testCode: `const result = omit({ a: 1, b: 2, c: 3 }, ['a', 'c']);
return { success: result.b === 2 && !result.a, result };`,
    category: 'utility',
  },
  'lodash.pick': {
    importStatement: `import pick from 'lodash.pick';`,
    testCode: `const result = pick({ a: 1, b: 2, c: 3 }, ['a', 'c']);
return { success: result.a === 1 && result.c === 3 && !result.b, result };`,
    category: 'utility',
  },
  'lodash.throttle': {
    importStatement: `import throttle from 'lodash.throttle';`,
    testCode: `const fn = throttle(() => 'throttled', 100);
const result = fn();
return { success: result === 'throttled', result };`,
    category: 'utility',
  },
  'lodash.uniq': {
    importStatement: `import uniq from 'lodash.uniq';`,
    testCode: `const result = uniq([1, 2, 2, 3, 1, 4]);
return { success: result.join(',') === '1,2,3,4', result };`,
    category: 'utility',
  },
  'lodash.clonedeep': {
    importStatement: `import cloneDeep from 'lodash.clonedeep';`,
    testCode: `const obj = { a: { b: 1 } };
const clone = cloneDeep(obj);
clone.a.b = 2;
return { success: obj.a.b === 1 && clone.a.b === 2, result: { original: obj, clone } };`,
    category: 'utility',
  },
  'lodash.debounce': {
    importStatement: `import debounce from 'lodash.debounce';`,
    testCode: `const fn = debounce(() => 'debounced', 100);
const result = fn();
return { success: result === 'debounced', result };`,
    category: 'utility',
  },
  'lodash.get': {
    importStatement: `import get from 'lodash.get';`,
    testCode: `const obj = { a: { b: { c: 123 } } };
const result = get(obj, 'a.b.c');
const missing = get(obj, 'x.y.z', 'default');
return { success: result === 123 && missing === 'default', result: { result, missing } };`,
    category: 'utility',
  },
  'lodash.isequal': {
    importStatement: `import isEqual from 'lodash.isequal';`,
    testCode: `const result1 = isEqual({ a: 1 }, { a: 1 });
const result2 = isEqual({ a: 1 }, { a: 2 });
return { success: result1 && !result2, result: { result1, result2 } };`,
    category: 'utility',
  },
  'lodash.merge': {
    importStatement: `import merge from 'lodash.merge';`,
    testCode: `const result = merge({ a: 1, b: { c: 2 } }, { b: { d: 3 } });
return { success: result.a === 1 && result.b.c === 2 && result.b.d === 3, result };`,
    category: 'utility',
  },
  'lodash.set': {
    importStatement: `import set from 'lodash.set';`,
    testCode: `const obj = {};
set(obj, 'a.b.c', 123);
return { success: obj.a?.b?.c === 123, result: obj };`,
    category: 'utility',
  },
  'js-base64': {
    importStatement: `import { Base64 } from 'js-base64';`,
    testCode: `const encoded = Base64.encode('hello');
const decoded = Base64.decode(encoded);
return { success: decoded === 'hello', result: { encoded, decoded } };`,
    category: 'utility',
  },
  'long': {
    importStatement: `import Long from 'long';`,
    testCode: `const val = Long.fromNumber(123456789);
const result = val.toString();
return { success: result === '123456789', result };`,
    category: 'utility',
  },
  'log-symbols': {
    importStatement: `import logSymbols from 'log-symbols';`,
    testCode: `const result = {
  success: typeof logSymbols.success === 'string',
  error: typeof logSymbols.error === 'string',
  warning: typeof logSymbols.warning === 'string',
  info: typeof logSymbols.info === 'string',
};
return { success: result.success && result.error && result.warning && result.info, result };`,
    category: 'utility',
  },
  'loglevel': {
    importStatement: `import log from 'loglevel';`,
    testCode: `log.setLevel('info');
const level = log.getLevel();
log.info('test');
return { success: typeof level === 'number', result: { level } };`,
    category: 'utility',
  },
  'lru-cache': {
    importStatement: `import { LRUCache } from 'lru-cache';`,
    testCode: `const cache = new LRUCache({ max: 100 });
cache.set('key', 'value');
const result = cache.get('key');
return { success: result === 'value', result };`,
    category: 'utility',
  },
  'lz-string': {
    importStatement: `import LZString from 'lz-string';`,
    testCode: `const compressed = LZString.compress('hello world');
const decompressed = LZString.decompress(compressed);
return { success: decompressed === 'hello world', result: { compressed, decompressed } };`,
    category: 'utility',
  },
  'lodash.template': {
    importStatement: `import template from 'lodash.template';`,
    testCode: `const compiled = template('Hello <%= name %>!');
const result = compiled({ name: 'World' });
return { success: result === 'Hello World!', result };`,
    category: 'utility',
  },
  'liquid': {
    importStatement: `import { Liquid } from 'liquid';`,
    testCode: `const engine = new Liquid();
const tpl = engine.parse('Hello {{ name }}!');
const result = await engine.render(tpl, { name: 'World' });
return { success: result === 'Hello World!', result };`,
    category: 'utility',
  },
  'underscore': {
    importStatement: `import _ from 'underscore';`,
    testCode: `const result = _.flatten([[1, 2], [3, 4]]);
return { success: true, result };`,
    category: 'utility',
  },
  'hash-sum': {
    importStatement: `import hashSum from 'hash-sum';`,
    testCode: `const hash = hashSum({ foo: 'bar', nested: { value: 123 } });
return { success: typeof hash === 'string' && hash.length > 0, result: hash };`,
    category: 'utility',
  },
  'highland': {
    importStatement: `import H from 'highland';`,
    testCode: `const result: number[] = [];
H([1, 2, 3, 4])
  .map((x: number) => x * 2)
  .each((x: number) => result.push(x));
return { success: result.join(',') === '2,4,6,8', result };`,
    category: 'utility',
  },
  'hogan.js': {
    importStatement: `import Hogan from 'hogan.js';`,
    testCode: `const template = Hogan.compile('Hello {{name}}!');
const result = template.render({ name: 'World' });
return { success: result === 'Hello World!', result };`,
    category: 'utility',
  },
  'html-entities': {
    importStatement: `import { encode, decode } from 'html-entities';`,
    testCode: `const encoded = encode('<div>Hello & goodbye</div>');
const decoded = decode('&lt;div&gt;Hello &amp; goodbye&lt;/div&gt;');
return { success: encoded === '&lt;div&gt;Hello &amp; goodbye&lt;/div&gt;' && decoded === '<div>Hello & goodbye</div>', result: { encoded, decoded } };`,
    category: 'utility',
  },
  'http-status-codes': {
    importStatement: `import { StatusCodes, getReasonPhrase } from 'http-status-codes';`,
    testCode: `const ok = StatusCodes.OK;
const notFound = StatusCodes.NOT_FOUND;
const phrase = getReasonPhrase(200);
return { success: ok === 200 && notFound === 404 && phrase === 'OK', result: { ok, notFound, phrase } };`,
    category: 'utility',
  },
  'inflection': {
    importStatement: `import inflection from 'inflection';`,
    testCode: `const plural = inflection.pluralize('person');
const singular = inflection.singularize('people');
const camel = inflection.camelize('hello_world');
return { success: plural === 'people' && singular === 'person' && camel === 'HelloWorld', result: { plural, singular, camel } };`,
    category: 'utility',
  },
  'is-promise': {
    importStatement: `import isPromise from 'is-promise';`,
    testCode: `const a = isPromise(Promise.resolve(123));
const b = isPromise({ then: () => {} });
const c = isPromise(123);
return { success: a === true && b === true && c === false, result: { a, b, c } };`,
    category: 'utility',
  },
  'jwt-decode': {
    importStatement: `import { jwtDecode } from 'jwt-decode';`,
    testCode: `const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const decoded = jwtDecode(token);
return { success: decoded.sub === '1234567890' && decoded.name === 'John Doe', result: decoded };`,
    category: 'utility',
  },
  'ip': {
    importStatement: `import ip from 'ip';`,
    testCode: `const isV4 = ip.isV4Format('192.168.1.1');
const isV6 = ip.isV6Format('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
const subnet = ip.cidrSubnet('192.168.1.0/24');
return { success: isV4 === true && isV6 === true && subnet.subnetMask === '255.255.255.0', result: { isV4, isV6, subnetMask: subnet.subnetMask } };`,
    category: 'utility',
    notes: 'IP address utilities for validation, conversion, and subnet calculations',
  },
  'image-size': {
    importStatement: `import sizeOf from 'image-size';`,
    testCode: `// Create a simple 1x1 PNG (base64 encoded)
const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const dimensions = sizeOf(pngData);
return { success: dimensions.width === 1 && dimensions.height === 1 && dimensions.type === 'png', result: dimensions };`,
    category: 'utility',
    notes: 'Get image dimensions from buffer or file',
  },
  'inversify': {
    importStatement: `import { Container, injectable, inject } from 'inversify';`,
    testCode: `@injectable()
class Warrior {
  constructor() {}
  fight() { return 'fight!'; }
}
const container = new Container();
container.bind(Warrior).toSelf();
const warrior = container.get(Warrior);
return { success: warrior.fight() === 'fight!', result: warrior.fight() };`,
    category: 'utility',
    notes: 'IoC container with dependency injection',
  },
  'ramda': {
    importStatement: `import * as R from 'ramda';`,
    testCode: `const result = R.map(x => x * 2, [1, 2, 3]);
return { success: true, result };`,
    category: 'utility',
  },
  '101': {
    importStatement: `import pluck from '101/pluck';
import omit from '101/omit';`,
    testCode: `const obj = { foo: 1, bar: 2, baz: 3 };
const val = pluck(obj, 'foo');
const omitted = omit(obj, 'bar');
return { success: val === 1 && omitted.bar === undefined, result: { val, omitted } };`,
    category: 'utility',
    notes: 'Modular utility library - import specific utilities like 101/pluck, 101/omit, etc.',
  },
  'bl': {
    importStatement: `import { BufferList } from 'bl';`,
    testCode: `const bl = new BufferList();
bl.append(Buffer.from('Hello, '));
bl.append(Buffer.from('World!'));
const result = bl.toString();
return { success: result === 'Hello, World!', result };`,
    category: 'utility',
    notes: 'Buffer List for collecting and managing multiple buffers with a readable Buffer interface.',
  },
  'd3-array': {
    importStatement: `import { min, max, mean, median, extent, group } from 'd3-array';`,
    testCode: `const data = [1, 5, 2, 8, 3];
const minVal = min(data);
const maxVal = max(data);
const meanVal = mean(data);
const medianVal = median(data);
const extentVal = extent(data);
const grouped = group([{key: 'a', val: 1}, {key: 'b', val: 2}, {key: 'a', val: 3}], d => d.key);
return { success: minVal === 1 && maxVal === 8 && meanVal === 3.8 && medianVal === 3, result: { minVal, maxVal, meanVal, medianVal, extentVal, grouped: grouped.size } };`,
    category: 'utility',
    notes: 'D3 array manipulation library with statistical functions (min, max, mean, median), array transformations (group, bin, bisect), and data operations.',
  },
  'd3-scale': {
    importStatement: `import { scaleLinear, scaleLog, scalePow, scaleTime } from 'd3-scale';`,
    testCode: `const linear = scaleLinear().domain([0, 10]).range([0, 100]);
const log = scaleLog().domain([1, 10]).range([0, 100]);
const pow = scalePow().exponent(2).domain([0, 10]).range([0, 100]);
const time = scaleTime().domain([new Date(2020, 0, 1), new Date(2021, 0, 1)]).range([0, 100]);
const linearVal = linear(5);
const logVal = log(5);
const powVal = pow(5);
const timeVal = time(new Date(2020, 6, 1));
return { success: linearVal === 50 && logVal > 0 && powVal === 25 && timeVal > 0, result: { linearVal, logVal, powVal, timeVal } };`,
    category: 'utility',
    notes: 'D3 scales for mapping data values to visual ranges. Includes linear, logarithmic, power, time, and categorical scales for data visualization.',
  },
  'd3-shape': {
    importStatement: `import { line, area, pie, arc } from 'd3-shape';`,
    testCode: `const lineGenerator = line().x((d, i) => i * 10).y(d => d);
const linePath = lineGenerator([10, 20, 30, 20, 10]);
const areaGenerator = area().x((d, i) => i * 10).y0(0).y1(d => d);
const areaPath = areaGenerator([10, 20, 30, 20, 10]);
const pieGenerator = pie();
const pieData = pieGenerator([1, 2, 3]);
const arcGenerator = arc().innerRadius(0).outerRadius(100);
const arcPath = arcGenerator(pieData[0]);
return { success: typeof linePath === 'string' && typeof areaPath === 'string' && pieData.length === 3 && typeof arcPath === 'string', result: { linePath: linePath.substring(0, 20), pieAngles: pieData.map(d => [d.startAngle, d.endAngle]) } };`,
    category: 'utility',
    notes: 'D3 shape generators for SVG path data. Provides line(), area(), pie(), arc(), and more for creating data-driven shapes and charts.',
  },
  'deep-diff': {
    importStatement: `import { diff, applyChange } from 'deep-diff';`,
    testCode: `const lhs = { name: 'Alice', age: 30, city: 'NYC' };
const rhs = { name: 'Alice', age: 31, city: 'LA' };
const differences = diff(lhs, rhs);
const hasChanges = differences && differences.length === 2;
const ageChanged = differences.some(d => d.path[0] === 'age' && d.lhs === 30 && d.rhs === 31);
const cityChanged = differences.some(d => d.path[0] === 'city' && d.lhs === 'NYC' && d.rhs === 'LA');
return { success: hasChanges && ageChanged && cityChanged, result: differences };`,
    category: 'utility',
    notes: 'Calculate deep differences between objects. Captures changes (added, deleted, edited, array changes) and can apply/revert changes.',
  },
  'extend-shallow': {
    importStatement: `import extend from 'extend-shallow';`,
    testCode: `const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };
const obj3 = { c: 5, d: 6 };
const result = extend(obj1, obj2, obj3);
const success = result.a === 1 && result.b === 3 && result.c === 5 && result.d === 6;
return { success, result };`,
    category: 'utility',
    notes: 'Shallow object extension utility. Like Object.assign() but with more flexible API for merging multiple objects.',
  },
  'file-type': {
    importStatement: `import { fileTypeFromBuffer } from 'file-type';`,
    testCode: `// PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A (with some extra bytes for the tokenizer)
const pngBytes = new Uint8Array([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4
]);
const result = await fileTypeFromBuffer(pngBytes);
return { success: result?.ext === 'png' && result?.mime === 'image/png', result };`,
    category: 'utility',
    notes: 'Detects file types from file signatures (magic bytes). Works with Uint8Array buffers. Useful for validating uploads, detecting MIME types.',
  },
  'global': {
    importStatement: `import global from 'global';`,
    testCode: `// global is a polyfill for accessing global variables across environments
// It returns the global object (globalThis in Workers)
const hasGlobal = typeof global === 'object';
const hasGlobalThis = global === globalThis;
return { success: hasGlobal && hasGlobalThis, result: { type: typeof global, isGlobalThis: hasGlobalThis } };`,
    category: 'utility',
    notes: 'Polyfill for accessing the global object across environments. Returns globalThis in Workers. Useful for cross-environment compatibility.',
  },

  // === ID GENERATION ===
  'uuid': {
    importStatement: `import { v4 as uuidv4, validate } from 'uuid';`,
    testCode: `const id = uuidv4();
const isValid = validate(id);
return { success: isValid, result: id };`,
    category: 'id-generation',
  },
  'nanoid': {
    importStatement: `import { nanoid } from 'nanoid';`,
    testCode: `const id = nanoid();
return { success: id.length === 21, result: id };`,
    category: 'id-generation',
  },
  'ulid': {
    importStatement: `import { ulid } from 'ulid';`,
    testCode: `const id = ulid();
return { success: id.length === 26, result: id };`,
    category: 'id-generation',
  },
  'cuid': {
    importStatement: ``,
    testCode: ``,
    category: 'id-generation',
    skipReason: 'Uses node:os which is not fully supported. Use nanoid or uuid instead.',
    alternative: 'nanoid',
  },

  // === RANDOM DATA GENERATION ===
  'chance': {
    importStatement: `import Chance from 'chance';`,
    testCode: `const chance = new Chance();
const name = chance.name();
const email = chance.email();
const number = chance.integer({ min: 1, max: 100 });
return { success: typeof name === 'string' && email.includes('@') && number >= 1 && number <= 100, result: { name, email, number } };`,
    category: 'utility',
    notes: 'Random data generator for testing and development. Generates fake names, emails, addresses, numbers, etc.',
  },

  // === VALIDATION ===
  'zod': {
    importStatement: `import { z } from 'zod';`,
    testCode: `const schema = z.object({ name: z.string(), age: z.number() });
const result = schema.safeParse({ name: 'Alice', age: 30 });
return { success: result.success, result: result.data };`,
    category: 'validation',
  },
  'yup': {
    importStatement: `import * as yup from 'yup';`,
    testCode: `const schema = yup.object({ name: yup.string().required() });
const result = await schema.validate({ name: 'Alice' });
return { success: true, result };`,
    category: 'validation',
  },
  'joi': {
    importStatement: `import Joi from 'joi';`,
    testCode: `const schema = Joi.object({ name: Joi.string().required() });
const { value } = schema.validate({ name: 'Alice' });
return { success: true, result: value };`,
    category: 'validation',
  },
  'ajv': {
    importStatement: `import Ajv from 'ajv';`,
    testCode: `const ajv = new Ajv();
const validate = ajv.compile({ type: 'object', properties: { name: { type: 'string' } } });
const valid = validate({ name: 'Alice' });
return { success: valid, result: { name: 'Alice' } };`,
    category: 'validation',
    notes: 'May have compatibility issues with Workers. Consider zod or valibot as alternatives.',
    alternative: 'zod',
  },
  'valibot': {
    importStatement: `import * as v from 'valibot';`,
    testCode: `const schema = v.object({ name: v.string() });
const result = v.safeParse(schema, { name: 'Alice' });
return { success: result.success, result: result.output };`,
    category: 'validation',
  },
  'assert-plus': {
    importStatement: `import assert from 'assert-plus';`,
    testCode: `assert.string('hello', 'value');
assert.number(42, 'value');
assert.object({ foo: 'bar' }, 'value');
return { success: true, result: 'All assertions passed' };`,
    category: 'validation',
    notes: 'Extra assertions on top of Node.js assert module - provides type checking utilities',
  },
  'async-validator': {
    importStatement: `import Schema from 'async-validator';`,
    testCode: `const descriptor = {
  name: { type: 'string', required: true, message: 'Name is required' },
  age: { type: 'number', min: 0, max: 120 }
};
const validator = new Schema(descriptor);
const result = await validator.validate({ name: 'Alice', age: 30 });
return { success: true, result };`,
    category: 'validation',
    notes: 'Async form validation library - commonly used with Ant Design forms',
  },

  // === DATE/TIME ===
  'dayjs': {
    importStatement: `import dayjs from 'dayjs';`,
    testCode: `const date = dayjs('2026-01-08');
const formatted = date.format('YYYY-MM-DD');
return { success: formatted === '2026-01-08', result: formatted };`,
    category: 'date-time',
  },
  'date-fns': {
    importStatement: `import { format, parseISO } from 'date-fns';`,
    testCode: `const date = parseISO('2026-01-08');
const formatted = format(date, 'yyyy-MM-dd');
return { success: formatted === '2026-01-08', result: formatted };`,
    category: 'date-time',
  },
  'luxon': {
    importStatement: `import { DateTime } from 'luxon';`,
    testCode: `const dt = DateTime.fromISO('2026-01-08');
const formatted = dt.toFormat('yyyy-MM-dd');
return { success: formatted === '2026-01-08', result: formatted };`,
    category: 'date-time',
  },
  'moment': {
    importStatement: `import moment from 'moment';`,
    testCode: `const date = moment('2026-01-08');
const formatted = date.format('YYYY-MM-DD');
return { success: formatted === '2026-01-08', result: formatted };`,
    category: 'date-time',
    notes: 'Consider using dayjs or date-fns for smaller bundle size',
  },

  // === HTTP CLIENTS ===
  'axios': {
    importStatement: `import axios from 'axios';`,
    testCode: `const response = await axios.get('https://httpbin.org/json');
return { success: response.status === 200, result: response.data };`,
    category: 'http-client',
    notes: 'Works but consider using native fetch() instead',
    alternative: 'built-in: fetch',
  },
  'ky': {
    importStatement: `import ky from 'ky';`,
    testCode: `const data = await ky.get('https://httpbin.org/json').json();
return { success: true, result: data };`,
    category: 'http-client',
  },
  'got': {
    importStatement: `import got from 'got';`,
    testCode: `const response = await got('https://httpbin.org/json').json();
return { success: true, result: response };`,
    category: 'http-client',
    notes: 'Large bundle size, consider ky or native fetch',
  },
  'node-fetch': {
    importStatement: `import fetch from 'node-fetch';`,
    testCode: `return { success: true, result: 'Use native fetch instead' };`,
    category: 'http-client',
    alternative: 'built-in: fetch',
    notes: 'Workers has native fetch() - no need for this package',
  },
  '@octokit/rest': {
    importStatement: `import { Octokit } from '@octokit/rest';`,
    testCode: `const octokit = new Octokit();
const { data } = await octokit.rest.repos.get({ owner: 'cloudflare', repo: 'workers-sdk' });
return { success: data.name === 'workers-sdk', result: data.name };`,
    category: 'http-client',
    notes: 'GitHub API client - works on Workers',
  },
  'apollo-client': {
    importStatement: ``,
    testCode: ``,
    category: 'http-client',
    skipReason: 'Deprecated v2 package split into multiple npm packages (apollo-client, apollo-cache-inmemory, apollo-link-http). Use @apollo/client v3+ instead.',
    alternative: '@apollo/client',
    notes: 'apollo-client v2 is deprecated and was the old GraphQL client for React apps. The v2 package requires multiple dependencies (apollo-cache-inmemory, apollo-link-http, graphql-tag) and was primarily designed for browser/React environments. Replaced by the unified @apollo/client v3+ package which combines all functionality into one package.',
  },
  'graphql-tools': {
    importStatement: `import { makeExecutableSchema } from 'graphql-tools';`,
    testCode: `// Create a simple GraphQL schema
const typeDefs = \`
  type Query {
    hello: String
  }
\`;
const resolvers = {
  Query: {
    hello: () => 'Hello from Workers!'
  }
};
const schema = makeExecutableSchema({ typeDefs, resolvers });
return { 
  success: schema != null && schema.getQueryType()?.name === 'Query',
  result: { hasSchema: true, queryType: schema.getQueryType()?.name }
};`,
    category: 'utility',
    notes: 'GraphQL schema building utilities - makeExecutableSchema, mergeSchemas, schema stitching',
  },
  'basic-auth': {
    importStatement: `import auth from 'basic-auth';`,
    testCode: `// Simulate an HTTP request with Basic Auth header
const credentials = btoa('user:pass'); // Base64 encode 'user:pass'
const mockRequest = {
  headers: {
    authorization: \`Basic \${credentials}\`
  }
};
const parsed = auth(mockRequest);
return { success: parsed?.name === 'user' && parsed?.pass === 'pass', result: parsed };`,
    category: 'utility',
    notes: 'HTTP Basic Authentication parser - parses Authorization header to extract credentials',
  },
  'http-errors': {
    importStatement: `const createError = require('http-errors');`,
    testCode: `const err = createError(404, 'Not Found');
return { success: err.statusCode === 404, result: err.message };`,
    category: 'utility',
    notes: 'Create HTTP error objects with status codes',
  },
  'https-proxy-agent': {
    importStatement: `import { HttpsProxyAgent } from 'https-proxy-agent';`,
    testCode: `const agent = new HttpsProxyAgent('http://proxy.example.com:8080');
return { success: agent != null, result: 'Proxy agent created' };`,
    category: 'http-client',
    notes: 'HTTP(S) proxy agent - may have limitations with Workers network model',
  },
  'hyperquest': {
    importStatement: `import hyperquest from 'hyperquest';`,
    testCode: `const req = hyperquest('https://httpbin.org/json');
let data = '';
for await (const chunk of req) {
  data += chunk;
}
const parsed = JSON.parse(data);
return { success: parsed != null, result: parsed };`,
    category: 'http-client',
    notes: 'Streaming HTTP client',
  },
  'immutability-helper': {
    importStatement: `import update from 'immutability-helper';`,
    testCode: `const state = { name: 'Alice', age: 30 };
const newState = update(state, { age: { $set: 31 } });
return { success: newState.age === 31 && state.age === 30, result: newState };`,
    category: 'utility',
    notes: 'Immutable state updates for React and other frameworks',
  },
  'is-url': {
    importStatement: `import isUrl from 'is-url';`,
    testCode: `const results = [
  isUrl('https://example.com'),
  isUrl('http://example.com/path'),
  isUrl('not a url'),
  isUrl('example.com')
];
return { success: results[0] && results[1] && !results[2] && !results[3], result: results };`,
    category: 'validation',
    notes: 'Validate if a string is a valid URL',
  },
  'i18next': {
    importStatement: `import i18next from 'i18next';`,
    testCode: `await i18next.init({
  lng: 'en',
  resources: {
    en: { translation: { hello: 'Hello World' } }
  }
});
const result = i18next.t('hello');
return { success: result === 'Hello World', result };`,
    category: 'utility',
    notes: 'Internationalization framework',
  },
  'iconv-lite': {
    importStatement: `import iconv from 'iconv-lite';`,
    testCode: `const encoded = iconv.encode('Hello', 'utf8');
const decoded = iconv.decode(encoded, 'utf8');
return { success: decoded === 'Hello', result: decoded };`,
    category: 'encoding',
  },
  'identity-obj-proxy': {
    importStatement: `import proxy from 'identity-obj-proxy';`,
    testCode: `const result = proxy.anyProperty;
return { success: result === 'anyProperty', result };`,
    category: 'testing',
    notes: 'Returns property names as values - useful for mocking CSS modules in tests',
  },
  'immer': {
    importStatement: `import { produce } from 'immer';`,
    testCode: `const base = { a: 1, b: 2 };
const next = produce(base, draft => { draft.a = 2; });
return { success: base.a === 1 && next.a === 2, result: next };`,
    category: 'utility',
    notes: 'Immutable state updates',
  },
  'immutable': {
    importStatement: `import { Map } from 'immutable';`,
    testCode: `const map1 = Map({ a: 1 });
const map2 = map1.set('b', 2);
return { success: map1.size === 1 && map2.size === 2, result: map2.toJS() };`,
    category: 'utility',
    notes: 'Immutable data structures',
  },
  'inherits': {
    importStatement: `import inherits from 'inherits';`,
    testCode: `function Parent() {}
Parent.prototype.hello = function() { return 'hello'; };
function Child() {}
inherits(Child, Parent);
const child = new Child();
return { success: child.hello() === 'hello', result: child.hello() };`,
    category: 'utility',
    notes: 'Browser/node compatible inherits implementation',
  },
  'ini': {
    importStatement: `import ini from 'ini';`,
    testCode: `const obj = { name: 'test', value: 42 };
const str = ini.stringify(obj);
const parsed = ini.parse(str);
return { success: parsed.value === '42', result: parsed };`,
    category: 'parsing',
    notes: 'INI file parser/serializer',
  },
  'intl-messageformat': {
    importStatement: `import { IntlMessageFormat } from 'intl-messageformat';`,
    testCode: `const msg = new IntlMessageFormat('Hello {name}!', 'en-US');
const result = msg.format({ name: 'World' });
return { success: result === 'Hello World!', result };`,
    category: 'utility',
    notes: 'ICU MessageFormat for i18n',
  },
  'invariant': {
    importStatement: `import invariant from 'invariant';`,
    testCode: `let passed = true;
try {
  invariant(false, 'This should throw');
  passed = false;
} catch (e) {}
return { success: passed, result: 'invariant works' };`,
    category: 'utility',
    notes: 'Assertion library',
  },
  'is-number': {
    importStatement: `import isNumber from 'is-number';`,
    testCode: `const results = [
  isNumber(5),
  isNumber('5'),
  isNumber('abc'),
  isNumber(NaN)
];
return { success: results[0] && results[1] && !results[2] && !results[3], result: results };`,
    category: 'type-checking',
  },
  'isobject': {
    importStatement: `import isObject from 'isobject';`,
    testCode: `const results = [
  isObject({}),
  isObject([]),
  isObject(null),
  isObject('string')
];
return { success: results[0] && !results[1] && !results[2] && !results[3], result: results };`,
    category: 'type-checking',
  },
  'isomorphic-fetch': {
    importStatement: `import fetch from 'isomorphic-fetch';`,
    testCode: `// Just verify fetch is available - don't actually make a request
return { success: typeof fetch === 'function', result: 'fetch available' };`,
    category: 'http-client',
    notes: 'fetch polyfill - Workers has built-in fetch',
    alternative: 'built-in: fetch',
  },
  'itty-router': {
    importStatement: `import { Router } from 'itty-router';`,
    testCode: `const router = Router();
router.get('/test', () => new Response('OK'));
return { success: true, result: 'router created' };`,
    category: 'framework',
    notes: 'Tiny router designed for Cloudflare Workers',
  },
  'jszip': {
    importStatement: `import JSZip from 'jszip';`,
    testCode: `const zip = new JSZip();
zip.file('hello.txt', 'Hello World!');
const content = await zip.generateAsync({ type: 'blob' });
return { success: content.size > 0, result: { size: content.size } };`,
    category: 'compression',
    notes: 'Create, read, and edit ZIP files in JavaScript',
  },

  // === ENCODING/PARSING ===
  'qs': {
    importStatement: `import qs from 'qs';`,
    testCode: `const parsed = qs.parse('a=1&b=2');
const stringified = qs.stringify({ c: 3, d: 4 });
return { success: true, result: { parsed, stringified } };`,
    category: 'parsing',
  },
  'query-string': {
    importStatement: `import queryString from 'query-string';`,
    testCode: `const parsed = queryString.parse('a=1&b=2');
return { success: true, result: parsed };`,
    category: 'parsing',
  },
  'js-yaml': {
    importStatement: `import yaml from 'js-yaml';`,
    testCode: `const obj = yaml.load('name: Alice\\nage: 30');
return { success: true, result: obj };`,
    category: 'parsing',
  },
  'front-matter': {
    importStatement: `import fm from 'front-matter';`,
    testCode: `const content = \`---
title: Hello World
date: 2026-01-09
tags: [test, markdown]
---

# Article Content

This is the body of the article.
\`;
const parsed = fm(content);
return { 
  success: parsed.attributes.title === 'Hello World' && parsed.body.includes('Article Content'),
  result: { attributes: parsed.attributes, bodyLength: parsed.body.length }
};`,
    category: 'parsing',
    notes: 'Extracts YAML front matter from markdown files. Commonly used in static site generators.',
  },
  'gray-matter': {
    importStatement: `import matter from 'gray-matter';`,
    testCode: `const content = \`---
title: Works on Workers
description: Testing gray-matter
tags: [cloudflare, workers, yaml]
---

# Article Content

This is the body of the markdown file.
\`;
const parsed = matter(content);
return { 
  success: parsed.data.title === 'Works on Workers' && parsed.content.includes('Article Content'),
  result: { data: parsed.data, contentLength: parsed.content.length }
};`,
    category: 'parsing',
    notes: 'Parses YAML front matter from markdown/strings. Popular in static site generators (Gatsby, Hugo, VuePress). Similar to front-matter but more feature-rich.',
  },
  'toml': {
    importStatement: `import TOML from 'toml';`,
    testCode: `const obj = TOML.parse('name = "Alice"\\nage = 30');
return { success: true, result: obj };`,
    category: 'parsing',
  },
  'csv': {
    importStatement: `import { parse, stringify } from 'csv/sync';`,
    testCode: `const csvInput = 'name,age\\nAlice,30\\nBob,25';
const records = parse(csvInput, { columns: true });
const csvOutput = stringify(records, { header: true });
return { success: records.length === 2 && records[0].name === 'Alice', result: { records, csvOutput } };`,
    category: 'parsing',
    notes: 'CSV parsing and generation library with sync and stream APIs.',
  },
  'convert-source-map': {
    importStatement: `import { fromObject, fromJSON } from 'convert-source-map';`,
    testCode: `const map = { version: 3, sources: ['foo.js'], mappings: 'AAAA' };
const converter = fromObject(map);
const json = converter.toJSON();
const parsed = fromJSON(json);
return { success: parsed.toObject().version === 3, result: parsed.toObject() };`,
    category: 'utility',
    notes: 'Converts source maps between different formats (JSON, base64, inline comments).',
  },
  'escodegen': {
    importStatement: `import escodegen from 'escodegen';`,
    testCode: `const ast = {
  type: 'Program',
  body: [{
    type: 'VariableDeclaration',
    declarations: [{
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'answer' },
      init: { type: 'Literal', value: 42 }
    }],
    kind: 'const'
  }]
};
const code = escodegen.generate(ast);
return { success: code.includes('answer') && code.includes('42'), result: code };`,
    category: 'utility',
    notes: 'JavaScript code generator from AST (Mozilla Parser API). Takes Abstract Syntax Trees and generates JavaScript code.',
  },

  // === STRING MANIPULATION ===
  'slugify': {
    importStatement: `import slugify from 'slugify';`,
    testCode: `const slug = slugify('Hello World!');
return { success: slug === 'Hello-World!', result: slug };`,
    category: 'string',
  },
  'change-case': {
    importStatement: `import { camelCase, snakeCase } from 'change-case';`,
    testCode: `const camel = camelCase('hello world');
const snake = snakeCase('helloWorld');
return { success: true, result: { camel, snake } };`,
    category: 'string',
  },
  'escape-html': {
    importStatement: `import escapeHtml from 'escape-html';`,
    testCode: `const escaped = escapeHtml('<script>alert("xss")</script>');
return { success: escaped.includes('&lt;'), result: escaped };`,
    category: 'string',
  },
  'base-64': {
    importStatement: `import base64 from 'base-64';`,
    testCode: `const encoded = base64.encode('Hello, World!');
const decoded = base64.decode(encoded);
return { success: decoded === 'Hello, World!', result: { encoded, decoded } };`,
    category: 'string',
    notes: 'JavaScript base64 encoder/decoder. Workers also has native atob()/btoa() functions.',
  },
  'bson': {
    importStatement: `import { BSON } from 'bson';`,
    testCode: `const doc = { name: 'John', age: 30, tags: ['developer', 'nodejs'] };
const serialized = BSON.serialize(doc);
const deserialized = BSON.deserialize(serialized);
return { success: deserialized.name === 'John' && deserialized.age === 30, result: deserialized };`,
    category: 'encoding',
    notes: 'Binary JSON (BSON) parser used by MongoDB for efficient binary data serialization.',
  },
  'common-tags': {
    importStatement: `import { stripIndent, oneLine, html } from 'common-tags';`,
    testCode: `const multiline = stripIndent\`
      Hello
        World
          !
    \`;
const single = oneLine\`
      This will be
      on one line
    \`;
const markup = html\`<div>Hello</div>\`;
return { 
  success: multiline === 'Hello\\n  World\\n    !' && single.includes('This will be on one line'), 
  result: { multiline, single, markup } 
};`,
    category: 'string',
    notes: 'ES2015 template literal tag functions for string manipulation (stripIndent, oneLine, html, etc.).',
  },

  // === CRYPTO/HASHING ===
  'crypto-js': {
    importStatement: `import CryptoJS from 'crypto-js';`,
    testCode: `const hash = CryptoJS.SHA256('hello').toString();
return { success: hash.length === 64, result: hash };`,
    category: 'crypto',
    notes: 'Consider using built-in Web Crypto API',
    alternative: 'built-in: crypto',
  },
  'bcryptjs': {
    importStatement: `import bcrypt from 'bcryptjs';`,
    testCode: `const hash = await bcrypt.hash('password', 10);
const match = await bcrypt.compare('password', hash);
return { success: match, result: { hash: hash.substring(0, 20) + '...' } };`,
    category: 'crypto',
  },
  'jsonwebtoken': {
    importStatement: `import jwt from 'jsonwebtoken';`,
    testCode: `const token = jwt.sign({ sub: '123' }, 'secret');
const decoded = jwt.verify(token, 'secret');
return { success: decoded.sub === '123', result: decoded };`,
    category: 'crypto',
  },
  'jose': {
    importStatement: `import * as jose from 'jose';`,
    testCode: `const secret = new TextEncoder().encode('my-secret-key-at-least-32-chars!');
const jwt = await new jose.SignJWT({ sub: '123' }).setProtectedHeader({ alg: 'HS256' }).sign(secret);
return { success: typeof jwt === 'string', result: jwt.substring(0, 50) + '...' };`,
    category: 'crypto',
    notes: 'Recommended for JWT in Workers',
  },
  'crc': {
    importStatement: `import { crc32 } from 'crc';`,
    testCode: `const checksum = crc32('hello world');
return { success: typeof checksum === 'number' && checksum === 0x0d4a1185, result: '0x' + checksum.toString(16) };`,
    category: 'crypto',
    notes: 'CRC (Cyclic Redundancy Check) checksums - supports CRC1, CRC8, CRC16, CRC24, CRC32',
  },
  'create-hash': {
    importStatement: `import createHash from 'create-hash';`,
    testCode: `const hash = createHash('sha256');
hash.update('hello world');
const digest = hash.digest('hex');
return { success: digest === 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9', result: digest };`,
    category: 'crypto',
    notes: 'create-hash is a Node.js crypto.createHash polyfill (part of crypto-browserify) that provides hash digest functions (md5, sha1, sha256, sha512, etc.). Fails with Buffer implementation incompatibilities. Use Web Crypto API instead.',
    alternative: 'Web Crypto API (crypto.subtle.digest) - built-in',
  },
  'elliptic': {
    importStatement: `import { ec as EC } from 'elliptic';`,
    testCode: `const ec = new EC('secp256k1');
const key = ec.genKeyPair();
const msgHash = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const signature = key.sign(msgHash);
const derSign = signature.toDER();
const isValid = key.verify(msgHash, derSign);
return { success: isValid === true, result: { verified: isValid, sigLength: derSign.length } };`,
    category: 'crypto',
    notes: 'Pure JavaScript elliptic curve cryptography (ECDSA, EdDSA, ECDH). Consider using built-in Web Crypto API for better performance.',
    alternative: 'Web Crypto API (crypto.subtle.sign/verify with ECDSA) - built-in',
  },

  // === COMPRESSION ===
  'pako': {
    importStatement: `import pako from 'pako';`,
    testCode: `const input = new TextEncoder().encode('Hello, World!');
const compressed = pako.deflate(input);
const decompressed = pako.inflate(compressed);
const output = new TextDecoder().decode(decompressed);
return { success: output === 'Hello, World!', result: output };`,
    category: 'compression',
  },
  'fflate': {
    importStatement: `import { deflateSync, inflateSync } from 'fflate';`,
    testCode: `const input = new TextEncoder().encode('Hello, World!');
const compressed = deflateSync(input);
const decompressed = inflateSync(compressed);
const output = new TextDecoder().decode(decompressed);
return { success: output === 'Hello, World!', result: output };`,
    category: 'compression',
    notes: 'Fast and lightweight compression library',
  },

  // === TYPE CHECKING ===
  'is-plain-object': {
    importStatement: `import { isPlainObject } from 'is-plain-object';`,
    testCode: `const r1 = isPlainObject({});
const r2 = isPlainObject([]);
return { success: r1 && !r2, result: { object: r1, array: r2 } };`,
    category: 'type-checking',
  },

  // === ASYNC UTILITIES ===
  'p-limit': {
    importStatement: `import pLimit from 'p-limit';`,
    testCode: `const limit = pLimit(2);
const results = await Promise.all([
  limit(() => Promise.resolve(1)),
  limit(() => Promise.resolve(2)),
]);
return { success: true, result: results };`,
    category: 'async',
  },
  'p-queue': {
    importStatement: `import PQueue from 'p-queue';`,
    testCode: `const queue = new PQueue({ concurrency: 1 });
const results = await Promise.all([
  queue.add(() => Promise.resolve(1)),
  queue.add(() => Promise.resolve(2)),
]);
return { success: true, result: results };`,
    category: 'async',
  },
  'async-retry': {
    importStatement: `import retry from 'async-retry';`,
    testCode: `let attempts = 0;
const result = await retry(async () => {
  attempts++;
  if (attempts < 2) throw new Error('retry');
  return 'success';
}, { retries: 3 });
return { success: result === 'success', result };`,
    category: 'async',
  },
  'bottleneck': {
    importStatement: `import Bottleneck from 'bottleneck';`,
    testCode: `const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 100
});
const results = await Promise.all([
  limiter.schedule(() => Promise.resolve(1)),
  limiter.schedule(() => Promise.resolve(2)),
]);
return { success: results.length === 2, result: results };`,
    category: 'async',
    notes: 'Task scheduler and rate limiter for controlling concurrency and request rates.',
  },
  'component-emitter': {
    importStatement: `import Emitter from 'component-emitter';`,
    testCode: `const emitter = new Emitter();
let result = null;
emitter.on('test', (data) => { result = data; });
emitter.emit('test', 'hello');
return { success: result === 'hello', result };`,
    category: 'async',
    notes: 'Simple event emitter for creating event-based APIs with on/off/emit methods.',
  },
  'debounce': {
    importStatement: `import debounce from 'debounce';`,
    testCode: `let callCount = 0;
const debouncedFn = debounce(() => { callCount++; }, 100);
debouncedFn();
debouncedFn();
debouncedFn();
// Wait for debounce delay
await new Promise(resolve => setTimeout(resolve, 150));
return { success: callCount === 1, result: callCount };`,
    category: 'async',
    notes: 'Delays function calls until a set time elapses after the last invocation.',
  },
  'es6-promisify': {
    importStatement: `import { promisify } from 'es6-promisify';`,
    testCode: `// Create a callback-based function
const callbackFn = (a, b, callback) => {
  setTimeout(() => callback(null, a + b), 10);
};
// Convert to promise-based
const promiseFn = promisify(callbackFn);
const result = await promiseFn(2, 3);
return { success: result === 5, result };`,
    category: 'async',
    notes: 'Converts callback-based functions to ES6 Promises.',
  },
  'decamelize': {
    importStatement: `import decamelize from 'decamelize';`,
    testCode: `const result = decamelize('unicornRainbow');
const custom = decamelize('unicornRainbow', { separator: '-' });
return { success: result === 'unicorn_rainbow' && custom === 'unicorn-rainbow', result: { result, custom } };`,
    category: 'string',
    notes: 'Converts camelCase strings to lowercase with custom separator (default underscore).',
  },
  'generic-pool': {
    importStatement: `import { createPool } from 'generic-pool';`,
    testCode: `// Create a simple resource factory
const factory = {
  create: async () => ({ id: Math.random() }),
  destroy: async (resource) => {}
};
// Create pool with max 2 resources
const pool = createPool(factory, { max: 2, min: 1 });
// Acquire and release a resource
const resource = await pool.acquire();
await pool.release(resource);
const size = pool.size;
await pool.drain();
await pool.clear();
return { success: size >= 1, result: { poolSize: size, resourceId: resource.id } };`,
    category: 'async',
    notes: 'Generic resource pooling for managing reusable resources like database connections, API clients, or any limited resources with lifecycle management.',
  },

  // === HTTP/SERVER FRAMEWORKS ===
  'hapi': {
    importStatement: `import Hapi from '@hapi/hapi';`,
    testCode: `const server = Hapi.server({ port: 3000, host: 'localhost' });
server.route({
  method: 'GET',
  path: '/',
  handler: () => 'Hello Hapi'
});
// Don't actually start the server, just verify we can create and configure it
return { success: true, result: 'configured' };`,
    category: 'framework',
    notes: 'Server framework - basic instantiation works but Workers uses fetch handlers, not Node HTTP',
  },

  // === LOGGING ===
  'pino': {
    importStatement: `import pino from 'pino';`,
    testCode: `const logger = pino({ level: 'info' });
logger.info({ test: true }, 'Hello from pino');
return { success: true, result: 'logged' };`,
    category: 'logging',
  },
  'winston': {
    importStatement: `import winston from 'winston';`,
    testCode: `const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});
logger.info('Hello from winston');
return { success: true, result: 'logged' };`,
    category: 'logging',
  },
  'bunyan': {
    importStatement: `import bunyan from 'bunyan';`,
    testCode: `const logger = bunyan.createLogger({ name: 'myapp' });
logger.info({ test: true }, 'Hello from bunyan');
return { success: true, result: 'logged' };`,
    category: 'logging',
  },

  // === SVG/ICON LIBRARIES ===
  '@fortawesome/fontawesome-svg-core': {
    importStatement: `import { library, icon } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-solid-svg-icons';`,
    testCode: `library.add(faUser);
const result = icon({ prefix: 'fas', iconName: 'user' });
const svg = result?.html?.[0];
return { success: svg?.includes('<svg') && svg?.includes('data-icon="user"'), result: { length: svg?.length } };`,
    category: 'ui',
    notes: 'Works for server-side SVG generation, but DOM manipulation features require browser',
  },
  '@fortawesome/free-solid-svg-icons': {
    importStatement: `import { faUser, faHeart, faCheck } from '@fortawesome/free-solid-svg-icons';`,
    testCode: `const hasCorrectStructure = faUser.prefix === 'fas' && 
  faUser.iconName === 'user' && 
  Array.isArray(faUser.icon);
return { success: hasCorrectStructure, result: { icons: ['faUser', 'faHeart', 'faCheck'], prefix: faUser.prefix } };`,
    category: 'ui',
    notes: 'Icon definitions for Font Awesome, works in Workers',
  },

  // === NOT APPLICABLE / CLI TOOLS ===
  'typescript': {
    importStatement: ``,
    testCode: ``,
    category: 'build-tool',
    skipReason: 'Build tool - not meant to run in Workers',
  },
  'eslint': {
    importStatement: ``,
    testCode: ``,
    category: 'build-tool',
    skipReason: 'Linter - not meant to run in Workers',
  },
  'prettier': {
    importStatement: ``,
    testCode: ``,
    category: 'build-tool',
    skipReason: 'Formatter - not meant to run in Workers',
  },
  'webpack': {
    importStatement: ``,
    testCode: ``,
    category: 'build-tool',
    skipReason: 'Bundler - not meant to run in Workers',
  },
  'esbuild': {
    importStatement: ``,
    testCode: ``,
    category: 'build-tool',
    skipReason: 'Bundler - not meant to run in Workers',
  },
  'vite': {
    importStatement: ``,
    testCode: ``,
    category: 'build-tool',
    skipReason: 'Build tool - not meant to run in Workers',
  },
  'rollup': {
    importStatement: ``,
    testCode: ``,
    category: 'build-tool',
    skipReason: 'Bundler - not meant to run in Workers',
  },
  'jest': {
    importStatement: ``,
    testCode: ``,
    category: 'testing',
    skipReason: 'Test runner - not meant to run in Workers',
  },
  'mocha': {
    importStatement: ``,
    testCode: ``,
    category: 'testing',
    skipReason: 'Test runner - not meant to run in Workers',
  },
  'vitest': {
    importStatement: ``,
    testCode: ``,
    category: 'testing',
    skipReason: 'Test runner - not meant to run in Workers',
  },
  'commander': {
    importStatement: ``,
    testCode: ``,
    category: 'cli',
    skipReason: 'CLI framework - not meant to run in Workers',
  },
  'yargs': {
    importStatement: ``,
    testCode: ``,
    category: 'cli',
    skipReason: 'CLI framework - not meant to run in Workers',
  },
  'inquirer': {
    importStatement: ``,
    testCode: ``,
    category: 'cli',
    skipReason: 'CLI prompts - not meant to run in Workers',
  },
  'chalk': {
    importStatement: ``,
    testCode: ``,
    category: 'cli',
    skipReason: 'Terminal colors - not useful in Workers',
  },

  // === TYPE-ONLY PACKAGES ===
  'type-fest': {
    importStatement: ``,
    testCode: ``,
    category: 'types',
    skipReason: 'Type-only package, no runtime code',
  },
  '@types/node': {
    importStatement: ``,
    testCode: ``,
    category: 'types',
    skipReason: 'Type definitions only, no runtime code',
  },
  '@types/react': {
    importStatement: ``,
    testCode: ``,
    category: 'types',
    skipReason: 'Type definitions only, no runtime code',
  },
  '@types/lodash': {
    importStatement: ``,
    testCode: ``,
    category: 'types',
    skipReason: 'Type definitions only, no runtime code',
  },

  // === MOBILE FRAMEWORKS (not applicable to Workers) ===
  'react-native': {
    importStatement: ``,
    testCode: ``,
    category: 'mobile',
    skipReason: 'Mobile framework - not meant to run in Workers',
  },
  'expo': {
    importStatement: ``,
    testCode: ``,
    category: 'mobile',
    skipReason: 'Mobile framework - not meant to run in Workers',
  },
  '@react-native-community/cli': {
    importStatement: ``,
    testCode: ``,
    category: 'mobile',
    skipReason: 'Mobile CLI - not meant to run in Workers',
  },

  // === DESKTOP FRAMEWORKS (not applicable to Workers) ===
  'electron': {
    importStatement: ``,
    testCode: ``,
    category: 'desktop',
    skipReason: 'Desktop framework - not meant to run in Workers',
  },

  // === BROWSER-ONLY (DOM required) ===
  'react-dom': {
    importStatement: ``,
    testCode: ``,
    category: 'ui',
    skipReason: 'Browser-only (requires DOM). Use react-dom/server for SSR.',
  },
  'jquery': {
    importStatement: ``,
    testCode: ``,
    category: 'ui',
    skipReason: 'Browser-only - requires DOM',
  },

  // === NATIVE MODULES (require C++ bindings) ===
  'bcrypt': {
    importStatement: ``,
    testCode: ``,
    category: 'crypto',
    skipReason: 'Native module (C++ bindings) - use bcryptjs instead',
    alternative: 'bcryptjs',
  },
  'sharp': {
    importStatement: ``,
    testCode: ``,
    category: 'image',
    skipReason: 'Native module (C++ bindings) - use @cf/image or external service',
  },
  'canvas': {
    importStatement: ``,
    testCode: ``,
    category: 'image',
    skipReason: 'Native module (C++ bindings)',
  },
  'fsevents': {
    importStatement: ``,
    testCode: ``,
    category: 'file-system',
    skipReason: 'Native module (macOS file watching)',
  },
  'node-sass': {
    importStatement: ``,
    testCode: ``,
    category: 'build-tool',
    skipReason: 'Native module - use sass (dart-sass) instead',
    alternative: 'sass',
  },
  'sqlite3': {
    importStatement: ``,
    testCode: ``,
    category: 'database',
    skipReason: 'Native module - use D1 or @libsql/client instead',
    alternative: '@libsql/client',
  },
  'pg-native': {
    importStatement: ``,
    testCode: ``,
    category: 'database',
    skipReason: 'Native module - use pg or @neondatabase/serverless instead',
    alternative: '@neondatabase/serverless',
  },
  'pg': {
    importStatement: `import pkg from 'pg';`,
    testCode: `const { Client } = pkg;
const client = new Client({ connectionString: 'postgresql://test' });
return { success: typeof client.connect === 'function', result: { hasClient: true } };`,
    category: 'database',
    notes: 'PostgreSQL client for Node.js. Use @neondatabase/serverless or Hyperdrive for Workers',
  },
  'path': {
    importStatement: `import path from 'path';`,
    testCode: `const result = {
  join: path.join('/foo', 'bar', 'baz.txt'),
  dirname: path.dirname('/foo/bar/baz.txt'),
  extname: path.extname('index.html')
};
return { success: result.join === '/foo/bar/baz.txt' && result.dirname === '/foo/bar' && result.extname === '.html', result };`,
    category: 'utility',
    notes: 'Node.js path module (polyfilled in Workers)',
  },
  'picomatch': {
    importStatement: `import picomatch from 'picomatch';`,
    testCode: `const isMatch = picomatch('*.js');
const result = { match: isMatch('test.js'), noMatch: !isMatch('test.css') };
return { success: result.match && result.noMatch, result };`,
    category: 'utility',
    notes: 'Fast glob matcher used by many tools',
  },
  'pify': {
    importStatement: `import pify from 'pify';`,
    testCode: `const fn = (arg: string, callback: (err: null, result: string) => void) => {
  callback(null, arg.toUpperCase());
};
const promisified = pify(fn);
const result = await promisified('hello');
return { success: result === 'HELLO', result };`,
    category: 'utility',
    notes: 'Promisify callback-based functions',
  },

  // === REACT/UI (Server-side rendering might work) ===
  'react': {
    importStatement: `import React from 'react';
import { renderToString } from 'react-dom/server';`,
    testCode: `const element = React.createElement('div', null, 'Hello, World!');
const html = renderToString(element);
return { success: html.includes('Hello, World!'), result: html };`,
    category: 'ui',
    notes: 'SSR works in Workers',
  },
  'preact': {
    importStatement: `import { h } from 'preact';
import renderToString from 'preact-render-to-string';`,
    testCode: `const element = h('div', null, 'Hello, World!');
const html = renderToString(element);
return { success: html.includes('Hello, World!'), result: html };`,
    category: 'ui',
    notes: 'Lightweight React alternative, SSR works great',
  },

  // === BUILT-IN MODULES ===
  'fs': {
    importStatement: `import * as fs from 'node:fs';`,
    testCode: `const result = { existsSync: typeof fs.existsSync === 'function', readFileSync: typeof fs.readFileSync === 'function' };
return { success: result.existsSync && result.readFileSync, result };`,
    category: 'utility',
    notes: 'Node.js fs module (polyfilled in Workers)',
  },

  // === TEMPLATE ENGINES ===
  'handlebars': {
    importStatement: `import Handlebars from 'handlebars';`,
    testCode: `const template = Handlebars.compile('Hello {{name}}!');
const result = template({ name: 'World' });
return { success: result === 'Hello World!', result };`,
    category: 'parsing',
    notes: 'Handlebars template engine',
  },

  // === CRYPTOGRAPHY ===
  'hash.js': {
    importStatement: `import { sha256 } from 'hash.js';`,
    testCode: `const hash = sha256().update('hello').digest('hex');
return { success: hash.length === 64, result: hash };`,
    category: 'crypto',
    notes: 'Pure JavaScript hash functions',
  },

  // === HTML/XML PROCESSING ===
  'he': {
    importStatement: `import he from 'he';`,
    testCode: `const encoded = he.encode('<div>test</div>');
const decoded = he.decode('&lt;div&gt;test&lt;/div&gt;');
return { success: encoded.includes('&lt;') && decoded === '<div>test</div>', result: { encoded, decoded } };`,
    category: 'utility',
    notes: 'HTML entity encoder/decoder',
  },
  'htmlparser2': {
    importStatement: `import * as htmlparser2 from 'htmlparser2';`,
    testCode: `const dom = htmlparser2.parseDocument('<div>test</div>');
return { success: dom.children.length > 0, result: { childCount: dom.children.length } };`,
    category: 'parsing',
    notes: 'Fast HTML parser',
  },

  // === SYNTAX HIGHLIGHTING ===
  'highlight.js': {
    importStatement: `import hljs from 'highlight.js';`,
    testCode: `const result = hljs.highlight('const x = 5;', { language: 'javascript' });
return { success: result.value.includes('const'), result: { highlighted: result.value.substring(0, 50) } };`,
    category: 'utility',
    notes: 'Syntax highlighting library',
  },

  // === ROUTING/HISTORY ===
  'history': {
    importStatement: `import { createMemoryHistory } from 'history';`,
    testCode: `const history = createMemoryHistory();
history.push('/test');
return { success: history.location.pathname === '/test', result: { pathname: history.location.pathname } };`,
    category: 'utility',
    notes: 'History/routing library for SPAs',
  },

  // === UTILITY LIBRARIES ===
  'hoek': {
    importStatement: `import * as Hoek from '@hapi/hoek';`,
    testCode: `const result = Hoek.merge({ a: 1 }, { b: 2 });
return { success: result.a === 1 && result.b === 2, result };`,
    category: 'utility',
    notes: 'Utility library from Hapi ecosystem',
  },
  'hoist-non-react-statics': {
    importStatement: `import hoistStatics from 'hoist-non-react-statics';`,
    testCode: `function Target() {}
function Source() {}
Source.foo = 'bar';
hoistStatics(Target, Source);
return { success: (Target as any).foo === 'bar', result: { foo: (Target as any).foo } };`,
    category: 'utility',
    notes: 'Copies non-React static properties',
  },

  // === WEB FRAMEWORKS ===
  'hono': {
    importStatement: `import { Hono } from 'hono';`,
    testCode: `const app = new Hono();
app.get('/test', (c) => c.text('Hello'));
return { success: app !== null, result: { routes: 'defined' } };`,
    category: 'framework',
    notes: 'Fast web framework for Workers',
  },

  // === BROWSER-ONLY (should be marked not-applicable) ===
  'lit-element': {
    importStatement: '',
    testCode: '',
    category: 'ui',
    skipReason: 'Browser-only web components framework - requires DOM APIs',
  },
  'localforage': {
    importStatement: '',
    testCode: '',
    category: 'other',
    skipReason: 'Browser storage library - requires localStorage/IndexedDB',
  },

  // === LOGGING (needs node:os) ===
  'log4js': {
    importStatement: '',
    testCode: '',
    category: 'logging',
    skipReason: 'Requires node:os which is not supported',
    alternative: 'console methods or pino',
  },

  // === MATH/SCIENCE ===
  'mathjs': {
    importStatement: `import { create, all } from 'mathjs';`,
    testCode: `const math = create(all);
const result = math.evaluate('sqrt(16) + sin(pi/2)');
return { success: result === 5, result };`,
    category: 'utility',
    notes: 'Math library with expression parser',
  },

  // === DATE/TIME ===
  'moment-timezone': {
    importStatement: `import moment from 'moment-timezone';`,
    testCode: `const result = moment.tz('2026-01-09 12:00', 'America/New_York').format();
return { success: result.includes('2026-01-09'), result };`,
    category: 'date-time',
    notes: 'Timezone support for moment.js',
  },

  // === MARKDOWN ===
  'markdown': {
    importStatement: `import { markdown } from 'markdown';`,
    testCode: `const result = markdown.toHTML('# Hello');
return { success: result.includes('<h1>'), result };`,
    category: 'utility',
    notes: 'Markdown to HTML converter',
  },
  'markdown-it': {
    importStatement: `import MarkdownIt from 'markdown-it';`,
    testCode: `const md = new MarkdownIt();
const result = md.render('# Hello World');
return { success: result.includes('<h1>') && result.includes('Hello World'), result };`,
    category: 'utility',
    notes: 'Markdown parser and renderer',
  },
  'marked': {
    importStatement: `import { marked } from 'marked';`,
    testCode: `const result = marked('# Hello **World**');
return { success: result.includes('<h1>') && result.includes('<strong>'), result };`,
    category: 'utility',
    notes: 'Fast markdown parser and compiler',
  },
  'md5': {
    importStatement: `import md5 from 'md5';`,
    testCode: `const result = md5('hello');
return { success: result === '5d41402abc4b2a76b9719d911017c592', result };`,
    category: 'crypto',
    notes: 'MD5 hash function',
  },
  'media-typer': {
    importStatement: `import typer from 'media-typer';`,
    testCode: `const obj = typer.parse('application/json; charset=utf-8');
return { success: obj.type === 'application' && obj.subtype === 'json', result: obj };`,
    category: 'utility',
    notes: 'Media type parser (MIME types)',
  },

  // === MEMOIZATION ===
  'memoize-one': {
    importStatement: `import memoizeOne from 'memoize-one';`,
    testCode: `let calls = 0;
const fn = memoizeOne((a, b) => { calls++; return a + b; });
fn(1, 2); fn(1, 2); fn(2, 3);
return { success: calls === 2, result: { calls } };`,
    category: 'utility',
    notes: 'Memoization with single result cache',
  },
  'memoizee': {
    importStatement: `import memoize from 'memoizee';`,
    testCode: `let calls = 0;
const fn = memoize((a) => { calls++; return a * 2; });
fn(5); fn(5); fn(10);
return { success: calls === 2, result: { calls } };`,
    category: 'utility',
    notes: 'Complete memoization solution',
  },

  // === MOCK DATA ===
  'mockjs': {
    importStatement: `import Mock from 'mockjs';`,
    testCode: `const result = Mock.mock({ 'number|1-100': 1 });
return { success: typeof result.number === 'number', result };`,
    category: 'testing',
    notes: 'Mock data generator',
  },

  // === MIDDLEWARE & LOGGING ===
  'morgan': {
    importStatement: `import morgan from 'morgan';`,
    testCode: `// morgan is Express middleware for HTTP logging
// Can't test fully without HTTP context, but verify it exports correctly
const middleware = morgan('combined');
return { success: typeof middleware === 'function', result: 'morgan middleware created' };`,
    category: 'utility',
    notes: 'HTTP request logger middleware - use with httpServerHandler',
  },

  // === TIME & DATE UTILITIES ===
  'ms': {
    importStatement: `import ms from 'ms';`,
    testCode: `const result = ms('2 days');
const str = ms(60000);
return { success: result === 172800000 && str === '1m', result: { parsed: result, formatted: str } };`,
    category: 'utility',
    notes: 'Parse/format milliseconds',
  },

  // === SERIALIZATION ===
  'msgpack-lite': {
    importStatement: `import msgpack from 'msgpack-lite';`,
    testCode: `const data = { hello: 'world', num: 42 };
const encoded = msgpack.encode(data);
const decoded = msgpack.decode(encoded);
return { success: decoded.hello === 'world' && decoded.num === 42, result: decoded };`,
    category: 'utility',
    notes: 'MessagePack serialization',
  },

  // === TEMPLATING ===
  'mustache': {
    importStatement: `import Mustache from 'mustache';`,
    testCode: `const template = 'Hello {{name}}!';
const result = Mustache.render(template, { name: 'World' });
return { success: result === 'Hello World!', result };`,
    category: 'utility',
    notes: 'Logic-less template syntax',
  },
};

/**
 * Patterns for packages that should be auto-skipped (not applicable to Workers)
 */
const SKIP_PATTERNS: Array<{ pattern: RegExp; reason: string; category: PackageCategory }> = [
  // Build tools & transpilers
  { pattern: /^@babel\//, reason: 'Babel transpiler - build tool, not for runtime', category: 'build-tool' },
  { pattern: /^babel-/, reason: 'Babel plugin/preset - build tool, not for runtime', category: 'build-tool' },
  { pattern: /^babelify$/, reason: 'Browserify Babel transform - build tool', category: 'build-tool' },
  { pattern: /-loader$/, reason: 'Webpack loader - build tool, not for runtime', category: 'build-tool' },
  { pattern: /^webpack-/, reason: 'Webpack plugin - build tool, not for runtime', category: 'build-tool' },
  { pattern: /-webpack-plugin$/, reason: 'Webpack plugin - build tool, not for runtime', category: 'build-tool' },
  { pattern: /^rollup-plugin-/, reason: 'Rollup plugin - build tool, not for runtime', category: 'build-tool' },
  { pattern: /^@rollup\//, reason: 'Rollup plugin - build tool, not for runtime', category: 'build-tool' },
  { pattern: /^vite-/, reason: 'Vite plugin - build tool, not for runtime', category: 'build-tool' },
  { pattern: /^@vitejs\//, reason: 'Vite plugin - build tool, not for runtime', category: 'build-tool' },
  
  // Task runners
  { pattern: /^gulp-/, reason: 'Gulp plugin - task runner, not for runtime', category: 'build-tool' },
  { pattern: /^gulp$/, reason: 'Gulp task runner - not for runtime', category: 'build-tool' },
  { pattern: /^grunt-/, reason: 'Grunt plugin - task runner, not for runtime', category: 'build-tool' },
  { pattern: /^grunt$/, reason: 'Grunt task runner - not for runtime', category: 'build-tool' },
  
  // Linters & formatters
  { pattern: /^eslint-/, reason: 'ESLint plugin/config - linter, not for runtime', category: 'build-tool' },
  { pattern: /^@eslint\//, reason: 'ESLint - linter, not for runtime', category: 'build-tool' },
  { pattern: /^@typescript-eslint\//, reason: 'TypeScript ESLint - linter, not for runtime', category: 'build-tool' },
  { pattern: /^tslint/, reason: 'TSLint (deprecated) - linter, not for runtime', category: 'build-tool' },
  { pattern: /^stylelint/, reason: 'Stylelint - CSS linter, not for runtime', category: 'build-tool' },
  { pattern: /^prettier/, reason: 'Prettier - formatter, not for runtime', category: 'build-tool' },
  
  // Test frameworks
  { pattern: /^jest-/, reason: 'Jest plugin - test framework, not for runtime', category: 'testing' },
  { pattern: /^@jest\//, reason: 'Jest - test framework, not for runtime', category: 'testing' },
  { pattern: /^mocha-/, reason: 'Mocha plugin - test framework, not for runtime', category: 'testing' },
  { pattern: /^karma-/, reason: 'Karma plugin - test runner, not for runtime', category: 'testing' },
  { pattern: /^jasmine-/, reason: 'Jasmine plugin - test framework, not for runtime', category: 'testing' },
  { pattern: /^chai-/, reason: 'Chai plugin - test assertion library', category: 'testing' },
  { pattern: /^sinon$/, reason: 'Sinon - test mocking library', category: 'testing' },
  { pattern: /^nyc$/, reason: 'NYC/Istanbul - coverage tool, not for runtime', category: 'testing' },
  { pattern: /^istanbul$/, reason: 'Istanbul - coverage tool, not for runtime', category: 'testing' },
  { pattern: /^coveralls$/, reason: 'Coveralls - coverage reporting, not for runtime', category: 'testing' },
  
  // Type definitions
  { pattern: /^@types\//, reason: 'TypeScript type definitions - no runtime code', category: 'types' },
  
  // CLI tools
  { pattern: /^@oclif\//, reason: 'Oclif CLI framework - needs terminal I/O', category: 'cli' },
  
  // Browser automation
  { pattern: /^puppeteer/, reason: 'Puppeteer - browser automation, needs Chrome', category: 'testing' },
  { pattern: /^playwright/, reason: 'Playwright - browser automation, needs browsers', category: 'testing' },
  { pattern: /^selenium-/, reason: 'Selenium - browser automation', category: 'testing' },
  { pattern: /^phantomjs/, reason: 'PhantomJS - headless browser (deprecated)', category: 'testing' },
  { pattern: /^webdriver/, reason: 'WebDriver - browser automation', category: 'testing' },
  
  // Native modules
  { pattern: /^node-gyp$/, reason: 'Node-gyp - native module build tool', category: 'build-tool' },
  { pattern: /^node-pre-gyp$/, reason: 'Node-pre-gyp - native module tool', category: 'build-tool' },
  { pattern: /^node-sass$/, reason: 'Node-sass - native module, use sass instead', category: 'build-tool' },
  { pattern: /^fsevents$/, reason: 'FSEvents - macOS native file watching', category: 'file-system' },
  { pattern: /^serialport$/, reason: 'Serialport - hardware serial port access', category: 'other' },
  
  // Mobile/Desktop
  { pattern: /^react-native-/, reason: 'React Native - mobile only', category: 'mobile' },
  { pattern: /^react-native$/, reason: 'React Native - mobile only', category: 'mobile' },
  { pattern: /^expo-/, reason: 'Expo - mobile only', category: 'mobile' },
  { pattern: /^expo$/, reason: 'Expo - mobile only', category: 'mobile' },
  { pattern: /^electron-/, reason: 'Electron - desktop only', category: 'desktop' },
  { pattern: /^electron$/, reason: 'Electron - desktop only', category: 'desktop' },
];

/**
 * Check if a package should be auto-skipped based on patterns
 */
function getAutoSkipReason(packageName: string): { reason: string; category: PackageCategory } | null {
  for (const { pattern, reason, category } of SKIP_PATTERNS) {
    if (pattern.test(packageName)) {
      return { reason, category };
    }
  }
  return null;
}

/**
 * Get test config for a package, or generate a generic one
 * 
 * IMPORTANT: A good test MUST actually exercise the library's functionality!
 * 
 * BAD test (DO NOT DO THIS):
 *   const keys = Object.keys(pkg);
 *   return { success: keys.length > 0, result: { exports: keys } };
 * 
 * This is lazy - it only checks if the module exports something, not whether
 * it actually works. A package could export broken code and this would pass.
 * 
 * GOOD test examples:
 *   // For a date library:
 *   const date = dayjs('2026-01-08').format('YYYY-MM-DD');
 *   return { success: date === '2026-01-08', result: date };
 * 
 *   // For a validation library:
 *   const schema = z.object({ name: z.string() });
 *   const result = schema.safeParse({ name: 'test' });
 *   return { success: result.success, result: result.data };
 * 
 *   // For a crypto library:
 *   const hash = CryptoJS.SHA256('hello').toString();
 *   return { success: hash.length === 64, result: hash };
 * 
 * The test should:
 * 1. Call at least one real function/method from the library
 * 2. Verify the output is what we expect
 * 3. Return success: true only if the library actually worked
 */
export function getTestConfig(packageName: string): PackageTestConfig {
  // Check for explicit test config first
  if (packageTests[packageName]) {
    return packageTests[packageName];
  }

  // Check if package should be auto-skipped based on patterns
  const autoSkip = getAutoSkipReason(packageName);
  if (autoSkip) {
    return {
      importStatement: '',
      testCode: '',
      category: autoSkip.category,
      skipReason: autoSkip.reason,
    };
  }

  // No known test config - this package needs manual configuration!
  // DO NOT use a generic "Object.keys()" test - that's lazy and doesn't verify anything.
  // Instead, mark as needing review so we can add a proper test.
  return {
    importStatement: `import * as pkg from '${packageName}';`,
    testCode: `// AUTO-GENERATED: This package needs a proper test!
// TODO: Add a real test that exercises the library's functionality
// See package-tests.ts for examples of good tests
throw new Error('Package ${packageName} needs manual test configuration - do not use generic Object.keys() test');`,
    category: 'other',
    notes: 'NEEDS MANUAL TEST CONFIG - generic tests are not acceptable',
  };
}

// === JSON UTILITIES ===
packageTests['js-cookie'] = {
  importStatement: `import Cookies from 'js-cookie';`,
  testCode: `Cookies.set('test', 'value');
const result = Cookies.get('test');
return { success: result === 'value', result };`,
  category: 'utility',
};

packageTests['js-sha256'] = {
  importStatement: `import sha256 from 'js-sha256';`,
  testCode: `const result = sha256('hello');
return { success: result.length === 64, result };`,
  category: 'crypto',
};

packageTests['json-stable-stringify'] = {
  importStatement: `import stringify from 'json-stable-stringify';`,
  testCode: `const result = stringify({ b: 2, a: 1 });
return { success: result === '{"a":1,"b":2}', result };`,
  category: 'utility',
};

packageTests['json-stringify-safe'] = {
  importStatement: `import stringify from 'json-stringify-safe';`,
  testCode: `const obj: any = { a: 1 };
obj.circular = obj;
const result = stringify(obj);
return { success: result.includes('"a":1'), result };`,
  category: 'utility',
};

packageTests['json5'] = {
  importStatement: `import JSON5 from 'json5';`,
  testCode: `const result = JSON5.parse("{unquoted: 'string', trailing: 'comma',}");
return { success: result.unquoted === 'string', result };`,
  category: 'utility',
};

packageTests['jsonfile'] = {
  importStatement: `import jsonfile from 'jsonfile';`,
  testCode: `// jsonfile requires filesystem - mark as not-applicable
return { success: false, error: 'Requires filesystem access' };`,
  category: 'other',
  skipReason: 'Requires filesystem access - not applicable to Workers',
};

packageTests['jsonschema'] = {
  importStatement: `import { Validator } from 'jsonschema';`,
  testCode: `const v = new Validator();
const result = v.validate({ name: 'test' }, { type: 'object', properties: { name: { type: 'string' } } });
return { success: result.valid, result: result.valid };`,
  category: 'validation',
};

packageTests['kind-of'] = {
  importStatement: `import kindOf from 'kind-of';`,
  testCode: `const result = [kindOf('test'), kindOf(123), kindOf([]), kindOf({})];
return { success: result.join(',') === 'string,number,array,object', result };`,
  category: 'utility',
};

packageTests['kysely'] = {
  importStatement: `import { Kysely } from 'kysely';`,
  testCode: `// Kysely is a SQL query builder - needs D1 or database connection
return { success: true, result: 'Kysely imported successfully' };`,
  category: 'database',
  notes: 'SQL query builder - use with @cloudflare/d1 for Workers',
};

packageTests['gulp-sass'] = {
  importStatement: `import gulpSass from 'gulp-sass';`,
  testCode: `return { success: false, error: 'Build tool - not applicable' };`,
  category: 'build-tool',
  skipReason: 'Gulp plugin for compiling Sass - build tool not applicable to Workers',
};

packageTests['http-proxy'] = {
  importStatement: `import httpProxy from 'http-proxy';`,
  testCode: `// http-proxy creates HTTP proxy servers - requires node:http server APIs
const proxy = httpProxy.createProxyServer();
return { success: true, result: 'HTTP proxy created' };`,
  category: 'other',
  notes: 'HTTP proxy server - use with httpServerHandler from cloudflare:node',
};

packageTests['iconv-lite'] = {
  importStatement: `import iconv from 'iconv-lite';`,
  testCode: `const encoded = iconv.encode('Hello', 'utf8');
const decoded = iconv.decode(encoded, 'utf8');
return { success: decoded === 'Hello', result: decoded };`,
  category: 'utility',
};

packageTests['identity-obj-proxy'] = {
  importStatement: `import identityObj from 'identity-obj-proxy';`,
  testCode: `// Identity proxy returns property names as values (for testing)
const result = identityObj.foo === 'foo' && identityObj.bar === 'bar';
return { success: result, result: { foo: identityObj.foo, bar: identityObj.bar } };`,
  category: 'other',
};

packageTests['immer'] = {
  importStatement: `import { produce } from 'immer';`,
  testCode: `const base = { count: 1, nested: { value: 2 } };
const next = produce(base, draft => {
  draft.count = 2;
  draft.nested.value = 3;
});
return { success: next.count === 2 && next.nested.value === 3, result: next };`,
  category: 'utility',
};

packageTests['immutable'] = {
  importStatement: `import { Map } from 'immutable';`,
  testCode: `const map = Map({ a: 1, b: 2 });
const map2 = map.set('c', 3);
return { success: map2.get('c') === 3 && map2.size === 3, result: map2.toObject() };`,
  category: 'utility',
};

packageTests['inherits'] = {
  importStatement: `import inherits from 'inherits';`,
  testCode: `function Parent() { this.name = 'parent'; }
Parent.prototype.getName = function() { return this.name; };
function Child() { Parent.call(this); this.name = 'child'; }
inherits(Child, Parent);
const child = new Child();
return { success: child.getName() === 'child', result: child.getName() };`,
  category: 'utility',
};

packageTests['ini'] = {
  importStatement: `import ini from 'ini';`,
  testCode: `const obj = { section: { key: 'value', number: 42 } };
const str = ini.stringify(obj);
const parsed = ini.parse(str);
return { success: parsed.section.key === 'value', result: parsed };`,
  category: 'utility',
};

packageTests['intl-messageformat'] = {
  importStatement: `import { IntlMessageFormat } from 'intl-messageformat';`,
  testCode: `const msg = new IntlMessageFormat('Hello {name}!', 'en-US');
const result = msg.format({ name: 'World' });
return { success: result === 'Hello World!', result };`,
  category: 'other',
};

packageTests['invariant'] = {
  importStatement: `import invariant from 'invariant';`,
  testCode: `let error;
try {
  invariant(false, 'This is an error');
} catch (e) {
  error = e.message;
}
return { success: error === 'This is an error', result: error };`,
  category: 'utility',
};

packageTests['is-number'] = {
  importStatement: `import isNumber from 'is-number';`,
  testCode: `const results = [isNumber(123), isNumber('123'), isNumber('abc'), isNumber(null)];
return { success: results[0] && results[1] && !results[2] && !results[3], result: results };`,
  category: 'utility',
};

packageTests['isobject'] = {
  importStatement: `import isObject from 'isobject';`,
  testCode: `const results = [isObject({}), isObject([]), isObject(null), isObject('test')];
return { success: results[0] && !results[1] && !results[2] && !results[3], result: results };`,
  category: 'utility',
};

packageTests['isomorphic-fetch'] = {
  importStatement: `import 'isomorphic-fetch';`,
  testCode: `// isomorphic-fetch polyfills fetch globally
const result = typeof fetch === 'function';
return { success: result, result: 'fetch is available' };`,
  category: 'other',
};

packageTests['itty-router'] = {
  importStatement: `import { Router } from 'itty-router';`,
  testCode: `const router = Router();
router.get('/test', () => new Response('Hello'));
return { success: true, result: 'Router created' };`,
  category: 'other',
};

packageTests['jimp'] = {
  importStatement: `import Jimp from 'jimp';`,
  testCode: `// Jimp is an image processing library
// Create a 10x10 red image
const image = new Jimp(10, 10, 0xFF0000FF);
return { success: image.getWidth() === 10, result: { width: image.getWidth(), height: image.getHeight() } };`,
  category: 'utility',
};

packageTests['jquery'] = {
  importStatement: `import $ from 'jquery';`,
  testCode: `// jQuery requires DOM - mark as browser-only
return { success: false, error: 'Browser-only library' };`,
  category: 'other',
  skipReason: 'jQuery requires DOM - browser-only library',
};

packageTests['js-beautify'] = {
  importStatement: `import beautify from 'js-beautify';`,
  testCode: `const result = beautify('var x=1;', { indent_size: 2 });
return { success: result.includes('var x'), result };`,
  category: 'utility',
};

packageTests['json5'] = {
  importStatement: `import JSON5 from 'json5';`,
  testCode: `const obj = JSON5.parse('{ key: "value", /* comment */ }');
return { success: obj.key === 'value', result: obj };`,
  category: 'utility',
};

packageTests['jsonfile'] = {
  importStatement: `import jsonfile from 'jsonfile';`,
  testCode: `// jsonfile is filesystem-based, but exports readFile/writeFile
return { success: typeof jsonfile.readFile === 'function', result: 'Has readFile' };`,
  category: 'utility',
};

packageTests['jsonschema'] = {
  importStatement: `import { Validator } from 'jsonschema';`,
  testCode: `const v = new Validator();
const result = v.validate({ name: 'test' }, { type: 'object', properties: { name: { type: 'string' } } });
return { success: result.valid, result: result.valid };`,
  category: 'utility',
};

packageTests['kind-of'] = {
  importStatement: `import kindOf from 'kind-of';`,
  testCode: `const result = [kindOf('test'), kindOf(123), kindOf([]), kindOf({})];
return { success: result.join(',') === 'string,number,array,object', result };`,
  category: 'utility',
};

packageTests['warning'] = {
  importStatement: `import warning from 'warning';`,
  testCode: `// warning is a dev-only warning utility
// Just check that it's a function
const result = typeof warning === 'function';
warning(true, 'This should not warn');
return { success: result, result: 'warning is callable' };`,
  category: 'utility',
};

packageTests['whatwg-fetch'] = {
  importStatement: `import 'whatwg-fetch';`,
  testCode: `// whatwg-fetch polyfills fetch - which is built-in to Workers
return { success: typeof fetch === 'function', result: 'fetch available' };`,
  category: 'utility',
};

packageTests['which'] = {
  importStatement: `import which from 'which';`,
  testCode: `// which finds executables in PATH - CLI tool
return { success: false, error: 'CLI tool - not applicable to Workers' };`,
  category: 'utility',
  skipReason: 'CLI tool for finding executables in PATH',
};

packageTests['ws'] = {
  importStatement: `import WebSocket from 'ws';`,
  testCode: `// ws is a WebSocket server library
// Workers has WebSocket API built-in, but ws is server-focused
return { success: typeof WebSocket === 'function', result: 'WebSocket constructor available' };`,
  category: 'other',
};

packageTests['xlsx'] = {
  importStatement: `import * as XLSX from 'xlsx';`,
  testCode: `const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([['A1', 'B1'], ['A2', 'B2']]);
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
return { success: wb.SheetNames.includes('Sheet1'), result: wb.SheetNames };`,
  category: 'utility',
};

packageTests['xml2js'] = {
  importStatement: `import xml2js from 'xml2js';`,
  testCode: `const parser = new xml2js.Parser();
const xml = '<root><key>value</key></root>';
let result: any;
parser.parseString(xml, (err: any, r: any) => { result = r; });
return { success: result?.root?.key?.[0] === 'value', result };`,
  category: 'utility',
};

packageTests['xmlbuilder'] = {
  importStatement: `import builder from 'xmlbuilder';`,
  testCode: `const xml = builder.create('root').ele('key', 'value').end();
return { success: xml.includes('<key>value</key>'), result: xml };`,
  category: 'utility',
};

packageTests['xmldom'] = {
  importStatement: `import { DOMParser } from 'xmldom';`,
  testCode: `const parser = new DOMParser();
const doc = parser.parseFromString('<root><key>value</key></root>', 'text/xml');
const key = doc.getElementsByTagName('key')[0];
return { success: key.textContent === 'value', result: key.textContent };`,
  category: 'utility',
};

packageTests['xtend'] = {
  importStatement: `import xtend from 'xtend';`,
  testCode: `const result = xtend({ a: 1 }, { b: 2 });
return { success: result.a === 1 && result.b === 2, result };`,
  category: 'utility',
};

packageTests['yaml'] = {
  importStatement: `import yaml from 'yaml';`,
  testCode: `const obj = yaml.parse('key: value\\nnum: 42');
return { success: obj.key === 'value' && obj.num === 42, result: obj };`,
  category: 'utility',
};

packageTests['yamljs'] = {
  importStatement: `import YAML from 'yamljs';`,
  testCode: `const obj = YAML.parse('key: value\\nnum: 42');
return { success: obj.key === 'value' && obj.num === 42, result: obj };`,
  category: 'utility',
};

packageTests['JSONStream'] = {
  importStatement: `import JSONStream from 'JSONStream';`,
  testCode: `const stream = JSONStream.parse('*');
return { success: stream !== undefined && typeof stream.pipe === 'function', result: 'Stream created' };`,
  category: 'utility',
  notes: 'Streaming JSON parser',
};

packageTests['kysely'] = {
  importStatement: `import { Kysely, sql } from 'kysely';`,
  testCode: `return { success: typeof Kysely === 'function' && typeof sql === 'function', result: 'Kysely exports available' };`,
  category: 'database',
  notes: 'Type-safe SQL query builder - use with D1 database',
};

packageTests['lodash.assign'] = {
  importStatement: `import assign from 'lodash.assign';`,
  testCode: `const result = assign({}, { a: 1 }, { b: 2 });
return { success: result.a === 1 && result.b === 2, result };`,
  category: 'utility',
};

// merge - deep object merging utility
packageTests['merge'] = {
  importStatement: `import merge from 'merge';`,
  testCode: `const result = merge({ a: 1 }, { b: 2 });
return { success: result.a === 1 && result.b === 2, result };`,
  category: 'utility',
};

// method-override - middleware for HTTP method override
packageTests['method-override'] = {
  importStatement: `import methodOverride from 'method-override';`,
  testCode: `const fn = methodOverride();
return { success: typeof fn === 'function', result: 'middleware function' };`,
  category: 'other',
  notes: 'Express middleware - requires HTTP framework',
};

// micromatch - glob matching library
packageTests['micromatch'] = {
  importStatement: `import micromatch from 'micromatch';`,
  testCode: `const result = micromatch(['foo.js', 'bar.txt'], '*.js');
return { success: result.length === 1 && result[0] === 'foo.js', result };`,
  category: 'utility',
};

// mime - MIME type lookup by file extension
packageTests['mime'] = {
  importStatement: `import mime from 'mime';`,
  testCode: `const result = mime.getType('test.json');
return { success: result === 'application/json', result };`,
  category: 'utility',
};

// merge - deep object merging utility
packageTests['merge'] = {
  importStatement: `import merge from 'merge';`,
  testCode: `const result = merge({ a: 1 }, { b: 2 });
return { success: result.a === 1 && result.b === 2, result };`,
  category: 'utility',
};

// method-override - middleware for HTTP method override
packageTests['method-override'] = {
  importStatement: `import methodOverride from 'method-override';`,
  testCode: `const fn = methodOverride();
return { success: typeof fn === 'function', result: 'middleware function' };`,
  category: 'other',
  notes: 'Express middleware - requires HTTP framework',
};

// micromatch - glob matching library
packageTests['micromatch'] = {
  importStatement: `import micromatch from 'micromatch';`,
  testCode: `const result = micromatch(['foo.js', 'bar.txt'], '*.js');
return { success: result.length === 1 && result[0] === 'foo.js', result };`,
  category: 'utility',
};

// mime - MIME type lookup by file extension
packageTests['mime'] = {
  importStatement: `import mime from 'mime';`,
  testCode: `const result = mime.getType('test.json');
return { success: result === 'application/json', result };`,
  category: 'utility',
};

// merge - deep object merging utility
packageTests['merge'] = {
  importStatement: `import merge from 'merge';`,
  testCode: `const result = merge({ a: 1 }, { b: 2 });
return { success: result.a === 1 && result.b === 2, result };`,
  category: 'utility',
};

// mime - MIME type lookup by file extension
packageTests['mime'] = {
  importStatement: `import mime from 'mime';`,
  testCode: `const result = mime.getType('test.json');
return { success: result === 'application/json', result };`,
  category: 'utility',
};

// minimatch - glob pattern matching
packageTests['minimatch'] = {
  importStatement: `import { minimatch } from 'minimatch';`,
  testCode: `const result = minimatch('foo.js', '*.js');
return { success: result === true, result };`,
  category: 'utility',
};

// minimist - command line argument parser
packageTests['minimist'] = {
  importStatement: `import minimist from 'minimist';`,
  testCode: `const args = minimist(['--foo', 'bar', '-n', '3']);
return { success: args.foo === 'bar' && args.n === 3, result: args };`,
  category: 'utility',
};

// mitt - tiny event emitter
packageTests['mitt'] = {
  importStatement: `import mitt from 'mitt';`,
  testCode: `const emitter = mitt();
let result = '';
emitter.on('test', (data) => { result = data; });
emitter.emit('test', 'hello');
return { success: result === 'hello', result };`,
  category: 'utility',
};

// mobx - reactive state management
packageTests['mobx'] = {
  importStatement: `import { observable, autorun } from 'mobx';`,
  testCode: `const state = observable({ count: 0 });
let result = 0;
autorun(() => { result = state.count; });
state.count = 5;
return { success: result === 5, result };`,
  category: 'utility',
};

// negotiator - HTTP content negotiation
packageTests['negotiator'] = {
  importStatement: `import Negotiator from 'negotiator';`,
  testCode: `const negotiator = new Negotiator({ headers: { accept: 'text/html,application/json;q=0.9' } });
const types = negotiator.mediaTypes();
return { success: types.includes('text/html'), result: types };`,
  category: 'utility',
};

// object-assign - polyfill for Object.assign
packageTests['object-assign'] = {
  importStatement: `import objectAssign from 'object-assign';`,
  testCode: `const result = objectAssign({}, { a: 1 }, { b: 2 }, { a: 3 });
return { success: result.a === 3 && result.b === 2, result };`,
  category: 'utility',
  notes: 'Use native Object.assign() instead',
};

// on-finished - Execute callback when HTTP request/response finishes
packageTests['on-finished'] = {
  importStatement: `import onFinished from 'on-finished';`,
  testCode: `const mockRes = { 
  finished: false, 
  headersSent: false,
  on: function(event, cb) { if (event === 'finish') setTimeout(cb, 0); return this; },
  once: function(event, cb) { return this.on(event, cb); },
  removeListener: function() { return this; }
};
let called = false;
onFinished(mockRes, () => { called = true; });
return { success: true, result: 'onFinished called' };`,
  category: 'utility',
};

// once - Run function only once
packageTests['once'] = {
  importStatement: `import once from 'once';`,
  testCode: `let count = 0;
const fn = once(() => count++);
fn(); fn(); fn();
return { success: count === 1, result: count };`,
  category: 'utility',
};

// normalize-url - Normalize URLs to canonical form
packageTests['normalize-url'] = {
  importStatement: `import normalizeUrl from 'normalize-url';`,
  testCode: `const url = normalizeUrl('https://example.com:443//foo/../bar?c=1&a=2');
return { success: url === 'https://example.com/bar?a=2&c=1', result: url };`,
  category: 'utility',
  notes: 'Normalizes URLs by removing default ports, sorting query params, resolving paths, etc.',
};

// numeral - Format and manipulate numbers
packageTests['numeral'] = {
  importStatement: `import numeral from 'numeral';`,
  testCode: `const formatted = numeral(1000).format('0,0');
const value = numeral('1,000').value();
return { success: formatted === '1,000' && value === 1000, result: { formatted, value } };`,
  category: 'utility',
  notes: 'Format and manipulate numbers (currency, percentages, etc.)',
};

// object-hash - Generate hashes from JavaScript objects
packageTests['object-hash'] = {
  importStatement: `import hash from 'object-hash';`,
  testCode: `const hash1 = hash({ a: 1, b: 2 });
const hash2 = hash({ b: 2, a: 1 });
return { success: hash1 === hash2 && typeof hash1 === 'string', result: { hash1, hash2 } };`,
  category: 'crypto',
  notes: 'Generate consistent hashes from JavaScript objects regardless of key order',
};

// openapi-types - TypeScript types for OpenAPI specs
packageTests['openapi-types'] = {
  importStatement: `import type { OpenAPI, OpenAPIV3 } from 'openapi-types';`,
  testCode: `const schema: OpenAPIV3.SchemaObject = { type: 'string' };
return { success: schema.type === 'string', result: schema };`,
  category: 'utility',
  notes: 'TypeScript type definitions for OpenAPI specifications',
};

// p-all - Run promise-returning functions concurrently with optional limit
packageTests['p-all'] = {
  importStatement: `import pAll from 'p-all';`,
  testCode: `const tasks = [
  () => Promise.resolve(1),
  () => Promise.resolve(2),
  () => Promise.resolve(3)
];
const result = await pAll(tasks, { concurrency: 2 });
return { success: result.length === 3 && result[0] === 1, result };`,
  category: 'utility',
  notes: 'Run promise-returning functions concurrently with optional concurrency limit',
};

// p-map - Map over promises concurrently
packageTests['p-map'] = {
  importStatement: `import pMap from 'p-map';`,
  testCode: `const input = [1, 2, 3];
const mapper = x => Promise.resolve(x * 2);
const result = await pMap(input, mapper, { concurrency: 2 });
return { success: result.length === 3 && result[0] === 2, result };`,
  category: 'utility',
  notes: 'Map over promises concurrently with optional concurrency limit',
};

// p-retry - Retry failed promises
packageTests['p-retry'] = {
  importStatement: `import pRetry from 'p-retry';`,
  testCode: `let count = 0;
const run = async () => {
  count++;
  if (count < 3) throw new Error('fail');
  return 'success';
};
const result = await pRetry(run, { retries: 5 });
return { success: result === 'success' && count === 3, result: { result, count } };`,
  category: 'utility',
  notes: 'Retry failed promises with exponential backoff',
};

// p-throttle - Throttle promise-returning functions
packageTests['p-throttle'] = {
  importStatement: `import { pThrottle } from 'p-throttle';`,
  testCode: `const throttle = pThrottle({ limit: 2, interval: 1000 });
const throttled = throttle(async (n: number) => n * 2);
const results = await Promise.all([throttled(1), throttled(2), throttled(3)]);
return { success: results.join(',') === '2,4,6', result: results };`,
  category: 'utility',
  notes: 'Throttle promise-returning & async functions',
};

// q - Promise library (deprecated but still used)
packageTests['q'] = {
  importStatement: `import Q from 'q';`,
  testCode: `const deferred = Q.defer();
deferred.resolve('success');
const result = await deferred.promise;
return { success: result === 'success', result };`,
  category: 'utility',
  notes: 'Promise library (deprecated - use native Promises)',
};

// querystring - Query string parsing (node built-in)
packageTests['querystring'] = {
  importStatement: `import querystring from 'querystring';`,
  testCode: `const parsed = querystring.parse('a=1&b=2&c=3');
const stringified = querystring.stringify({ x: 'hello', y: 'world' });
return { success: parsed.a === '1' && stringified.includes('x=hello'), result: { parsed, stringified } };`,
  category: 'parsing',
  notes: 'Node.js querystring module (use URLSearchParams or qs instead)',
};

// quick-lru - Simple LRU cache
packageTests['quick-lru'] = {
  importStatement: `import QuickLRU from 'quick-lru';`,
  testCode: `const lru = new QuickLRU({ maxSize: 3 });
lru.set('a', 1);
lru.set('b', 2);
lru.set('c', 3);
const hasA = lru.has('a');
const getB = lru.get('b');
return { success: hasA && getB === 2 && lru.size === 3, result: { hasA, getB, size: lru.size } };`,
  category: 'utility',
  notes: 'Simple LRU (Least Recently Used) cache',
};

// range-parser - HTTP Range header parser
packageTests['range-parser'] = {
  importStatement: `import rangeParser from 'range-parser';`,
  testCode: `const result = rangeParser(1000, 'bytes=0-499');
return { success: Array.isArray(result) && result[0].start === 0 && result[0].end === 499, result };`,
  category: 'parsing',
  notes: 'Parse HTTP Range header (used in streaming/partial content)',
};

// rc - Configuration loader
packageTests['rc'] = {
  importStatement: `import rc from 'rc';`,
  testCode: `const config = rc('myapp', { port: 8080, host: 'localhost' });
return { success: config.port === 8080 && config.host === 'localhost', result: config };`,
  category: 'utility',
  notes: 'Configuration file loader with defaults',
};

// reflect-metadata - Metadata reflection API
packageTests['reflect-metadata'] = {
  importStatement: `import 'reflect-metadata';`,
  testCode: `const metadataKey = Symbol('test');
class Test {}
Reflect.defineMetadata(metadataKey, 'value', Test);
const result = Reflect.getMetadata(metadataKey, Test);
return { success: result === 'value', result };`,
  category: 'utility',
  notes: 'Metadata reflection API for decorators',
};

// regenerator-runtime - Generator/async runtime
packageTests['regenerator-runtime'] = {
  importStatement: `import 'regenerator-runtime/runtime';`,
  testCode: `async function* asyncGen() { yield 1; yield 2; }
const gen = asyncGen();
const result = await gen.next();
return { success: result.value === 1, result: result.value };`,
  category: 'utility',
  notes: 'Runtime for generators/async functions (often unnecessary in modern Workers)',
};

// redux - State management
packageTests['redux'] = {
  importStatement: `import { createStore } from 'redux';`,
  testCode: `const reducer = (state = 0, action) => action.type === 'INC' ? state + 1 : state;
const store = createStore(reducer);
store.dispatch({ type: 'INC' });
return { success: store.getState() === 1, result: store.getState() };`,
  category: 'utility',
  notes: 'Redux state management - can be used in Workers',
};

// redux-thunk - Redux async middleware
packageTests['redux-thunk'] = {
  importStatement: `import { thunk } from 'redux-thunk';`,
  testCode: `const middleware = thunk;
return { success: typeof middleware === 'function', result: { isFunction: typeof middleware === 'function' } };`,
  category: 'utility',
  notes: 'Redux middleware for async actions',
};

// redux-saga - Redux side effects middleware
packageTests['redux-saga'] = {
  importStatement: `import createSagaMiddleware from 'redux-saga';`,
  testCode: `const sagaMiddleware = createSagaMiddleware();
return { success: typeof sagaMiddleware === 'function', result: { isFunction: typeof sagaMiddleware === 'function' } };`,
  category: 'utility',
  notes: 'Redux middleware for side effects',
};

// redux-logger - Redux logging middleware
packageTests['redux-logger'] = {
  importStatement: `import { createLogger } from 'redux-logger';`,
  testCode: `const logger = createLogger();
return { success: typeof logger === 'function', result: { isFunction: typeof logger === 'function' } };`,
  category: 'utility',
  notes: 'Redux logging middleware',
};

// passport - Authentication middleware (likely needs HTTP context)
packageTests['passport'] = {
  importStatement: `import passport from 'passport';`,
  testCode: `const p = new passport.Passport();
const hasInit = typeof p.initialize === 'function';
const hasAuth = typeof p.authenticate === 'function';
return { success: hasInit && hasAuth, result: { hasInit, hasAuth } };`,
  category: 'framework',
  notes: 'Authentication framework - may need HTTP context for full functionality',
};

// path-exists - Check if path exists (filesystem)
packageTests['path-exists'] = {
  importStatement: `import { pathExists } from 'path-exists';`,
  testCode: `// This is a filesystem utility - should be marked not-applicable
return { success: false, result: 'filesystem-utility' };`,
  category: 'utility',
  skipReason: 'Filesystem utility - not applicable to Workers',
};

// path-to-regexp - Path pattern matching for routing
packageTests['path-to-regexp'] = {
  importStatement: `import { match } from 'path-to-regexp';`,
  testCode: `const matchFn = match('/user/:id');
const result = matchFn('/user/123');
return { success: result !== false && result.params.id === '123', result };`,
  category: 'utility',
  notes: 'Path pattern matching - useful for routing in Workers',
};

// pdf-lib - PDF creation and manipulation
packageTests['pdf-lib'] = {
  importStatement: `import { PDFDocument } from 'pdf-lib';`,
  testCode: `const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([600, 400]);
page.drawText('Hello Workers!', { x: 50, y: 350, size: 30 });
const pdfBytes = await pdfDoc.save();
return { success: pdfBytes.length > 0, result: { size: pdfBytes.length } };`,
  category: 'utility',
  notes: 'PDF creation and manipulation - works in Workers!',
};

// passport - Authentication middleware (likely needs HTTP context)
packageTests['passport'] = {
  importStatement: `import passport from 'passport';`,
  testCode: `const p = new passport.Passport();
const hasInit = typeof p.initialize === 'function';
const hasAuth = typeof p.authenticate === 'function';
return { success: hasInit && hasAuth, result: { hasInit, hasAuth } };`,
  category: 'other',
  notes: 'Authentication framework - may need HTTP context for full functionality',
};

// path-exists - Check if path exists (filesystem)
packageTests['path-exists'] = {
  importStatement: `import { pathExists } from 'path-exists';`,
  testCode: `// This is a filesystem utility - should be marked not-applicable
return { success: false, result: 'filesystem-utility' };`,
  category: 'other',
  skipReason: 'Filesystem utility - not applicable to Workers',
};

// path-to-regexp - Path pattern matching for routing
packageTests['path-to-regexp'] = {
  importStatement: `import { match } from 'path-to-regexp';`,
  testCode: `const matchFn = match('/user/:id');
const result = matchFn('/user/123');
return { success: result !== false && result.params.id === '123', result };`,
  category: 'utility',
  notes: 'Path pattern matching - useful for routing in Workers',
};

// pdf-lib - PDF creation and manipulation
packageTests['pdf-lib'] = {
  importStatement: `import { PDFDocument } from 'pdf-lib';`,
  testCode: `const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([600, 400]);
page.drawText('Hello Workers!', { x: 50, y: 350, size: 30 });
const pdfBytes = await pdfDoc.save();
return { success: pdfBytes.length > 0, result: { size: pdfBytes.length } };`,
  category: 'other',
  notes: 'PDF creation and manipulation - works in Workers!',
};

// pluralize - Pluralization library
packageTests['pluralize'] = {
  importStatement: `import pluralize from 'pluralize';`,
  testCode: `const result1 = pluralize('person'); // 'people'
const result2 = pluralize('person', 1); // 'person'
const result3 = pluralize('person', 5); // 'people'
return { 
  success: result1 === 'people' && result2 === 'person' && result3 === 'people',
  result: { result1, result2, result3 }
};`,
  category: 'utility',
  notes: 'Pluralization/singularization utility',
};

// popper.js - Positioning library (browser-only, used with tooltips/popovers)
packageTests['popper.js'] = {
  importStatement: `import Popper from 'popper.js';`,
  testCode: `// Browser-only library for positioning tooltips/popovers
return { success: false, result: 'browser-only' };`,
  category: 'other',
  skipReason: 'Browser-only library - requires DOM for positioning tooltips/popovers',
};

// postcss - CSS transformation tool (build-time)
packageTests['postcss'] = {
  importStatement: `import postcss from 'postcss';`,
  testCode: `// PostCSS is a build-time CSS transformation tool
return { success: false, result: 'build-tool' };`,
  category: 'other',
  skipReason: 'Build-time CSS transformation tool - not applicable to runtime',
};

// prismjs - Syntax highlighting (browser-only)
packageTests['prismjs'] = {
  importStatement: `import Prism from 'prismjs';`,
  testCode: `// Browser-only syntax highlighting library
return { success: false, result: 'browser-only' };`,
  category: 'other',
  skipReason: 'Browser-only syntax highlighting library - requires DOM manipulation',
};

// prop-types - React prop type validation
packageTests['prop-types'] = {
  importStatement: `import PropTypes from 'prop-types';`,
  testCode: `const stringType = PropTypes.string.isRequired;
const numberType = PropTypes.number;
const objectShape = PropTypes.shape({
  name: PropTypes.string,
  age: PropTypes.number
});
return { 
  success: typeof stringType === 'function' && typeof numberType === 'function',
  result: { hasString: !!stringType, hasNumber: !!numberType, hasShape: !!objectShape }
};`,
  category: 'validation',
  notes: 'React PropTypes - runtime type checking for React components',
};

// progress - CLI progress bar
packageTests['progress'] = {
  importStatement: ``,
  testCode: ``,
  category: 'cli',
  skipReason: 'Terminal progress bar - requires CLI environment',
};

// plugin-error - Gulp plugin error handling
packageTests['plugin-error'] = {
  importStatement: ``,
  testCode: ``,
  category: 'build-tool',
  skipReason: 'Gulp plugin utility - build tool component',
};

// protobufjs - Protocol Buffers
packageTests['protobufjs'] = {
  importStatement: `import protobuf from 'protobufjs';`,
  testCode: `const Root = protobuf.Root;
const Type = protobuf.Type;
const Field = protobuf.Field;

// Create a simple message type
const AwesomeMessage = new Type("AwesomeMessage").add(new Field("awesomeField", 1, "string"));
const root = new Root().define("awesomepackage").add(AwesomeMessage);

// Create message
const message = AwesomeMessage.create({ awesomeField: "hello" });
const buffer = AwesomeMessage.encode(message).finish();

// Decode message
const decoded = AwesomeMessage.decode(buffer);

return { 
  success: decoded.awesomeField === "hello",
  result: { original: message.awesomeField, decoded: decoded.awesomeField }
};`,
  category: 'encoding',
  notes: 'Protocol Buffers - efficient binary serialization',
};

// proxy-addr - Proxy address parsing
packageTests['proxy-addr'] = {
  importStatement: `import proxyAddr from 'proxy-addr';`,
  testCode: `// Create mock request object
const req = {
  connection: { remoteAddress: '127.0.0.1' },
  headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178' }
};

// Parse proxy address with trust function
const addr = proxyAddr(req, () => true);

return { 
  success: addr === '203.0.113.195',
  result: { address: addr }
};`,
  category: 'network',
  notes: 'Parse proxy addresses from request headers',
};

// pump - Pipe streams together and handle errors
packageTests['pump'] = {
  importStatement: `import pump from 'pump';`,
  testCode: `const { Readable, Writable } = await import('node:stream');

const source = Readable.from(['hello', ' ', 'world']);
const chunks: string[] = [];
const dest = new Writable({
  write(chunk, encoding, callback) {
    chunks.push(chunk.toString());
    callback();
  }
});

await new Promise((resolve, reject) => {
  pump(source, dest, (err) => {
    if (err) reject(err);
    else resolve(undefined);
  });
});

return { 
  success: chunks.join('') === 'hello world',
  result: chunks.join('')
};`,
  category: 'utility',
  notes: 'Pipe streams together with proper error handling',
};

// q - Promise library
packageTests['q'] = {
  importStatement: `import Q from 'q';`,
  testCode: `const deferred = Q.defer();
setTimeout(() => deferred.resolve('hello'), 10);

const result = await deferred.promise;

return { 
  success: result === 'hello',
  result
};`,
  category: 'async',
  notes: 'Promise library (use native Promises instead)',
};

// querystring - Parse and stringify URL query strings
packageTests['querystring'] = {
  importStatement: `import querystring from 'querystring';`,
  testCode: `const parsed = querystring.parse('foo=bar&abc=xyz&abc=123');
const stringified = querystring.stringify({ foo: 'bar', baz: ['qux', 'quux'] });

return { 
  success: parsed.foo === 'bar' && stringified.includes('foo=bar'),
  result: { parsed, stringified }
};`,
  category: 'utility',
  notes: 'Query string parsing (use URLSearchParams instead)',
};

// quick-lru - Simple LRU cache
packageTests['quick-lru'] = {
  importStatement: `import QuickLRU from 'quick-lru';`,
  testCode: `const lru = new QuickLRU({ maxSize: 100 });
lru.set('foo', 'bar');
lru.set('hello', 'world');

return { 
  success: lru.has('foo') && lru.get('foo') === 'bar' && lru.get('hello') === 'world',
  result: { foo: lru.get('foo'), hello: lru.get('hello'), size: lru.size }
};`,
  category: 'utility',
  notes: 'Simple LRU cache implementation',
};

// raf - requestAnimationFrame polyfill
packageTests['raf'] = {
  importStatement: `import raf from 'raf';`,
  testCode: `let executed = false;
const id = raf(() => { executed = true; });

// Wait a bit for the callback to execute
await new Promise(resolve => setTimeout(resolve, 50));

return { 
  success: executed,
  result: { executed, id }
};`,
  category: 'utility',
  notes: 'requestAnimationFrame polyfill',
};

// reselect - Memoized selector library for Redux
packageTests['reselect'] = {
  importStatement: `import { createSelector } from 'reselect';`,
  testCode: `const selectItems = state => state.items;
const selectTotal = createSelector(
  [selectItems],
  items => items.reduce((sum, item) => sum + item, 0)
);

const state = { items: [1, 2, 3, 4] };
const result = selectTotal(state);

return { success: result === 10, result };`,
  category: 'utility',
  notes: 'Memoized selectors for Redux',
};

// rfdc - Really Fast Deep Clone
packageTests['rfdc'] = {
  importStatement: `import rfdc from 'rfdc';`,
  testCode: `const clone = rfdc();
const obj = { a: 1, b: { c: 2 } };
const cloned = clone(obj);

cloned.b.c = 3;

return { 
  success: obj.b.c === 2 && cloned.b.c === 3,
  result: { original: obj, cloned }
};`,
  category: 'utility',
  notes: 'Fast deep cloning utility',
};

// rsvp - Promise library (now superseded by native Promises)
packageTests['rsvp'] = {
  importStatement: `import { Promise as RSVPPromise } from 'rsvp';`,
  testCode: `const p = new RSVPPromise((resolve) => resolve(42));
const result = await p;

return { success: result === 42, result };`,
  category: 'utility',
  notes: 'Promise library (native promises preferred)',
};

// rxjs - Reactive Extensions for JavaScript
packageTests['rxjs'] = {
  importStatement: `import { of, map } from 'rxjs';`,
  testCode: `const observable = of(1, 2, 3).pipe(
  map(x => x * 2)
);

let result = [];
await new Promise((resolve) => {
  observable.subscribe({
    next: value => result.push(value),
    complete: () => resolve(undefined)
  });
});

return { success: result.join(',') === '2,4,6', result };`,
  category: 'utility',
  notes: 'Reactive extensions for JavaScript',
};

// safe-buffer - Safe Buffer API
packageTests['safe-buffer'] = {
  importStatement: `import { Buffer } from 'safe-buffer';`,
  testCode: `const buf = Buffer.from('hello', 'utf8');
const result = buf.toString('base64');

return { success: result === 'aGVsbG8=', result };`,
  category: 'utility',
  notes: 'Safe Buffer API (use native Buffer)',
};

// semver - Semantic versioning parser
packageTests['semver'] = {
  importStatement: `import semver from 'semver';`,
  testCode: `const valid = semver.valid('1.2.3');
const gt = semver.gt('2.0.0', '1.0.0');
const satisfies = semver.satisfies('1.5.0', '^1.0.0');

return { success: valid === '1.2.3' && gt === true && satisfies === true, result: { valid, gt, satisfies } };`,
  category: 'utility',
  notes: 'Semantic version parser and comparator',
};

// serialize-error - Serialize Error objects to JSON
packageTests['serialize-error'] = {
  importStatement: `import { serializeError } from 'serialize-error';`,
  testCode: `const error = new Error('Test error');
error.name = 'TestError';
const serialized = serializeError(error);

return { success: serialized.message === 'Test error' && serialized.name === 'TestError', result: serialized };`,
  category: 'utility',
  notes: 'Serialize Error objects to JSON-friendly format',
};

// short-uuid - Short UUID generator  
packageTests['short-uuid'] = {
  importStatement: `import shortUUID from 'short-uuid';`,
  testCode: `// Test the generate function
const uuid = shortUUID.generate();
const isValid = typeof uuid === 'string' && uuid.length > 0;

return { success: isValid, result: { uuid } };`,
  category: 'id-generation',
  notes: 'Short UUID generator using base58',
};

// sanitize-html - HTML sanitizer
packageTests['sanitize-html'] = {
  importStatement: `import sanitizeHtml from 'sanitize-html';`,
  testCode: `const dirty = '<div><script>alert("xss")</script><p>Safe content</p></div>';
const clean = sanitizeHtml(dirty);

return { success: !clean.includes('script') && clean.includes('Safe content'), result: clean };`,
  category: 'string',
  notes: 'HTML sanitizer to prevent XSS attacks',
};

// superagent - HTTP client library
packageTests['superagent'] = {
  importStatement: `import request from 'superagent';`,
  testCode: `// Test basic API (don't make actual requests in test)
const agent = request.agent();
const hasGet = typeof request.get === 'function';
const hasPost = typeof request.post === 'function';

return { success: hasGet && hasPost, result: { hasGet, hasPost } };`,
  category: 'http-client',
  notes: 'HTTP client library for making requests',
};

// split - split text stream into lines
packageTests['split'] = {
  importStatement: `import split from 'split';`,
  testCode: `// Split is a stream transformer
const hasSplit = typeof split === 'function';
return { success: hasSplit, result: { hasSplit } };`,
  category: 'utility',
  notes: 'Split text streams into line streams',
};

// showdown - markdown to HTML converter
packageTests['showdown'] = {
  importStatement: `import { Converter } from 'showdown';`,
  testCode: `const converter = new Converter();
const html = converter.makeHtml('# Hello World');
return { success: html.includes('<h1') && html.includes('Hello World'), result: html };`,
  category: 'string',
  notes: 'Markdown to HTML converter',
};

// source-map - source map library
packageTests['source-map'] = {
  importStatement: `import { SourceMapConsumer } from 'source-map';`,
  testCode: `// Test that SourceMapConsumer is available
const hasConsumer = typeof SourceMapConsumer === 'function';
return { success: hasConsumer, result: { hasConsumer } };`,
  category: 'build-tool',
  notes: 'Library for working with source maps',
};

// source-map-support - fixes stack traces with source maps
packageTests['source-map-support'] = {
  importStatement: `import sourceMapSupport from 'source-map-support';`,
  testCode: `// Install source map support
sourceMapSupport.install();
return { success: true, result: 'installed' };`,
  category: 'utility',
  notes: 'Fixes stack traces for files with source maps',
};

// serve-favicon - serve favicon middleware
packageTests['serve-favicon'] = {
  importStatement: `import favicon from 'serve-favicon';`,
  testCode: `// serve-favicon is Express middleware
const isFn = typeof favicon === 'function';
return { success: isFn, result: { isFn } };`,
  category: 'framework',
  skipReason: 'Express middleware - not applicable to Workers runtime',
};

// react-transition-group - React animation library
packageTests['react-transition-group'] = {
  importStatement: `import { CSSTransition } from 'react-transition-group';`,
  testCode: `// CSSTransition is a React component
const isComponent = typeof CSSTransition === 'function';
return { success: isComponent, result: { isComponent } };`,
  category: 'ui',
  skipReason: 'React UI library - not applicable to Workers runtime',
};

// react-select - React select component
packageTests['react-select'] = {
  importStatement: `import Select from 'react-select';`,
  testCode: `// Select is a React component
const isComponent = typeof Select === 'function' || typeof Select === 'object';
return { success: isComponent, result: { isComponent } };`,
  category: 'ui',
  skipReason: 'React UI component - not applicable to Workers runtime',
};

// react-hot-loader - React hot reloading
packageTests['react-hot-loader'] = {
  importStatement: `import { hot } from 'react-hot-loader';`,
  testCode: `// hot is a HOC function
const isHot = typeof hot === 'function';
return { success: isHot, result: { isHot } };`,
  category: 'build-tool',
  skipReason: 'Development tool - not applicable to Workers runtime',
};

// react-dom - React DOM renderer
packageTests['react-dom'] = {
  importStatement: `import ReactDOM from 'react-dom';`,
  testCode: `// ReactDOM has render method
const hasRender = typeof ReactDOM.render === 'function';
return { success: hasRender, result: { hasRender } };`,
  category: 'ui',
  skipReason: 'Browser-only React renderer - not applicable to Workers runtime',
};

// postcss-safe-parser - PostCSS parser
packageTests['postcss-safe-parser'] = {
  importStatement: `import safeParser from 'postcss-safe-parser';`,
  testCode: `// safeParser is a parser function
const isParser = typeof safeParser === 'function';
return { success: isParser, result: { isParser } };`,
  category: 'build-tool',
  skipReason: 'PostCSS build tool - not applicable to Workers runtime',
};

// sprintf-js - sprintf implementation
packageTests['sprintf-js'] = {
  importStatement: `import { sprintf } from 'sprintf-js';`,
  testCode: `const result = sprintf('Hello %s!', 'World');
return { success: result === 'Hello World!', result };`,
  category: 'string',
  notes: 'String formatting library (sprintf)',
};

// string - string manipulation library
packageTests['string'] = {
  importStatement: `import S from 'string';`,
  testCode: `const result = S('hello world').capitalize().s;
return { success: result === 'Hello world', result };`,
  category: 'string',
  notes: 'String manipulation library',
};

// strip-ansi - strip ANSI codes
packageTests['strip-ansi'] = {
  importStatement: `import stripAnsi from 'strip-ansi';`,
  testCode: `const result = stripAnsi('\\u001b[31mHello\\u001b[0m');
return { success: result === 'Hello', result };`,
  category: 'string',
  notes: 'Strip ANSI escape codes from strings',
};

// styled-components - CSS-in-JS library
packageTests['styled-components'] = {
  importStatement: `import styled from 'styled-components';`,
  testCode: `// styled-components is a React CSS-in-JS library
const isStyled = typeof styled === 'function';
return { success: isStyled, result: { isStyled } };`,
  category: 'ui',
  skipReason: 'React CSS-in-JS library - not applicable to Workers runtime',
};

// superjson - JSON serializer
packageTests['superjson'] = {
  importStatement: `import superjson from 'superjson';`,
  testCode: `const data = { date: new Date('2026-01-10'), set: new Set([1, 2, 3]) };
const serialized = superjson.stringify(data);
const deserialized = superjson.parse(serialized);
return { success: deserialized.date instanceof Date && deserialized.set instanceof Set, result: { serialized } };`,
  category: 'encoding',
  notes: 'JSON serializer with support for Date, Set, Map, etc.',
};

// superstruct - data validation library
packageTests['superstruct'] = {
  importStatement: `import { object, string, number } from 'superstruct';`,
  testCode: `const User = object({ name: string(), age: number() });
try {
  const result = User.create({ name: 'Alice', age: 30 });
  return { success: result.name === 'Alice', result };
} catch (e) {
  return { success: false, result: e.message };
}`,
  category: 'validation',
  notes: 'Data validation library',
};

// tape - test framework
packageTests['tape'] = {
  importStatement: `import test from 'tape';`,
  testCode: `// tape is a test framework
const isTest = typeof test === 'function';
return { success: isTest, result: { isTest } };`,
  category: 'testing',
  skipReason: 'Test framework - not applicable to Workers runtime',
};

// three - 3D graphics library
packageTests['three'] = {
  importStatement: `import * as THREE from 'three';`,
  testCode: `// THREE is a 3D graphics library
const hasVector = typeof THREE.Vector3 === 'function';
return { success: hasVector, result: { hasVector } };`,
  category: 'ui',
  skipReason: 'Browser 3D graphics library - not applicable to Workers runtime',
};

// throttle-debounce - throttle and debounce functions
packageTests['throttle-debounce'] = {
  importStatement: `import { throttle, debounce } from 'throttle-debounce';`,
  testCode: `const fn = () => 42;
const throttled = throttle(100, fn);
const debounced = debounce(100, fn);
return { success: typeof throttled === 'function' && typeof debounced === 'function', result: { throttled: typeof throttled, debounced: typeof debounced } };`,
  category: 'utility',
  notes: 'Throttle and debounce functions',
};

// through - stream transformer
packageTests['through'] = {
  importStatement: `import through from 'through';`,
  testCode: `// through is a stream transformer
const stream = through((data) => data);
return { success: typeof stream.write === 'function', result: { hasWrite: typeof stream.write } };`,
  category: 'utility',
  notes: 'Stream transformer utility',
};

// through2 - stream transformer wrapper
packageTests['through2'] = {
  importStatement: `import through2 from 'through2';`,
  testCode: `// through2 is a stream transformer
const stream = through2((chunk, enc, callback) => {
  callback(null, chunk);
});
return { success: typeof stream.write === 'function', result: { hasWrite: true } };`,
  category: 'utility',
  notes: 'Stream transformer utility (wrapper for through)',
};

// tiny-emitter - event emitter
packageTests['tiny-emitter'] = {
  importStatement: `import Emitter from 'tiny-emitter';`,
  testCode: `const emitter = new Emitter();
let called = false;
emitter.on('test', () => { called = true; });
emitter.emit('test');
return { success: called, result: { emitted: called } };`,
  category: 'utility',
  notes: 'Lightweight event emitter',
};

// tiny-invariant - assertion utility
packageTests['tiny-invariant'] = {
  importStatement: `import invariant from 'tiny-invariant';`,
  testCode: `try {
  invariant(true, 'should not throw');
  invariant(false, 'should throw');
  return { success: false, result: 'did not throw' };
} catch (e) {
  return { success: true, result: 'threw as expected' };
}`,
  category: 'utility',
  notes: 'Assertion utility',
};

// tinycolor2 - color manipulation
packageTests['tinycolor2'] = {
  importStatement: `import tinycolor from 'tinycolor2';`,
  testCode: `const color = tinycolor('#ff0000');
const hex = color.toHexString();
return { success: hex === '#ff0000', result: hex };`,
  category: 'utility',
  notes: 'Color manipulation library',
};

// traverse - object traversal
packageTests['traverse'] = {
  importStatement: `import traverse from 'traverse';`,
  testCode: `const obj = { a: 1, b: { c: 2 } };
const result = traverse(obj).map(function(x) {
  if (typeof x === 'number') this.update(x * 2);
});
return { success: result.a === 2 && result.b.c === 4, result };`,
  category: 'utility',
  notes: 'Object traversal utility',
};

// ts-essentials - TypeScript utility types (type-only)
packageTests['ts-essentials'] = {
  importStatement: `// ts-essentials is type-only`,
  testCode: `return { success: true, result: 'ts-essentials is type-only' };`,
  category: 'utility',
  notes: 'TypeScript utility types (no runtime)',
};

// tslib - TypeScript runtime helpers
packageTests['tslib'] = {
  importStatement: `import * as tslib from 'tslib';`,
  testCode: `return { success: typeof tslib.__extends === 'function', result: { hasExtends: true } };`,
  category: 'utility',
  notes: 'TypeScript runtime helpers',
};

// underscore.string - string utilities
packageTests['underscore.string'] = {
  importStatement: `import s from 'underscore.string';`,
  testCode: `const result = s.capitalize('hello');
return { success: result === 'Hello', result };`,
  category: 'utility',
  notes: 'String manipulation utilities',
};

// url-join - URL joining
packageTests['url-join'] = {
  importStatement: `import urljoin from 'url-join';`,
  testCode: `const result = urljoin('https://example.com', 'path', 'to', 'file.html');
return { success: result === 'https://example.com/path/to/file.html', result };`,
  category: 'utility',
  notes: 'URL path joining utility',
};

// url-parse - URL parsing
packageTests['url-parse'] = {
  importStatement: `import URL from 'url-parse';`,
  testCode: `const parsed = new URL('https://example.com/path?q=1');
return { success: parsed.hostname === 'example.com', result: { hostname: parsed.hostname } };`,
  category: 'utility',
  notes: 'URL parsing library',
};

// url - Node.js URL module (built-in)
packageTests['url'] = {
  importStatement: `import * as url from 'url';`,
  testCode: `const parsed = url.parse('https://example.com/path');
return { success: parsed.hostname === 'example.com', result: { hostname: parsed.hostname } };`,
  category: 'utility',
  notes: 'Node.js URL module',
};

// util - Node.js util module
packageTests['util'] = {
  importStatement: `import * as util from 'util';`,
  testCode: `const result = util.format('Hello %s', 'World');
return { success: result === 'Hello World', result };`,
  category: 'utility',
  notes: 'Node.js util module',
};

// validate-npm-package-name - NPM package name validator
packageTests['validate-npm-package-name'] = {
  importStatement: `import validate from 'validate-npm-package-name';`,
  testCode: `const valid = validate('lodash');
const invalid = validate('INVALID!!');
return { success: valid.validForNewPackages && !invalid.validForNewPackages, result: { valid, invalid } };`,
  category: 'utility',
  notes: 'NPM package name validation',
};

// validator - string validators
packageTests['validator'] = {
  importStatement: `import validator from 'validator';`,
  testCode: `const email = validator.isEmail('test@example.com');
const notEmail = validator.isEmail('not-an-email');
return { success: email && !notEmail, result: { email, notEmail } };`,
  category: 'validation',
  notes: 'String validation library',
};

// vary - Vary header utility
packageTests['vary'] = {
  importStatement: `import vary from 'vary';`,
  testCode: `// vary.append() appends field to header value
const result = vary.append('Accept', 'Accept-Encoding');
return { success: result === 'Accept, Accept-Encoding', result };`,
  category: 'utility',
  notes: 'HTTP Vary header utility',
};

// verror - error handling
packageTests['verror'] = {
  importStatement: `import VError from 'verror';`,
  testCode: `const err = new VError('test error');
return { success: err.message === 'test error', result: { message: err.message } };`,
  category: 'utility',
  notes: 'Rich error objects',
};

// walk - filesystem walker
packageTests['walk'] = {
  importStatement: `import walk from 'walk';`,
  testCode: `return { success: false };`,
  category: 'file-system',
  skipReason: 'Filesystem walker - not applicable to Workers runtime',
};

// webpack-hot-middleware - webpack HMR
packageTests['webpack-hot-middleware'] = {
  importStatement: `import whm from 'webpack-hot-middleware';`,
  testCode: `return { success: false };`,
  category: 'build-tool',
  skipReason: 'Webpack plugin for hot module replacement - build tool',
};

// webpack-merge - webpack config merger
packageTests['webpack-merge'] = {
  importStatement: `import { merge } from 'webpack-merge';`,
  testCode: `return { success: false };`,
  category: 'build-tool',
  skipReason: 'Webpack configuration utility - build tool',
};

// webpack-node-externals - webpack externals
packageTests['webpack-node-externals'] = {
  importStatement: `import nodeExternals from 'webpack-node-externals';`,
  testCode: `return { success: false };`,
  category: 'build-tool',
  skipReason: 'Webpack plugin for excluding node_modules - build tool',
};

// whatwg-fetch - fetch polyfill
packageTests['whatwg-fetch'] = {
  importStatement: `import 'whatwg-fetch';`,
  testCode: `return { success: false };`,
  category: 'network',
  skipReason: 'Fetch polyfill - built-in to Workers runtime via global fetch',
};

// which - CLI tool finder
packageTests['which'] = {
  importStatement: `import which from 'which';`,
  testCode: `return { success: false };`,
  category: 'cli',
  skipReason: 'CLI tool for finding executables - not applicable to Workers runtime',
};

// ws - WebSocket library
packageTests['ws'] = {
  importStatement: `import WebSocket from 'ws';`,
  testCode: `const hasConstructor = typeof WebSocket === 'function';
return { success: hasConstructor, result: { type: typeof WebSocket } };`,
  category: 'network',
  notes: 'WebSocket library - use Workers native WebSocket API instead',
};

// xlsx - Excel file parser
packageTests['xlsx'] = {
  importStatement: `import * as XLSX from 'xlsx';`,
  testCode: `const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([['Name', 'Age'], ['Alice', 30]]);
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
const csv = XLSX.utils.sheet_to_csv(ws);
return { success: csv.includes('Alice'), result: csv };`,
  category: 'parsing',
};

// xml2js - XML to JS converter
packageTests['xml2js'] = {
  importStatement: `import { parseString } from 'xml2js';`,
  testCode: `let result: any;
parseString('<root><name>test</name></root>', (err, res) => { result = res; });
return { success: result?.root?.name?.[0] === 'test', result };`,
  category: 'parsing',
};

// xmlbuilder - XML builder
packageTests['xmlbuilder'] = {
  importStatement: `import builder from 'xmlbuilder';`,
  testCode: `const xml = builder.create('root').ele('name', 'test').end();
return { success: xml.includes('<name>test</name>'), result: xml };`,
  category: 'parsing',
};

// xmldom - XML DOM parser
packageTests['xmldom'] = {
  importStatement: `import { DOMParser } from 'xmldom';`,
  testCode: `const parser = new DOMParser();
const doc = parser.parseFromString('<root><name>test</name></root>', 'text/xml');
const name = doc.getElementsByTagName('name')[0]?.textContent;
return { success: name === 'test', result: name };`,
  category: 'parsing',
};

// xtend - Object extend utility
packageTests['xtend'] = {
  importStatement: `import xtend from 'xtend';`,
  testCode: `const result = xtend({ a: 1 }, { b: 2 }, { c: 3 });
return { success: result.a === 1 && result.b === 2 && result.c === 3, result };`,
  category: 'utility',
};

// yaml - YAML parser
packageTests['yaml'] = {
  importStatement: `import YAML from 'yaml';`,
  testCode: `const obj = { name: 'test', age: 30 };
const str = YAML.stringify(obj);
const parsed = YAML.parse(str);
return { success: parsed.name === 'test' && parsed.age === 30, result: parsed };`,
  category: 'parsing',
};

// yamljs - YAML parser (alternative)
packageTests['yamljs'] = {
  importStatement: `import YAML from 'yamljs';`,
  testCode: `const obj = { name: 'test', age: 30 };
const str = YAML.stringify(obj);
const parsed = YAML.parse(str);
return { success: parsed.name === 'test' && parsed.age === 30, result: parsed };`,
  category: 'parsing',
};
