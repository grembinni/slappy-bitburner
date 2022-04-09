/** @param {NS} ns 
 * 
 * The objective of this script is to deploy one
 * to many attack scripts
 * e.x. run deploy-scripts.js home none first-attack.js second-attack.js
 * **/
export async function main(ns) {

	ns.disableLog('scan')
	//ns.disableLog('exec')

	// parse args
	const hostServer = ns.args[0] ?? 'home'
	var knownServers = ns.args[1] ?? ''
	const scripts = ns.args.slice(2, ns.args.length)

	// get connected servers
	var unhackedServers = ns.scan(hostServer)

	// remove home to prevent home from being infected
	unhackedServers = unhackedServers.filter(e => e !== 'home')

	if('none' === knownServers) {
		knownServers = ''
	}

	// make an array of hacked servers to prevent re-hacking
	const hackedServers = knownServers.split(' ')

	// remove servers that have already been infected
	unhackedServers = removeInfectedServers(unhackedServers, hackedServers)

	// collects all servers connected to hostServer
	for (var i = 0; i < unhackedServers.length; i++) {
		
		knownServers = knownServers.concat(unhackedServers[i] + ' ')
	}

	// deploys each script onto each server, including a string of known servers to prevent re-hacking
	for (var i = 0; i < unhackedServers.length; i++) {

		for (var j = 0; j < scripts.length; j++) {

			startScript(ns, scripts[j], 'home', unhackedServers[i], 1)
			ns.tprint('Deployed ' + scripts[j] + ' onto ' + unhackedServers[i])

			// start deploy-scripts.js with new list of knownServers
			ns.exec('deploy-scripts.js', 'home', 1, unhackedServers[i], knownServers, scripts[j])
		}
	}
}

function removeInfectedServers(unhackedServers, hackedServers) {

	for (var i = 0; i < hackedServers.length; i++) {

		unhackedServers = unhackedServers.filter(e => e !== hackedServers[i])
	}

	return unhackedServers
}

function startScript(ns, script, hostServer, unhackedServer, threads) {

	ns.exec(script, hostServer, threads, unhackedServer)
}