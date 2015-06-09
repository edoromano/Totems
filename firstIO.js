var fs = require('fs');
var buff = fs.readFileSync(process.argv[2]); 
var arr = buff.toString().split("\n");
console.log(arr.length-1);