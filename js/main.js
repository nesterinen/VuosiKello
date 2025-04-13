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
    
})

async function EventCreationDialog(groups) {
    let extraIsVisible = true
    //const seriesTypes = ['weekly', 'oddWeeks', 'evenWeeks', 'lastDayOfMonth', 'firstDayOfMonth']
    const seriesTypes = [
        'viikottain',
        'parittomat viikot',
        'parilliset viikot',
        'kuukauden ensimmäinen päivä',
        'kuukauden viimeinen päivä'
    ]

    return new Promise((resolve, reject) => {
        const dialog = document.createElement('dialog')
        dialog.classList.add('EventCreation')
        dialog.innerHTML = `
        <button class='closeButtonX baseRed'>X</button>

        <div class='baseSettings'>

            <div class='titleGroup'>

                <div class='baseElement'>
                    <div class='baseText'>otsikko</div>
                    <input class='baseInput titleInput' value='Laborum'/>
                </div>
                
                <div class='baseElement'>
                    <div class='baseText'>ryhmä</div>
                    <select class='baseSelect groupSelect'></select>
                </div>

            </div>

            
            <div class='baseElement'>
                <div class='baseText'>sisältö</div>
                <textarea rows='5' cols='28' class='baseTextArea contentInput'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</textarea>
            </div>

            <div class='baseElement dateTimeElement'>
                <div class='baseText'>päivämäärä</div>
                <div class='baseText'>alku</div>
                <div class='baseText'>loppu</div>
                <input type='date' value='2025-04-13' class='dateInput'/>
                <input type='time' value='10:00' class='startInput'/>
                <input type='time' value='12:00' class='endInput'/>
            </div>

            <div class='baseElement'>
                <div class='baseText'>varaaja</div>
                <input value='Rackham' class='reserverInput'/>
            </div>
            
            <div class='buttonContainer'>
                <button class='closeButton baseButton'>close</button>
                <button class='createButton baseButton baseGreen'>create</button>
                <button class='extraButton baseButton'>extra</button>
            </div>

        </div>

        <div class='extraSettings'  style='display:none;'>

            <div class='baseElement'>
                <div class='baseText'>prioriteetti</div>
                <select class='prioritySelect'></select>
            </div>

            <div class='baseElement'>
                <div class='baseText'>sarjan tyyppi</div>
                <select class='seriesType'></select>
            </div>

            <div class='baseElement'>
                <div class='baseText'>päivät</div>
                <div class='daySelect'>
                    <div>
                        <input type='checkbox' id='cbMa' class='cbDay'/>
                        <label for='cbMa'>ma</label>
                    </div>
                    <div>
                        <input type='checkbox' id='cbTi' class='cbDay'/>
                        <label for='cbTi'>ti</label>
                    </div>
                    <div>
                        <input type='checkbox' id='cbKe' class='cbDay'/>
                        <label for='cbKe'>ke</label>
                    </div>
                    <div>
                        <input type='checkbox' id='cbTo' class='cbDay'/>
                        <label for='cbTo'>to</label>
                    </div>
                    <div>
                        <input type='checkbox' id='cbPe' class='cbDay'/>
                        <label for='cbPe'>pe</label>
                    </div>
                </div>
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
        prioritySelector.value = '5'

        const seriesTypeSelector = dialog.querySelector('.seriesType')
        for (const type of seriesTypes) {
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(type))
            seriesTypeSelector.appendChild(option)
        }

        const createButton = dialog.querySelector('.createButton')
        createButton.addEventListener('click', () => {
            const title = dialog.querySelector('.titleInput').value
            const content = dialog.querySelector('.contentInput').value
            const reserver = dialog.querySelector('.reserverInput').value
            const date = dialog.querySelector('.dateInput').value
            const start = dialog.querySelector('.startInput').value
            const end = dialog.querySelector('.endInput').value
            const group = groupSelector.value
            const priority = prioritySelector.value


            console.log({title, content, reserver, date, start, end, group, priority})
            //dialog.remove()
            //resolve({data:'bla bla ', series: false})
        })

        const closeButton = dialog.querySelector('.closeButton')
        closeButton.addEventListener('click', () => {
            dialog.remove()
            reject('Dialog closed.')
        })

        const closeButtonX = dialog.querySelector('.closeButtonX')
        closeButtonX.addEventListener('click', () => {
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

        /*
        jQuery(($) => {
            $("h1.jtest").html("wtf")
        })
        */

        /*
        jQuery(($) => {
            $("button.testButton").on('click', () => {
                console.log(seriesTypeSelector.value)
                console.log(seriesTypeSelector.options.selectedIndex)
                console.log('fromArray:', seriesTypes[seriesTypeSelector.options.selectedIndex])
            })
        })
        */

        document.body.appendChild(dialog)
        dialog.showModal()
    })
}