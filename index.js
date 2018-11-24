const isSet = obj => obj instanceof Set;
const isMap = obj => obj instanceof Map;
const mapIteratorProto = (new Map())[Symbol.iterator]().__proto__;
const setIteratorProto = (new Set())[Symbol.iterator]().__proto__;
const isSetIterator = obj => obj.__proto__ === setIteratorProto;
const isMapIterator = obj => obj.__proto__ === mapIteratorProto;
function previewEntries(iterator, isMap) {
	const result = [];
	if (isMap) {
		result[1] = true;
		result[0] = [];
	}
	var state = iterator.next();
	if (isMap) {
		while (!state.done) {
			result[0].push(state.value[0]);
			result[0].push(state.value[1]);
			state = iterator.next();
		}
	} else {
		while (!state.done) {
			result.push(state.value);
			state = iterator.next();
		}
	}
	return result;
}
// Copyright Node.js contributors. All rights reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

const hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
// Original colorRegExp and removeColors taken from: https://github.com/nodejs/node/blob/e0893f03c3e41c32eba29390a866d722fbb1dd7f/lib/internal/util.js
const colorRegExp = /\u001b\[\d\d?m/g; // eslint-disable-line no-control-regex
function removeColors(str) {
	return str.replace(colorRegExp, '');
}
// Original cliTable taken from: https://github.com/nodejs/node/blob/4270c13426fb8d86f1068735006b95bb614e9f38/lib/internal/cli_table.js
const tableChars = {
	/* eslint-disable node-core/non-ascii-character */
	middleMiddle: '─',
	rowMiddle: '┼',
	topRight: '┐',
	topLeft: '┌',
	leftMiddle: '├',
	topMiddle: '┬',
	bottomRight: '┘',
	bottomLeft: '└',
	bottomMiddle: '┴',
	rightMiddle: '┤',
	left: '│ ',
	right: ' │',
	middle: ' │ ',
	/* eslint-enable node-core/non-ascii-character */
};
const countSymbols = (string) => {
	const normalized = removeColors(string);
	return normalized.length;
};
const renderRow = (row, columnWidths) => {
	let out = tableChars.left;
	for (var i = 0; i < row.length; i++) {
		const cell = row[i];
		const len = countSymbols(cell);
		const needed = (columnWidths[i] - len) / 2;
		// round(needed) + ceil(needed) will always add up to the amount
		// of spaces we need while also left justifying the output.
		out += `${' '.repeat(needed)}${cell}${' '.repeat(Math.ceil(needed))}`;
		if (i !== row.length - 1)
			out += tableChars.middle;
	}
	out += tableChars.right;
	return out;
};
function cliTable(head, columns) {
	const rows = [];
	const columnWidths = head.map((h) => countSymbols(h));
	const longestColumn = columns.reduce((n, a) => Math.max(n, a.length), 0);

	for (var i = 0; i < head.length; i++) {
		const column = columns[i];
		for (var j = 0; j < longestColumn; j++) {
			if (rows[j] === undefined)
				rows[j] = [];
			const value = rows[j][i] = hasOwnProperty(column, j) ? column[j] : '';
			const width = columnWidths[i] || 0;
			const counted = countSymbols(value);
			columnWidths[i] = Math.max(width, counted);
		}
	}
	const divider = columnWidths.map(len => Math.ceil(len)).map((len) => tableChars.middleMiddle.repeat(len + 2));
	let result = `${tableChars.topLeft}${divider.join(tableChars.topMiddle)}` +
		`${tableChars.topRight}\n${renderRow(head, columnWidths)}\n` +
		`${tableChars.leftMiddle}${divider.join(tableChars.rowMiddle)}` +
		`${tableChars.rightMiddle}\n`;
	for (const row of rows) result += `${renderRow(row, columnWidths)}\n`;

	result += `${tableChars.bottomLeft}${divider.join(tableChars.bottomMiddle)}` + tableChars.bottomRight;
	return result;
}
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Original table taken from: https://github.com/nodejs/node/blob/4270c13426fb8d86f1068735006b95bb614e9f38/lib/console.js
const keyKey = 'Key';
const valuesKey = 'Values';
const indexKey = '(index)';
const iterKey = '(iteration index)';
const util = require('util');
const isArray = Array.isArray;
const ArrayIsArray = Array.isArray;
const ArrayFrom = Array.from;
const ObjectKeys = Object.keys;
const ObjectValues = Object.values;
module.exports = function table(tabularData, properties) {
	if (properties !== undefined && !ArrayIsArray(properties)) throw new TypeError("\"properties\" must be an Array");
	const final = (k, v) => cliTable(k, v);
	if (tabularData === null || typeof tabularData !== 'object') return final(tabularData);
	const inspect = (v) => {
		const opt = { depth: 0, maxArrayLength: 3 };
		if (v !== null && typeof v === 'object' && !isArray(v) && ObjectKeys(v).length > 2) opt.depth = -1;
		return util.inspect(v, opt);
	};
	const getIndexArray = (length) => ArrayFrom({ length }, (_, i) => inspect(i));
	const mapIter = isMapIterator(tabularData);
	let isKeyValue = false;
	let i = 0;
	if (mapIter) {
		const res = previewEntries(tabularData, true);
		tabularData = res[0];
		isKeyValue = res[1];
	}
	if (isKeyValue || isMap(tabularData)) {
		const keys = [];
		const values = [];
		let length = 0;
		if (mapIter) {
			for (; i < tabularData.length / 2; ++i) {
				keys.push(inspect(tabularData[i * 2]));
				values.push(inspect(tabularData[i * 2 + 1]));
				length++;
			}
		} else {
			for (const [k, v] of tabularData) {
				keys.push(inspect(k));
				values.push(inspect(v));
				length++;
			}
		}
		return final([
			iterKey, keyKey, valuesKey
		], [
				getIndexArray(length),
				keys,
				values,
			]);
	}
	const setIter = isSetIterator(tabularData);
	if (setIter) tabularData = previewEntries(tabularData);
	const setlike = setIter || (mapIter && !isKeyValue) || isSet(tabularData);
	if (setlike) {
		const values = [];
		let length = 0;
		for (const v of tabularData) {
			values.push(inspect(v));
			length++;
		}
		return final([setlike ? iterKey : indexKey, valuesKey], [
			getIndexArray(length),
			values,
		]);
	}
	const map = {};
	let hasPrimitives = false;
	const valuesKeyArray = [];
	const indexKeyArray = ObjectKeys(tabularData);
	for (; i < indexKeyArray.length; i++) {
		const item = tabularData[indexKeyArray[i]];
		const primitive = item === null || (typeof item !== 'function' && typeof item !== 'object');
		if (properties === undefined && primitive) {
			hasPrimitives = true;
			valuesKeyArray[i] = inspect(item);
		} else {
			const keys = properties || ObjectKeys(item);
			for (const key of keys) {
				if (map[key] === undefined) map[key] = [];
				if ((primitive && properties) || !hasOwnProperty(item, key)) map[key][i] = '';
				else map[key][i] = item == null ? item : inspect(item[key]);
			}
		}
	}
	const keys = ObjectKeys(map);
	const values = ObjectValues(map);
	if (hasPrimitives) {
		keys.push(valuesKey);
		values.push(valuesKeyArray);
	}
	keys.unshift(indexKey);
	values.unshift(indexKeyArray);
	return final(keys, values);
};
