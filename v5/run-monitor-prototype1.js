import {calculateThreadsPerInstance, canWeaken, hasFunds, runThreaded} from 'bit-utils.js';

/**
 * target state smart monitor
 * originally intended to dynamically manage 3 script pools against thread based on server state
 * being deprecated to a simpler script model that runs a single script powered to max performance
 */
export async function main(ns) {
	// parse args
	const targetServer = ns.args[0] ?? 'n00dles';	
	ns.disableLog('sleep');	
	await kill(ns, 'home', targetServer);	
}

/** todo */
async function kill(ns, hostServer, targetServer) {
	const growScript = 'run-grow-loop.js';
	const hackScript = 'run-hack-loop.js';
	const weakScript = 'run-weak-loop.js';
	var growThreads = await calculateThreadsPerInstance(ns, hostServer, growScript, 20, .85);
	var hackThreads = await calculateThreadsPerInstance(ns, hostServer, hackScript, 20, .85);
	var weakThreads = await calculateThreadsPerInstance(ns, hostServer, weakScript, 20, .85);	
	await resetEnv(ns);
	var wait = 3000;
	await runThreaded(ns, hostServer, weakScript, weakThreads, [targetServer, 1]);
	await ns.sleep(wait);
	await runThreaded(ns, hostServer, weakScript, weakThreads, [targetServer, 2]);
	await ns.sleep(wait);
	await runThreaded(ns, hostServer, growScript, growThreads, [targetServer, 3]);
	await ns.sleep(wait);
	await runThreaded(ns, hostServer, growScript, growThreads, [targetServer, 4]);
	await ns.sleep(wait);
	await runThreaded(ns, hostServer, growScript, growThreads, [targetServer, 5]);
	await ns.sleep(wait);
	await runThreaded(ns, hostServer, growScript, growThreads, [targetServer, 6]);
	await ns.sleep(wait);
	await runThreaded(ns, hostServer, growScript, growThreads, [targetServer, 7]);
	await ns.sleep(wait);
	await runThreaded(ns, hostServer, growScript, growThreads, [targetServer, 8]);
	await ns.sleep(wait);
	await runThreaded(ns, hostServer, growScript, growThreads, [targetServer, 9]);
	await ns.sleep(wait);
	await runThreaded(ns, hostServer, growScript, growThreads, [targetServer, 10]);
	await ns.sleep(wait);
	await runThreaded(ns, hostServer, growScript, growThreads, [targetServer, 11]);
	await ns.sleep(wait);

	var pids = [0,0,0,0,0,0,0,0,0];
	var wasSecured = false;
	var wasFunded = false;
	var wasGrowing = false;
	while(true) {
		// monitor
		var isSecure = await canWeaken(ns, 1.1, targetServer);
		var isFunded = await hasFunds(ns, .8, targetServer);
		if (isSecure) {
			ns.print('is secured: ' + pids);
			if (!wasSecured) {
				ns.print('was not secured: ' + pids);
				await shutDownPids(ns, pids);
				pids = [];
				ns.print('shifting set A');
				var pidsA = await shiftFocusA(ns, pids, hostServer, weakScript, weakThreads, targetServer);
				ns.print('shifting set B');
				var pidsB = await shiftFocusB(ns, pids, hostServer, weakScript, weakThreads, targetServer);
				ns.print('shifting set C');
				var pidsC = await shiftFocusC(ns, pids, hostServer, weakScript, weakThreads, targetServer);
				wasSecured = true;
				wasFunded = false;
				wasGrowing = false;
				pids = [...pidsA, ...pidsB, ...pidsC];
				ns.print('new pids: ' + pids);
			}
		} else {
			if (isFunded) {
				ns.print('is funded: ' + pids);
				if (!wasFunded) {
					ns.print('was not funded: ' + pids);
					await shutDownPids(ns, pids);
					pids = [];
					ns.print('shifting set A');
				var pidsA = await shiftFocusA(ns, pids, hostServer, growScript, growThreads, targetServer);
					ns.print('shifting set B');
				var pidsB = await shiftFocusB(ns, pids, hostServer, weakScript, hackThreads, targetServer);
					ns.print('shifting set C');
				var pidsC = await shiftFocusC(ns, pids, hostServer, hackScript, weakThreads, targetServer);
					wasSecured = false;
					wasFunded = true;
					wasGrowing = false;
					pids = [...pidsA, ...pidsB, ...pidsC];
					ns.print('new pids: ' + pids);
				}
			} else {
				if (!wasGrowing) {
					ns.print('was not growing: ' + pids);
					await shutDownPids(ns, pids);
					pids = [];
					ns.print('shifting set A');
					var pidsA = await shiftFocusA(ns, pids, hostServer, growScript, growThreads, targetServer);
					ns.print('shifting set B');
					var pidsB = await shiftFocusB(ns, pids, hostServer, growScript, growThreads, targetServer);
					ns.print('shifting set C');
					var pidsC = await shiftFocusC(ns, pids, hostServer, growScript, growThreads, targetServer);
					wasSecured = false;
					wasFunded = false;
					wasGrowing = true;
					pids = [...pidsA, ...pidsB, ...pidsC];
					ns.print('new pids: ' + pids);
				}
			}
		}
		await ns.sleep(wait);
	}
}

