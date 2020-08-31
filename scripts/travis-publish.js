const shell = require("shelljs");
const { version, name } = require("../package.json");

shell.exec("npm run build");
shell.cd("dist");
shell.exec("npm i");
shell.cd("../");

const makePlatform = {
  windows: "win64",
  osx: "mac",
  linux: "linux64",
};
shell.exec(`make ${makePlatform[process.platform]}`);
shell.mkdir("-p", `releases/${version}/${process.platform}-x64`);
shell.cp(
  `build/${name}-${process.platform}-x64/resources/app.asar`,
  `releases/${version}/${process.platform}-x64`
);
