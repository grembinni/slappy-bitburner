/** @param {NS} ns */
export async function main(ns) {
	var hostServer = ns.args[0];
	var targetServer = ns.args[0];
	await monitor(hostServer, targetServer);
}

/** todo */
function monitor(ns, hostServer, targetServer) {
	var maxRam = ns.getServerMaxRam(targetServer);
	var usedRam = ns.getServerUsedRam(targetServer);
	var instanceRam = (maxRam - usedRam) / 20;
	var pods = buildPods(instanceRam);
	var weakenPods = pods;
	var growPods = [];
	var hackPods = [];
}

/** todo */
function buildPods(instanceRam) {
	var pods = [];
	for (var i = 0; i < 20; i++) {
		pods.push(buildPod(i, instanceRam));
	}
}

/** todo */
function buildPod(pod, maxRam) {
	return { 
		"pod": pod,
		"pid": 0,
		"script": 'run-simple-weaken.js',
		"maxRam": maxRam
	};
}