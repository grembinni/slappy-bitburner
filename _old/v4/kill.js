/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	const targetServer = ns.args[0] ?? 'n00dles';
	
	await startScript(ns, 'home', targetServer, 'growtohack.js', .9);
	await startScript(ns, 'home', targetServer, 'weaken.js', 1);
}

/** todo */
async function startScript(ns, server, targetServer, script, systemUsage) {
	await ns.exec('threadedrun.js', server, 1, server, script, systemUsage, targetServer);
	await ns.sleep(500);
}