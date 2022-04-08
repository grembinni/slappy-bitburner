import {scanServer} from 'cerebro.js';
import {runThreaded} from 'script-utils.js';
import {buildServerRefs, calcThreadsPerInst} from 'server-utils.js';

const bigUsage    = .02;
const mediumUsage = .0075;
const smallUsage  = .003;
const maxMoney    = 1000000000000;
const minMoney    = 10000000000;

/**
 * intended to improve the usage of home resource while final monitor state is being built
 */
export async function main(ns) {
	// runner will update with any prep code
	await initHomeHacks(ns);
}

/** attack all servers */
export async function initHomeHacks(ns) {
	ns.print('initHomeHacks');
	// constants
	// pull servers
	var servers = await scanServer(ns, 'home');
	var serverRefs = await buildServerRefs(ns, servers);
	// filter servers
	serverRefs = filterServers(filterServers);
	// setup attacks
	runBigServers(ns, serverRefs);
	runMediumServers(ns, serverRefs);
	runSmallServers(ns, serverRefs);
}

/** todo */
async function filterServers(ns, serverRefs) {
	var playerHackLevel = await ns.getHackingLevel();
	ns.tprint(serverRefs.length);
	serverRefs = serverRefs.filter(e => (e.maxMoney > 0));
	serverRefs = serverRefs.filter(e => (e.rootAccess));
	serverRefs = serverRefs.filter(e => (e.requiredHackingLevel < playerHackLevel));
	ns.tprint(serverRefs.length);
	return serverRefs;
}

/** todo */
async function runBigServers(ns, serverRefs) {
	var serverRefs = serverRefs.filter(e => (e.maxMoney >= maxMoney));
	var threads = await calcThreadsPerInst(ns, 'home', 'hack-seq.js', 1, bigUsage);
	ns.tprint('servers: BIG, count: ' + serverRefs.length + ', threads: ' + thread + ', usagePercentage: ' + (bigUsage*serverRefs.length));
	for (const serverRef of serverRefs) {
		await runThreaded(ns, 'home', 'hack-seq.js', threads, [serverRef.serverName]);
	}
}

/** todo */
async function runMediumServers(ns, serverRefs) {
	var serverRefs = serverRefs.filter(e => ((e.maxMoney < maxMoney) && (e.maxMoney >= minMoney)));
	var threads = await calcThreadsPerInst(ns, 'home', 'hack-seq.js', 1, mediumUsage);
	ns.tprint('servers: MEDIUM, count: ' + serverRefs.length + ', threads: ' + thread + ', usagePercentage: ' + (mediumUsage*serverRefs.length));
	for (const serverRef of serverRefs) {
		await runThreaded(ns, 'home', 'hack-seq.js', threads, [serverRef.serverName]);
	}
}

/** todo */
async function runSmallServers(ns, serverRefs) {
	var serverRefs = serverRefs.filter(e => (e.maxMoney >= minMoney));
	var threads = await calcThreadsPerInst(ns, 'home', 'hack-seq.js', 1, smallUsage);
	ns.tprint('servers: SMALL, count: ' + serverRefs.length + ', threads: ' + thread + ', usagePercentage: ' + (smallUsage*serverRefs.length));
	for (const serverRef of serverRefs) {
		await runThreaded(ns, 'home', 'hack-seq.js', threads, [serverRef.serverName]);
	}
}