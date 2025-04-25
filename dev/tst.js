const arr1 = ['1', '2', '3', '4']
const arr2 = ['a', 'b', 'c', '4']

for (const val of arr1){
    for (const val2 of arr2) {
        if(val === val2) {
            console.log('MATCH')
        }
    }
}