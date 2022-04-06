import {canWeaken, hasFunds} from 'bit-utils.js';

/**
 * target state smart monitor
 * originally intended to dynamically manage scripts against thread based on server state
 * pivoting to a smaller script count that runs a single script powered to max performance
 */
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
	resetEnv(ns, scriptsRef);
	prepEnv(ns, scriptsRef);

	var [wasSecured, wasFunded, wasGrowing] = [false, false, false];			
	ns.print('server: ' + hostServer + ', wasSecured: ' + wasSecured + ', wasFunded: ' + wasFunded + ', wasGrowing: ' + wasGrowing);
	while(true) {
		// monitor
		var isSecure = await canWeaken(ns, 1.2, targetServer);
		var isFunded = await hasFunds(ns, .8, targetServer);
		if (isSecure) {
			ns.print('server: ' + hostServer + ', status: SECURED, _status: ' + wasSecured + ', instances: ' + instanceRefs.length);

			ns.print('server: ' + hostServer + ', wasSecured: ' + wasSecured + ', wasFunded: ' + wasFunded + ', wasGrowing: ' + wasGrowing);
		} else {
			if (isFunded) {
				ns.print('server: ' + hostServer + ', status: FUNDED, _status: ' + wasFunded + ', instances: ' + instanceRefs.length);

				ns.print('server: ' + hostServer + ', wasSecured: ' + wasSecured + ', wasFunded: ' + wasFunded + ', wasGrowing: ' + wasGrowing);
				
			} else {
				ns.print('server: ' + hostServer + ', status: GROWING, _status: ' + wasGrowing + ', instances: ' + instanceRefs.length);

				ns.print('server: ' + hostServer + ', wasSecured: ' + wasSecured + ', wasFunded: ' + wasFunded + ', wasGrowing: ' + wasGrowing);

			}
		}
		instanceRefs = await cleanScripts(ns, scriptsRef, instanceRefs);
	}
}

/** 
 * Create data reference for script constants.
 */
async function buildScriptsRef(ns, hostServer, targetServer) {
	const growScript = 'run-grow-basic.js';
	const hackScript = 'run-hack-basic.js';
	const weakScript = 'run-weak-basic.js';
	const scriptsRef = {
		"hostServer": hostServer,
		"targetServer": targetServer,
		"growScript": growScript,
		"hackScript": hackScript,
		"weakScript": weakScript
	};
	return scriptsRef;
}

/** 
 * reduce security
 */
async function prepEnv(ns, scriptsRef) {
	var wait = 3000;
	// kill existing scripts on target server so they dont mess with calculations
	await ns.scriptKill(scriptsRef.growScript, scriptsRef.targetServer);
	await ns.scriptKill(scriptsRef.hackScript, scriptsRef.targetServer);
	await ns.scriptKill(scriptsRef.weakScript, scriptsRef.targetServer);
	await ns.sleep(wait);
	// burn down security
	var serverRam = ns.calculateAvailableRam(ns, scriptsRef.targetServer);
	var scriptRam = await ns.getScriptRam(script);
	const weakThreads = parseInt(serverRam / scriptRam)
	const minLevel = await ns.getServerMinSecurityLevel(server);
	var currentLevel = 0;
	while(currentLevel != minLevel) {
		runThreaded(ns, scriptsRef.hostServer, scriptsRef.weakScript, weakThreads, [scriptsRef.targetServer])
	}
	//
	ns.weakenAnalyze(as, rty);
}

/** 
 * destroy scripts and restart the env
 */
async function resetEnv(ns, scriptsRef) {
	var wait = 3000;
	await ns.scriptKill(scriptsRef.growScript, scriptsRef.targetServer);
	await ns.scriptKill(scriptsRef.hackScript, scriptsRef.targetServer);
	await ns.scriptKill(scriptsRef.weakScript, scriptsRef.targetServer);
	await ns.sleep(wait);
	return [];
	// return await initScript(ns, scriptsRef, scriptsRef.weakScript, scriptsRef.weakThreads, scriptsRef.instanceCount);
}