/** @param {NS} ns **/
export async function main(ns) {
	// parse arguments
	var targetDir = ns.args[0] ?? '/temp';
	var sourceDir = ns.args[1] ?? '';
	var fileType = ns.args[2] ?? '.js';
	var server = ns.args[3] ?? 'home';

	var files = await ns.ls(server, fileType);
	files = filterFiles(ns, files, sourceDir);
	for (const file of files) {
		ns.tprint(server +' '+ file +' '+ targetDir+file);
		ns.mv(server, file, targetDir+file);
	}
}

/** todo */
function filterFiles(ns, files, sourceDir) {
	if (sourceDir === '') {
		files = files.filter(file => !file.includes('/'));
		files = files.filter(file => (file != 'move.js'));
	} else {
		files = files.filter(file => file.includes(sourceDir));
	}
	return files;
}