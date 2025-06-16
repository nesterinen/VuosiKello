const lista_obj = [
    {name: 'asd', number: 123},
    {name: 'dsa', number: 321},
    {name: 'dem', number: 666}
]

const selected_value = lista_obj.find(val => val.name == 'dsa')
selected_value['number'] = 6969

console.log('wtf:', lista_obj[1])