export async function main(ns) {
	await scanServer(ns);
}

export async function scanServer(ns, parent, knownServers) {
	parent = parent ?? 'home';
	knownServers = knownServers ?? [];
	// get directly connected servers
	var children = await ns.scan(parent);
	var filteredChildren = filter(children, knownServers);
	var updatedKnown = union(filteredChildren, knownServers);
	// get next tier of connected servers 
	for (const _parent of filteredChildren) {
		var _children = await scanServer(ns, _parent, updatedKnown);
		var _filteredChildren = filter(_children, knownServers);
		var updatedKnown = union(_filteredChildren, knownServers);
	}
	return updatedKnown.sort();
}

function filter(newServers, knownServers) {
	var servers = [];
	if (newServers) {
		servers = newServers.filter(e => (knownServers.indexOf(e) === -1));
		servers = servers.filter(e => (e != ('home')));
		servers = servers.filter(e => (e != ('.')));
	}	
	return servers;
}

function union(newServers, knownServers) {
	return [...newServers, ...knownServers];
}