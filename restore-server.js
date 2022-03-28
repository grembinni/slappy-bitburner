/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	const hostServer = ns.args[0] ?? "home";	
	// get connected servers
	const targetServers = await ns.scan(hostServer);
	ns.tprint(targetServers);
	// push scripts
	for (var i = 0; i < targetServers.length; i++) {
		var targetServer = targetServers[i];
		await prepServer(ns, targetServer);
		var availableRam = await getAvailableRam(ns, targetServer);
		var growRam = ns.getScriptRam("grow-server.js");	
		var weakenRam = ns.getScriptRam("weaken-server.js");
		if (availableRam > (growRam + weakenRam)) {
			var threads = getGrowThreadcount(availableRam, growRam, weakenRam);
			await startScript(ns, "grow-server.js", targetServer, threads);
			await startScript(ns, "weaken-server.js", targetServer, 1);
		} else {
			ns.tprint("not enough ram to restore " + targetServer);
		}
	}
}

/** todo */
async function prepServer(ns, server) {
	// verify there is memory before starting script
	await ns.run("clone-script.js", 1, server);
	await ns.scriptKill("grow-server.js", server);
	await ns.scriptKill("weaken-server.js", server);
	await ns.scriptKill("hack-server.js", server);
	await ns.sleep(1000);
}

/** todo */
async function getAvailableRam(ns, server) {
	var serverMaxRam = await ns.getServerMaxRam(server);
	var serverUsedRam = await ns.getServerUsedRam(server);
	return serverMaxRam - serverUsedRam
}

/** todo */
function getGrowThreadcount(availableRam, growRam, weakenRam) {
	var remainingRam = availableRam - weakenRam;
	return parseInt(remainingRam/growRam);
}

/** todo */
function startScript(ns, script, targetServer, threads) {
	ns.exec(script, targetServer, threads, targetServer);
}