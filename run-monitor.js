import {calculateThreadsPerInstance, canWeaken, hasFunds, runThreaded} from 'bit-utils.js';

export async function main(ns) {
	// parse args
	const targetServer = ns.args[0] ?? 'iron-gym';	
	ns.disableLog('sleep');	
	await monitor(ns, 'home', targetServer);	
}

/** todo */
async function monitor(ns, hostServer, targetServer) {
	var wait = 30000;

	// setup env
	const scriptsRef = await buildScriptsRef(ns, hostServer, targetServer);
	var instanceRefs = await resetEnv(ns, scriptsRef);

	var [wasSecured, wasFunded, wasGrowing] = [false, false, false];			
	ns.print('server: ' + hostServer + ', wasSecured: ' + wasSecured + ', wasFunded: ' + wasFunded + ', wasGrowing: ' + wasGrowing);
	while(true) {
		// monitor
		var isSecure = await canWeaken(ns, 1.2, targetServer);
		var isFunded = await hasFunds(ns, .8, targetServer);
		if (isSecure) {
			ns.print('server: ' + hostServer + ', status: SECURED, _status: ' + wasSecured + ', instances: ' + instanceRefs.length);
			// if it wasnt previously running secured reset thread focus to secure
			if (!wasSecured) {
				instanceRefs = await shiftFocus(ns, scriptsRef, instanceRefs, 5, 1, 14);
				[wasSecured, wasFunded, wasGrowing] = [true, false, false];	
				ns.print('server: ' + hostServer + ', wasSecured: ' + wasSecured + ', wasFunded: ' + wasFunded + ', wasGrowing: ' + wasGrowing);
			}
		} else {
			// if (isFunded) {
			// 	ns.print('server: ' + hostServer + ', status: FUNDED, _status: ' + wasFunded + ', instances: ' + instanceRefs.length);
			// 	// if it wasnt previously running funded reset thread focus to hack
			// 	if (!wasFunded) {
			// 		instanceRefs = await shiftFocus(ns, scriptsRef, instanceRefs, 13, 3, 4);
			// 		[wasSecured, wasFunded, wasGrowing] = [false, true, false];
			// 		ns.print('server: ' + hostServer + ', wasSecured: ' + wasSecured + ', wasFunded: ' + wasFunded + ', wasGrowing: ' + wasGrowing);
			// 	}
			// } else {
				ns.print('server: ' + hostServer + ', status: GROWING, _status: ' + wasGrowing + ', instances: ' + instanceRefs.length);
				// if it wasnt previously running growing reset thread focus to grow
				if (!wasGrowing) {
					instanceRefs = await shiftFocus(ns, scriptsRef, instanceRefs, 14, 3, 3);
					[wasSecured, wasFunded, wasGrowing] = [false, false, true];
					ns.print('server: ' + hostServer + ', wasSecured: ' + wasSecured + ', wasFunded: ' + wasFunded + ', wasGrowing: ' + wasGrowing);
				}
			//}
		}
		await ns.sleep(wait*5);
		instanceRefs = await cleanScripts(ns, scriptsRef, instanceRefs);
	}
}

/** 
 * destroy scripts and restart the env
 */
async function resetEnv(ns, scriptsRef) {
	var wait = 3000;
	await ns.scriptKill(scriptsRef.growScript, scriptsRef.hostServer);
	await ns.scriptKill(scriptsRef.hackScript, scriptsRef.hostServer);
	await ns.scriptKill(scriptsRef.weakScript, scriptsRef.hostServer);
	await ns.sleep(wait);
	return [];
	// return await initScript(ns, scriptsRef, scriptsRef.weakScript, scriptsRef.weakThreads, scriptsRef.instanceCount);
}

/** 
 * init scripts
 */
async function initScript(ns, scriptsRef, script, threads, instances) {
	var wait = 30000;			
	ns.print('server: ' + scriptsRef.hostServer + ', script: ' + script + ', threads: ' + threads + ', instances: ' + instances);
	var instanceRefs = [];
	for (var i = 0; i < instances; i++) {
		var pid = await runThreaded(ns, scriptsRef.hostServer, script, threads, [scriptsRef.targetServer, i]);
		instanceRefs.push(buildInstanceRef(ns, scriptsRef, i, pid, script));
		await ns.sleep(wait);
	}
	return instanceRefs;
}

/** 
 * Create data reference for script constants.
 */
async function buildScriptsRef(ns, hostServer, targetServer) {
	const instanceCount = 10;
	const systemResourcePercentage = .75;
	const growScript = 'run-grow-basic.js';
	const hackScript = 'run-hack-basic.js';
	const weakScript = 'run-weak-basic.js';
	const growThreads = await calculateThreadsPerInstance(ns, hostServer, growScript, instanceCount, systemResourcePercentage);
	const hackThreads = await calculateThreadsPerInstance(ns, hostServer, hackScript, instanceCount, systemResourcePercentage);
	const weakThreads = await calculateThreadsPerInstance(ns, hostServer, weakScript, instanceCount, systemResourcePercentage);	
	const scriptsRef = {
		"hostServer": hostServer,
		"targetServer": targetServer,
		"instanceCount": instanceCount,
		"growScript": growScript,
		"growThreads": growThreads,
		"hackScript": hackScript,
		"hackThreads": hackThreads,
		"weakScript": weakScript,
		"weakThreads": weakThreads
	};
	return scriptsRef;
}

/** 
 * Create data reference for the instance.
 */
function buildInstanceRef(ns, scriptsRef, pod, pid, script) {
	ns.print('server: ' + scriptsRef.hostServer + ', pod: ' + pod + ', pid: ' + pid + ', script: ' + script);
	return { 
		"pod": pod,
		"pid": pid,
		"script": script
	};
}

/** 
 * Recalibrate threads for new operational focus.
 * Future iteration will recalibrate and retire threads by pid instead of by batch.
 */
async function shiftFocus(ns, scriptsRef, instanceRefs, growCount, hackCount, weakCount) {
	var wait = 3000;
	ns.print('server: ' + scriptsRef.hostServer + ', instanceRefs: ' + instanceRefs.length + ', growCount: ' + growCount + ', hackCount: ' + hackCount + ', weakCount: ' + weakCount);
	// kill any running scripts
	await ns.scriptKill(scriptsRef.growScript, scriptsRef.hostServer);
	await ns.scriptKill(scriptsRef.hackScript, scriptsRef.hostServer);
	await ns.scriptKill(scriptsRef.weakScript, scriptsRef.hostServer);
	await ns.sleep(wait);
	instanceRefs = []
	// init new scripts
	var growInstances = await initScript(ns, scriptsRef, scriptsRef.growScript, scriptsRef.growThreads, growCount);
	var hackInstances = await initScript(ns, scriptsRef, scriptsRef.hackScript, scriptsRef.hackThreads, hackCount);
	var weakInstances = await initScript(ns, scriptsRef, scriptsRef.weakScript, scriptsRef.weakThreads, weakCount);

	return instanceRefs = [...growInstances, ...hackInstances, ...weakInstances];
}

/**
 * Restore missing scripts, retire long running scripts.
 */
async function cleanScripts(ns, scriptsRef, instanceRefs) {
	ns.print('server: ' + scriptsRef.hostServer + ', instanceRefs: ' + instanceRefs.length);

	return instanceRefs;
}