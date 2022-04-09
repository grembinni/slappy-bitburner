/** run script on single thread **/
export async function runSingle(ns, script, _args) {
	// parse arguments
	var args = _args ?? [];
	// run script
	await ns.run(script, 1, ...args);
}

/** calculate available memory to script **/
export async function runThreaded(ns, server, script, systemUsage, _args) {
	// parse arguments
	var args = _args ?? [];
	// calculate thread count
	var threads = await calculateThreadCount(ns, server, script, systemUsage);
	// run script
	var pid = 0;
	if (threads && threads > 0) {
		pid = await ns.run(script, threads, ...args);
		await ns.sleep(50);
	} else {
		ns.tprint('not enough ram on ' + server + ' to run ' + script);
	}
	return pid;
}

/** calculate available memory to script **/
export async function execThreaded(ns, server, script, systemUsage, _args) {
	// parse arguments
	var args = _args ?? [];
	// calculate thread count
	var threads = await calculateThreadCount(ns, server, script, systemUsage);
	// run script
	if (threads && threads > 0) {
		await ns.exec(script, server, threads, ...args);
		await ns.sleep(50);
	} else {
		ns.tprint('not enough ram on ' + server + ' to run ' + script);
	}
}

/** calculate thread count */
async function calculateThreadCount(ns, server, script, systemUsage) {
	
	//ns.tprint(' server ' + server + ' script ' + script + ' systemUsage ' + systemUsage);
	var serverMaxRam = await ns.getServerMaxRam(server);
	var serverUsedRam = await ns.getServerUsedRam(server);
	var scriptRam = await ns.getScriptRam(script);
	//ns.tprint(' serverMaxRam ' + serverMaxRam + ' serverUsedRam ' + serverUsedRam + ' scriptRam ' + scriptRam);	
	return parseInt(((serverMaxRam - serverUsedRam) * systemUsage) / scriptRam);
}