/** 
 * destroy scripts and restart the env
 */
async function resetEnv(ns) {
	await ns.scriptKill('run-grow-loop.js', 'home');
	await ns.scriptKill('run-hack-loop.js', 'home');
	await ns.scriptKill('run-weak-loop.js', 'home');
}

/** calculate available memory to script **/
export async function shutDownPids(ns, pids) {
	var wait = 3000;
	try {
		var shutdown = false;
		shutdown = await ns.kill(pids[0]);
		ns.print('shutdown of ' + pids[0] + ': ' + shutdown);
		ns.print('shutdown of ' + pids[1] + ': ' + shutdown);
		ns.print('shutdown of ' + pids[2] + ': ' + shutdown);
		ns.print('shutdown of ' + pids[3] + ': ' + shutdown);
		ns.print('shutdown of ' + pids[4] + ': ' + shutdown);
		ns.print('shutdown of ' + pids[5] + ': ' + shutdown);
		ns.print('shutdown of ' + pids[6] + ': ' + shutdown);
		ns.print('shutdown of ' + pids[7] + ': ' + shutdown);
		ns.print('shutdown of ' + pids[8] + ': ' + shutdown);
	} catch(e) {
		ns.tprint('error killing pid: ' + pids);
	}
	await ns.sleep(wait);
}

/** calculate available memory to script **/
export async function shiftFocusA(ns, pids, server, script, threads, targetServer) {
	var wait = 3000;
	// run script
	var pids = [];
	var pid;
	pid = await runThreaded(ns, server, script, threads, [targetServer, 12]);
	pids.push(pid);
	await ns.sleep(wait);
	pid = await runThreaded(ns, server, script, threads, [targetServer, 13]);
	pids.push(pid);
	await ns.sleep(wait);
	pid = await runThreaded(ns, server, script, threads, [targetServer, 14]);
	pids.push(pid);
	await ns.sleep(wait);
	ns.print('A pids ' + pids);
	return pids;
}

/** calculate available memory to script **/
export async function shiftFocusB(ns, pids, server, script, threads, targetServer) {
	var wait = 3000;
	// run script
	var pids = [];
	var pid;
	pid = await runThreaded(ns, server, script, threads, [targetServer, 15]);
	pids.push(pid);
	await ns.sleep(wait);
	pid = await runThreaded(ns, server, script, threads, [targetServer, 16]);
	pids.push(pid);
	await ns.sleep(wait);
	pid = await runThreaded(ns, server, script, threads, [targetServer, 17]);
	pids.push(pid);
	await ns.sleep(wait);
	ns.print('B pids ' + pids);
	return pids;
}

/** calculate available memory to script **/
export async function shiftFocusC(ns, pids, server, script, threads, targetServer) {
	var wait = 3000;
	// run script
	var pids = [];
	var pid;
	pid = await runThreaded(ns, server, script, threads, [targetServer, 18]);
	pids.push(pid);
	await ns.sleep(wait*3);
	pid = await runThreaded(ns, server, script, threads, [targetServer, 19]);
	pids.push(pid);
	await ns.sleep(wait*3);
	pid = await runThreaded(ns, server, script, threads, [targetServer, 20]);
	pids.push(pid);
	await ns.sleep(wait*3);
	ns.print('C pids ' + pids);
	return pids;
}