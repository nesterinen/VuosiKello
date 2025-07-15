/*
const lista_obj = [
    {name: 'asd', number: 123},
    {name: 'dsa', number: 321},
    {name: 'dem', number: 666}
]

const selected_value = lista_obj.find(val => val.name == 'dsa')
selected_value['number'] = 6969

console.log('wtf:', lista_obj[1])
*/

/*
const obj1 = {
    name: 'asd',
    value: 'asd',
    thing: 123,
    a: '1',
    b: '2'
}

const obj2 = {
    name: 'dsa',
    value: 'dsa',
    thing: 321
}

const obj3 = {
    ...obj1,
    ...obj2
}

console.log('obj3', obj3)
*/
let sh, sm, eh, em
[sh, sm] = "12:34:56".split(':')
[eh, em] = "11:22:33".split(':')
console.log(sh, sm, eh, em)