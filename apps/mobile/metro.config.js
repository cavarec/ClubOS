// Config Metro pour monorepo pnpm — sans ça, Metro ne surveille que
// apps/mobile/ et ne sait pas résoudre les paquets du workspace
// (@clubos/database) liés par symlink dans le node_modules racine géré par
// pnpm. Cf. https://docs.expo.dev/guides/monorepos/
//
// watchFolders volontairement limité à packages/ (le code source des
// dépendances du workspace) plutôt qu'à toute la racine du monorepo : le
// node_modules racine (pnpm, tous paquets confondus) est trop volumineux et
// fait dépasser des minutes à Metro pour le scanner sans Watchman installé.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.resolve(workspaceRoot, "packages")];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
