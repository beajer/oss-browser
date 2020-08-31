const shell = require("shelljs");
const { version, name } = require("../package.json");

shell.exec("npm run build");
shell.cd("dist");
shell.exec("npm i");
shell.cd("../");
