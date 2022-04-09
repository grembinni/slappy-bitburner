/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	const hostServer = ns.args[0] ?? 'home';	
	// get connected servers
	const targetServers = await ns.scan(hostServer);
	ns.tprint(targetServers);
	// restart all servers
	for (const targetServer of targetServers) {
		await prepServer(ns, targetServer);
		var weakenRam = ns.getScriptRam('weaken-server.js');
		var hackRam = ns.getScriptRam('weednfeed.js');
		var availableRam = await getAvailableRam(ns, targetServer);
		if (availableRam >= (weakenRam + hackRam)) {
			await startScript(ns, hostServer, targetServer, 'weednfeed.js', .8);
			await startScript(ns, hostServer, targetServer, 'weaken-server.js', 1);
		} else {
			ns.tprint('not enough ram to restart ' + targetServer);
		}
	}
}

/** todo */
async function prepServer(ns, server) {
	// verify there is memory before starting script
	await ns.scriptKill('weednfeed.js', server);
	await ns.scriptKill('weaken-server.js', server);
	await ns.run('clone-scripts.js', 1, server);
	await ns.sleep(1000);
}

/** todo */
async function getAvailableRam(ns, server) {
	var serverMaxRam = await ns.getServerMaxRam(server);
	var serverUsedRam = await ns.getServerUsedRam(server);
	return serverMaxRam - serverUsedRam
}

/** todo */
async function startScript(ns, server, targetServer, script, systemUsage) {
	await ns.exec('run-script.js', server, 1, targetServer, script, systemUsage, targetServer);
	await ns.sleep(1000);
}