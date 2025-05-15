/*
const mydat = new Date()
let datstr = new Date(mydat - mydat.getTimezoneOffset()*60_000).toISOString()
console.log('dat', datstr)
*/

const date = new Date(Date.UTC(2026))
console.log('date', date)
console.log('date', date instanceof Date)