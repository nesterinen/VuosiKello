/*
datatype: {
    id: int
    series_id: int | null
    priority: int
    varaaja: str
    group: str
    title: str
    content: str
    start: date
    end: date
}
*/

document.addEventListener('DOMContentLoaded', async () => {
    const mainElement = document.getElementById('VuosiKalenteri')
    if (mainElement === null) return

    mainElement.innerHTML = `
        <button class='testButton'>Test</button>
    `

    /*
    function downloadLink(data){
        const element = document.createElement('a')
        element.textContent = 'lataa'
        element.addEventListener('click', () => {
            const jsString = JSON.stringify(data)
            const file = new Blob([jsString], {type: 'application/json'})
            const url = URL.createObjectURL(file)
            element.href = url
            element.download = "data.json"
        })

        return element
    }
    mainElement.appendChild(downloadLink(gevents))
    */

    EventCreationDialog(php_args.groups)

    /*
    const testButton = mainElement.querySelector('.testButton')
    testButton.addEventListener('click', async () => {

        const dialogResult = await EventCreationDialog(php_args.groups).catch((e) => {
            console.log(e)
            return null
        })

        if (!dialogResult) {
            console.log('done')
            return
        }

        console.log('result', dialogResult)
    })
    */
    
})

async function EventCreationDialog(groups) {
    let extraIsVisible = true

    return new Promise((resolve, reject) => {
        const dialog = document.createElement('dialog')
        dialog.classList.add('EventCreation')
        dialog.innerHTML = `

        <div class='baseSettings'>

            <div class='titleGroup'>

                <div class='baseElement'>
                    <div class='baseText'>otsikko</div>
                    <input class='baseInput'/>
                </div>
                
                <div class='baseElement'>
                    <div class='baseText'>ryhmä</div>
                    <select class='baseSelect groupSelect'></select>
                </div>

            </div>

            
            <div class='baseElement'>
                <div class='baseText'>sisältö</div>
                <textarea rows='5' cols='28' class='baseTextArea'></textarea>
            </div>

            <div class='baseElement dateTimeElement'>
                <div class='baseText'>päivämäärä</div>
                <div class='baseText'>alku</div>
                <div class='baseText'>loppu</div>
                <input type='date'/>
                <input type='time'/>
                <input type='time'/>
            </div>

            <div class='baseElement'>
                <div class='baseText'>varaaja</div>
                <input/>
            </div>
            
            <div class='buttonContainer'>
                <button class='closeButton'>close</button>
                <button class='createButton'>create</button>
                <button class='extraButton'>extra</button>
            </div>

        </div>

        <div class='extraSettings'  style='display:none;'>

            <div class='baseElement'>
                <div class='baseText'>prioriteetti</div>
                <select class='prioritySelect'></select>
            </div>

        </div>

        
        `

        const groupSelector = dialog.querySelector('.groupSelect')
        Object.keys(groups).map(group => {
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(group))
            groupSelector.appendChild(option)
        })

        const prioritySelector = dialog.querySelector('.prioritySelect')
        for (let priority = 1; priority <= 5; priority++){
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(priority))
            prioritySelector.appendChild(option)
        }

        const createButton = dialog.querySelector('.createButton')
        createButton.addEventListener('click', () => {
            dialog.remove()
            resolve({data:'bla bla ', series: false})
        })

        const closeButton = dialog.querySelector('.closeButton')
        closeButton.addEventListener('click', () => {
            dialog.remove()
            reject('Dialog closed.')
        })

        const extraSettings = dialog.querySelector('.extraSettings')
        extraSettings.style = '' // REMOOOOOOOVEEE LAATTTEEER ######################

        const extraButton = dialog.querySelector('.extraButton')
        extraButton.addEventListener('click', () => {
            extraIsVisible = !extraIsVisible
            if(extraIsVisible) {
                extraSettings.style = ''
            } else {
                extraSettings.style = 'display: none;'
            }
        })

        document.body.appendChild(dialog)
        dialog.showModal()
    })
}