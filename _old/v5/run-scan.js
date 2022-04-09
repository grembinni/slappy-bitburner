export async function main(ns) {
	await simpleScan(ns);
}

export async function simpleScan(ns, parent, parentRef, knownServers) {
	parent = parent ?? 'home';
	parentRef = parentRef ?? parent;
	knownServers = knownServers ?? [];

	// get directly connected servers
	ns.tprint(parentRef);
	var children = await ns.scan(parent);
	var filteredChildren = filter(children, knownServers);
	var updatedKnown = union(filteredChildren, knownServers);
	// get next tier of connected servers 
	for (const _parent of filteredChildren) {
		var _parentRef = parentRef +'->'+ _parent;
		var _children = await simpleScan(ns, _parent, _parentRef, updatedKnown);
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
	}	
	return servers;
}

function union(newServers, knownServers) {
	return [...newServers, ...knownServers];
}