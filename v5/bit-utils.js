/** validate arg size to set script var */
function getArgs(argsToSplit, splitIndex) {
	var args = [];	
	if (argsToSplit && argsToSplit.length > splitIndex) {
		args = argsToSplit.slice(splitIndex, argsToSplit.length);
	}
	return args;
}