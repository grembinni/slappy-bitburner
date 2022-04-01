/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	const targetServer = ns.args[0] ?? 'n00dles';
	const sourceServer = ns.args[1] ?? 'home';
	const sourceDir = ns.args[2] ?? '';
	const fileType = ns.args[2] ?? '.js';
	// parse arguments
	var files = await ns.ls(sourceServer, fileType);
	files = filterFiles(ns, files, sourceDir);
	// copy scripts
	await ns.scp(files, targetServer);
}

/** todo */
function filterFiles(ns, files, sourceDir) {
	if (sourceDir === '') {
		files = files.filter(file => !file.includes('/'));
	} else {
		files = files.filter(file => file.includes(sourceDir));
	}
	return files;
}