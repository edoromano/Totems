var arguments = process.argv;
var output = 0;
for (var i = arguments.length - 1; i > 1; i--) {
	output += Number(arguments[i]);
}

console.log(output);