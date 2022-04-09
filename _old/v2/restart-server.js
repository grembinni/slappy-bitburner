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
		var hackRam = ns.getScriptRam("hack-server.js");
		if (availableRam > (growRam + weakenRam + hackRam)) {
			var threads = getThreadcount(availableRam, growRam, weakenRam, hackRam);
			ns.tprint(targetServer + " " + threads[0] + " " + threads[1] + " " + threads[2]);
			await startScript(ns, "grow-server.js", targetServer, threads[0]);
			await startScript(ns, "weaken-server.js", targetServer, threads[1]);
			await startScript(ns, "hack-server.js", targetServer, threads[2]);
		} else {
			ns.tprint("not enough ram to restart " + targetServer);
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
function getThreadcount(availableRam, growRam, weakenRam, hackRam) {

	var [growWeight, weakenWeight, hackWeight] = [7*growRam, 2*weakenRam, 1*hackRam];
	var baseWeight = growWeight + weakenWeight + hackWeight;
	var baseRam = availableRam - growRam - weakenRam - hackRam;
	var [growRatio, weakenRatio, hackRatio] = [growWeight/baseWeight, weakenWeight/baseWeight, hackWeight/baseWeight];
	var growCount = 1 + parseInt(baseRam*growRatio/growRam);
	var weakenCount = 1 + parseInt(baseRam*weakenRatio/weakenRam);
	var hackCount = 1 + parseInt(baseRam*hackRatio/hackRam);

	return [growCount, weakenCount, hackCount];
}

/** todo */
function startScript(ns, script, targetServer, threads) {
	ns.exec(script, targetServer, threads, targetServer);
}