/** @param {NS} ns **/
export async function main(ns) {

	// initialize local variables
	var currentServer = ns.args[0]; 	
	var scripts = ["hack.js"];
	if (ns.args.length > 1) {
		scripts = ns.args.slice(1, ns.args.length);
		ns.tprint(scripts);
	}
	ns.tprint(currentServer, scripts);

	// start local scripts
	var isRunning = false;	
	for (var i = 0; i < scripts.length; i++) {
		var script = scripts[i];
		ns.tprint(currentServer, script);
		if(ns.scriptRunning(script, currentServer)) {
			ns.tprint(currentServer + "already started");
			isRunning = true;
			break;
		}
		await restart(ns, currentServer, script);
	}

	// start connected servers
	// if script is already running, has been part of restart and will not try to start other servers
	if (!isRunning) {
		var servers = await ns.scan(currentServer);
		// var currentServer = ns.getCurrentServer();
		ns.tprint(servers);

		for (var i = 0; i < servers.length; i++) {
			var server = servers[i]
			ns.tprint(server);
			await prepRemoteRestart(ns, server, scripts);
		}
	}
}

/** Restart script. */
async function restart(ns, server, script) {
	var serverMaxRam = ns.getServerMaxRam(server);
	var serverUsedRam = ns.getServerUsedRam(server);
	var scriptRam = ns.getScriptRam(script);
	var threads = parseInt((serverMaxRam - serverUsedRam) / scriptRam);
	if (threads > 0) {
		await ns.exec(script, server, threads, server);
	}
}

/** Restart script. */
async function prepRemoteRestart(ns, server, scripts) {
	const restartScript = "restart.js";
	if (ns.getServerUsedRam(server) > 0) {
		ns.tprint("already started: " + server);	
	} else if(!ns.hasRootAccess(server)) {
		ns.tprint("no access: " + server);				
	} else {			
		await ns.scp(restartScript, server);
		for (var i = 0; i < scripts.length; i++) {
			var script = scripts[i];
			ns.tprint(script, server);
			await ns.scp(script, server);
		}
		const _servers = [server];
		const _args = _servers.concat(scripts);
		ns.tprint(restartScript, server, _args);
		await ns.exec(restartScript, server, 1, ..._args);
	}
}