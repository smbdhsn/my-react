import path from 'path';
import fs from 'fs';
import cjs from '@rollup/plugin-commonjs';
import ts from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';

const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}
	return `${pkgPath}/${pkgName}`;
}

export function getPackageJSON(pkgName) {
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const str = fs.readFileSync(path, { encoding: 'utf-8' });
	return JSON.parse(str);
}

export function getBaseRollUpPlugins(params) {
	const opts = params || {
		alias: {
			__DEV__: true,
			preventAssignment: true
		},
		typescript: {}
	};
	const { alias, typescript } = opts;
	return [replace(alias), cjs(), ts(typescript)];
}
