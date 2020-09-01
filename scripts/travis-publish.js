const shell = require("shelljs");
const path = require("path");
const OSS = require("ali-oss");
const { version, name } = require("../package.json");
const ELECTRON_VERSION = require("electron/package.json").version;
const ELECTRON_MIRROR = "http://npm.taobao.org/mirrors/electron/";

const env = {};
for (let i = 2; i < process.argv.length; i++) {
  const [key, value] = process.argv[i].split("=");
  env[key] = value;
}

const OUT = "build";
const BUILD_PATH = path.join(
  __dirname,
  `../${OUT}/${name}-${process.platform}-${process.arch}`
);
shell.mkdir("releases/");
const ZIP_PATH = path.join(
  __dirname,
  `../releases/${version}-${name}-${process.platform}-${process.arch}.zip`
);

shell.exec("npm run build");
shell.cd("dist");
shell.exec("npm i");
shell.cd("../");
shell.exec(
  `ELECTRON_MIRROR=${ELECTRON_MIRROR} npx electron-packager ./dist ${name} --asar.unpack="*.node" --overwrite --out=${OUT} --electron-version ${ELECTRON_VERSION} --app-version ${version} --platform=${process.platform} --arch=${process.arch}`
);
shell.cp("-rf", "custrom/", `${BUILD_PATH}/resources`);
shell.rm("-f", ZIP_PATH);
shell.exec(`node scripts/zip.js ${ZIP_PATH} ${BUILD_PATH}`);

const store = new OSS({
  accessKeyId: env.AK_ID,
  accessKeySecret: env.AK_SECRET,
  bucket: "beajer-test",
});

const zip_name = `${version}/${name}-${process.platform}-${process.arch}.zip`;
const asar_name = `${version}/${name}-${process.platform}-${process.arch}.asar`;
Promise.all([
  store.multipartUpload(zip_name, ZIP_PATH),
  store.multipartUpload(
    asar_name,
    process.platform === "darwin"
      ? `${BUILD_PATH}/${name}.app/Contents/Resources/app.asar`
      : `${BUILD_PATH}/resources/app.asar`
  ),
])
  .then(() => {
    console.log(`Upload ${zip_name}, ${asar_name} success!`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
