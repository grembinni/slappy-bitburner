/** @param {NS} ns */
export async function main(ns) {
	let server = ns.args[0];
	let files = [];
	let lookup = [];
	lookup = await lookupFiles(ns, server, '.lit');
	files.push(...lookup);
	lookup = await lookupFiles(ns, server, '.txt');
	files.push(...lookup);
	lookup = await lookupFiles(ns, server, '.msg');
	files.push(...lookup);
	if (files.length > 0) {
		await ns.scp(files, 'home');
	}
}

async function lookupFiles(ns, server, fileType) {
	
	let _files = ns.ls(server, fileType);
	let _lookup = [];
	if (_files) {
		_lookup.push(..._files);
	}
	return _lookup;
}