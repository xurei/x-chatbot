module.exports = function isset(variable) {
	if (typeof variable === 'undefined' || variable === null) {
		return false;
	} else {
		return true;
	}
};