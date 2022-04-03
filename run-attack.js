import {attackProvidedServers} from 'attack-utils.js';

export async function main(ns) {
	// parse args
	const hostServer = ns.args[0] ?? 'home';	
	// run
	await attackProvidedServers(ns, hostServer)
}