import {canWeaken, hasFunds, runThreadedAutoCalculated} from 'bit-utils.js';

export async function main(ns) {
	// parse args
	const targetServer = ns.args[0] ?? 'n00dles';	
	ns.disableLog('sleep');	
	await kill(ns, 'home', targetServer);	
}

/** todo */
async function kill(ns, hostServer, targetServer) {
	var wait = 3000;
	await runThreadedAutoCalculated(ns, hostServer, 'run-weak-basic.js', .05, [targetServer, 1]);
	await ns.sleep(wait);
	await runThreadedAutoCalculated(ns, hostServer, 'run-weak-basic.js', .052, [targetServer, 2]);
	await ns.sleep(wait);
	await runThreadedAutoCalculated(ns, hostServer, 'run-grow-basic.js', .055, [targetServer, 3]);
	await ns.sleep(wait);
	await runThreadedAutoCalculated(ns, hostServer, 'run-grow-basic.js', .058, [targetServer, 4]);
	await ns.sleep(wait);
	await runThreadedAutoCalculated(ns, hostServer, 'run-grow-basic.js', .062, [targetServer, 5]);
	await ns.sleep(wait);
	await runThreadedAutoCalculated(ns, hostServer, 'run-grow-basic.js', .066, [targetServer, 6]);
	await ns.sleep(wait);
	await runThreadedAutoCalculated(ns, hostServer, 'run-grow-basic.js', .071, [targetServer, 7]);
	await ns.sleep(wait);
	await runThreadedAutoCalculated(ns, hostServer, 'run-grow-basic.js', .076, [targetServer, 8]);
	await ns.sleep(wait);
	await runThreadedAutoCalculated(ns, hostServer, 'run-grow-basic.js', .083, [targetServer, 9]);
	await ns.sleep(wait);
	await runThreadedAutoCalculated(ns, hostServer, 'run-grow-basic.js', .09, [targetServer, 10]);
	await ns.sleep(wait);
	await runThreadedAutoCalculated(ns, hostServer, 'run-grow-basic.js', .1, [targetServer, 11]);
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
				var pidsA = await shiftFocusA(ns, pids, hostServer, 'run-weak-basic.js', targetServer);
				ns.print('shifting set B');
				var pidsB = await shiftFocusB(ns, pids, hostServer, 'run-weak-basic.js', targetServer);
				ns.print('shifting set C');
				var pidsC = await shiftFocusC(ns, pids, hostServer, 'run-weak-basic.js', targetServer);
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
				var pidsA = await shiftFocusA(ns, pids, hostServer, 'run-grow-basic.js', targetServer);
					ns.print('shifting set B');
				var pidsB = await shiftFocusB(ns, pids, hostServer, 'run-weak-basic.js', targetServer);
					ns.print('shifting set C');
				var pidsC = await shiftFocusC(ns, pids, hostServer, 'run-hack-basic.js', targetServer);
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
					var pidsA = await shiftFocusA(ns, pids, hostServer, 'run-grow-basic.js', targetServer);
					ns.print('shifting set B');
					var pidsB = await shiftFocusB(ns, pids, hostServer, 'run-grow-basic.js', targetServer);
					ns.print('shifting set C');
					var pidsC = await shiftFocusC(ns, pids, hostServer, 'run-grow-basic.js', targetServer);
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
export async function shiftFocusA(ns, pids, server, script, targetServer) {
	var wait = 3000;
	// run script
	var pids = [];
	var pid;
	pid = await runThreadedAutoCalculated(ns, server, script, .111, [targetServer, 12]);
	pids.push(pid);
	await ns.sleep(wait);
	pid = await runThreadedAutoCalculated(ns, server, script, .125, [targetServer, 13]);
	pids.push(pid);
	await ns.sleep(wait);
	pid = await runThreadedAutoCalculated(ns, server, script, .142, [targetServer, 14]);
	pids.push(pid);
	await ns.sleep(wait);
	ns.print('A pids ' + pids);
	return pids;
}

/** calculate available memory to script **/
export async function shiftFocusB(ns, pids, server, script, targetServer) {
	var wait = 3000;
	// run script
	var pids = [];
	var pid;
	pid = await runThreadedAutoCalculated(ns, server, script, .166, [targetServer, 15]);
	pids.push(pid);
	await ns.sleep(wait);
	pid = await runThreadedAutoCalculated(ns, server, script, .2, [targetServer, 16]);
	pids.push(pid);
	await ns.sleep(wait);
	pid = await runThreadedAutoCalculated(ns, server, script, .25, [targetServer, 17]);
	pids.push(pid);
	await ns.sleep(wait);
	ns.print('B pids ' + pids);
	return pids;
}

/** calculate available memory to script **/
export async function shiftFocusC(ns, pids, server, script, targetServer) {
	var wait = 3000;
	// run script
	var pids = [];
	var pid;
	pid = await runThreadedAutoCalculated(ns, server, script, .333, [targetServer, 18]);
	pids.push(pid);
	await ns.sleep(wait*3);
	pid = await runThreadedAutoCalculated(ns, server, script, .5, [targetServer, 19]);
	pids.push(pid);
	await ns.sleep(wait*3);
	pid = await runThreadedAutoCalculated(ns, server, script, .9, [targetServer, 20]);
	pids.push(pid);
	await ns.sleep(wait*3);
	ns.print('C pids ' + pids);
	return pids;
}