/** 
 * Executed threaded script call on remote server.
 */
export async function execThreaded(ns, server, script, threads, _args) {
	// parse arguments
	var args = _args ?? [];
	// run script
	if (threads > 0) {
		await ns.exec(script, server, threads, ...args);
		await ns.sleep(50);
	} else {
		ns.print('server: ' + server + ' not enough threads to run ' + script);
		//ns.tprint('server: ' + server + ' not enough threads to run ' + script);
	}
}

/** 
 * Kill all scripts on target server.
 */
export async function killAllScripts(ns, server) {
	await ns.killall(server);
}

/** 
 * Run script on single thread 
 */
export async function runSingle(ns, script, args) {
	// parse arguments
	var args = args ?? [];
	// run script
	await ns.run(script, 1, ...args);
}

/** 
 * Run threaded script call on current server.
 */
export async function runThreaded(ns, server, script, threads, _args) {
	// parse arguments
	var args = _args ?? [];
	// run script
	var pid = 0;
	if (threads && threads > 0) {
		pid = await ns.run(script, threads, ...args);
		await ns.sleep(50);
	} else {
		ns.print('server: ' + server + ' not enough threads to run ' + script);
		//ns.tprint('server: ' + server + ' not enough threads to run ' + script);
	}
	return pid;
}