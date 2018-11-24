# nodeStringTable
A fork of the [`console.table`](https://nodejs.org/api/console.html#console_console_table_tabulardata_properties) and `cli_table.js` NodeJS source code which returns Strings, and works in web browsers.

This module works almost exactly like the NodeJS [`console.table`](https://nodejs.org/api/console.html#console_console_table_tabulardata_properties), with the main difference being that it returns a string rather than logging it to the console.

## Usage

You can use the table function exactly like the NodeJS [`console.table`](https://nodejs.org/api/console.html#console_console_table_tabulardata_properties), but you must store the result as a string.

When using the web browser bundles, the module is available via the `nsTable` global.

```JavaScript
const nsTable = require("nodestringtable");
const tabularData = {
	firstName: "John",
	lastName: "Smith"
}
const table = nsTable(tabularData);
/* Creates a String table like this:
┌───────────┬─────────┐
│  (index)  │ Values  │
├───────────┼─────────┤
│ firstName │ 'John'  │
│ lastName  │ 'Smith' │
└───────────┴─────────┘
*/
```

## Building for Browsers

Bundle `index.js` with Browserify in standalone mode, which should include a copy of the NodeJS `util` module to be used inside this module. The main bundle (`nsTable.js`) and an UglifyJS2 minified version (`nsTable.min.js`) will be saved to the `dist` directory.

You can just run the included NPM script which does this:

```bash
npm run bundle
```