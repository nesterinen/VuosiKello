const mydat = new Date()
let datstr = new Date(mydat - mydat.getTimezoneOffset()*60_000).toISOString()

console.log('dat', datstr)