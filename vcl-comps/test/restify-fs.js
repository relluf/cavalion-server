"devtools/Resources-node";

var Resources = require("devtools/Resources-node");

$([], {}, [
	$("vcl/ui/Console#console", {
		onEvaluate: function(expr) {
			var scope = this.scope();
			return eval(expr);
		}
	})
]);