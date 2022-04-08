/** todo */
export function compare(ns, a, b, asc) {
	var asc = asc ?? true;
	let sort = 0
	if (asc) {
		if (a < b) {
			sort = 1;
		} else if (a > b) {
			sort = -1;
		}
	} else {
		if (a > b) {
			sort = 1;
		} else if (a < b) {
			sort = -1;
		}
	}
	return sort;
}

/**
 * todo
 */
export function filterArray(toFilter, filterSet) {
	var filtered = [];
	if (toFilter) {
		filtered = toFilter.filter(e => (filterSet.indexOf(e) === -1));
	}	
	return filtered;
}

/** 
 * Filter of servers not to hack. 
 */
export function isAttackable(server) {
	return !server.startsWith('swarm') && (server != 'home');
}

/** 
 * Split array at index or return empty array. 
 */
export function splice(argsToSplit, splitIndex) {
	var args = [];	
	if (argsToSplit && argsToSplit.length > splitIndex) {
		args = argsToSplit.slice(splitIndex, argsToSplit.length);
	}
	return args;
}

/**
 * todo
 */
export function unionArray(first, second) {
	return [...first, ...second];
}