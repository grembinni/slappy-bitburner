/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	const hostServer = ns.args[0] ?? "n00dles";	
	// get connected servers
	const targetServers = await ns.scan(hostServer);
	// push scripts
	for (var i = 0; i < targetServers.length; i++) {
		var targetServer = targetServers[i];
		var availableRam = await getAvailableRam(ns, targetServer);
		var growRam = ns.getScriptRam("grow-server.js");		
		var weakenRam = ns.getScriptRam("weaken-server.js");
		var hackRam = ns.getScriptRam("hack-server.js");
		await prepServer(ns, targetServer);
		ns.tprint(availableRam);
		ns.tprint(growRam + weakenRam + hackRam);
		if (availableRam > (growRam + weakenRam + hackRam)) {
			var hackThreads = getHackThreadcount(availableRam, growRam, weakenRam, hackRam);	
			await startScript(ns, "grow-server.js", targetServer, 1);
			await startScript(ns, "weaken-server.js", targetServer, 1);
			await startScript(ns, "hack-server.js", targetServer, hackThreads);
		} else {
			ns.tprint("not enough ram to restart " + targetServer);
		}
	}
}

/** todo */
async function prepServer(ns, server) {
	await ns.run("clone-script.js", 1, server);
	await ns.sleep(1000);
}

/** todo */
async function getAvailableRam(ns, server) {
	var serverMaxRam = await ns.getServerMaxRam(server);
	var serverUsedRam = await ns.getServerUsedRam(server);
	return serverMaxRam - serverUsedRam
}

/** todo */
function getHackThreadcount(availableRam, growRam, weakenRam, hackRam) {
	var remainingRam = availableRam - growRam - weakenRam;
	return parseInt(remainingRam/hackRam);
}

/** todo */
function startScript(ns, script, targetServer, threads) {
	ns.exec(script, targetServer, threads, targetServer);
}