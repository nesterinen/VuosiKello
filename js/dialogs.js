/*
datatype: {
    id: int
    series_id: int | null
    priority: int
    reservor: str
    group: str[]
    title: str
    content: str
    start: date
    end: date
}
*/

function dateNoTimezone(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}

function dateToHourMin(date) {
    const timeString = date.split("T")[1].split(".")[0].split(":")
    return timeString[0] + ':' + timeString[1]
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// https://stackoverflow.com/questions/9045868/javascript-date-getweek @alias51
function getWeek(date){
    const onejan = new Date(date.getFullYear(),0,1)
    const dayOfYear = ((date - onejan + 86400000)/86400000)
    return Math.ceil(dayOfYear/7)
}

async function EventCreationDialog(groups) {
    let extraIsVisible = true
    //const seriesTypes = ['weekly', 'oddWeeks', 'evenWeeks', 'lastDayOfMonth', 'firstDayOfMonth']
    const seriesTypes = [
        'ei sarjaa',
        'viikottain',
        'parittomat viikot',
        'parilliset viikot',
        //'kuukauden ensimmäinen päivä',
        //'kuukauden viimeinen päivä'
    ]

    const priorities = [
        '1 - suurin',
        '2 - suuri',
        '3 - keskikokoinen',
        '4 - matala',
        '5 - matalin'
    ]

    function weeklySeries(
        dateStart,
        dateEnd,
        clockStart,
        clockEnd,
        daysCheckBoxElement,
        typeOfSeries='default'
        ){
            const startDateText = `${dateStart}T${clockStart}:00`
            const dateStartObject = new Date(startDateText)

            const endDateText = `${dateEnd}T${clockEnd}:00`
            const dateEndObject = new Date(endDateText)

            let daysChecked = []
            for (const checkbox of daysCheckBoxElement) {
                daysChecked.push(checkbox.checked)
            }
            daysChecked.push(false) // saturday
            daysChecked.push(false) // sunday

            const diffTime = dateStartObject  - dateEndObject
            const diffDays = Math.floor(-diffTime / (1000 * 60 * 60 * 24)) // time difference in days.

            // loop through days froms start to end
            const arrayOfDates = [] //[{start: date, endDate}, {}, ...]
            for (let i = 0; i <= diffDays; i++){
                const newDate = addDays(dateStartObject , i)

                // mon, tue, wed & etc...
                if(daysChecked[ newDate.getDay() - 1 ]){
                    if(typeOfSeries === 'odd'){
                        if(getWeek(newDate)%2 === 1) continue
                    }

                    if(typeOfSeries === 'even'){
                        if(getWeek(newDate)%2 === 0) continue
                    }

                    const newDateEnd = new Date(newDate)
                    const [eHours, eMins] = clockEnd.split(':')
                    newDateEnd.setHours(parseInt(eHours))
                    newDateEnd.setMinutes(parseInt(eMins))
                    arrayOfDates.push({
                        start: dateNoTimezone(newDate),
                        end: dateNoTimezone(newDateEnd)
                    })
                }
            }

            return arrayOfDates
    }

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
                <textarea rows='10' cols='50' class='baseTextArea contentInput'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</textarea>
            </div>

            <div class='baseElement dateTimeElement'>
                <div class='baseText'>päivämäärä</div>
                <div class='baseText'>alku</div>
                <div class='baseText'>loppu</div>
                <input type='date' value='2025-04-13' class='dateInput'/>
                <input type='time' value='10:00' class='startInput'/>
                <input type='time' value='12:00' class='endInput'/>
                <input type='date' value='2025-05-13' class='endDateInput'/>
            </div>

            <div class='baseElement'>
                <div class='baseText'>varaaja</div>
                <input value='Rackham' class='reserverInput'/>
            </div>
            
            <div class='buttonContainer'>
                <button class='closeButton baseButton' style='display:none;'>close</button>
                <button class='createButton baseButton baseGreen'>luo tapahtuma</button>
                <button class='extraButton baseButton'>lisä asetukset</button>
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
                <div class='baseText'>sarjan päivät</div>
                <div class='daySelect'>
                    <div>
                        <input type='checkbox' id='cbMa' class='cbDay' checked/>
                        <label for='cbMa'>ma</label>
                    </div>
                    <div>
                        <input type='checkbox' id='cbTi' class='cbDay'/>
                        <label for='cbTi'>ti</label>
                    </div>
                    <div>
                        <input type='checkbox' id='cbKe' class='cbDay' checked/>
                        <label for='cbKe'>ke</label>
                    </div>
                    <div>
                        <input type='checkbox' id='cbTo' class='cbDay'/>
                        <label for='cbTo'>to</label>
                    </div>
                    <div>
                        <input type='checkbox' id='cbPe' class='cbDay' checked/>
                        <label for='cbPe'>pe</label>
                    </div>
                </div>
            </div>

        </div>
        `

        const endDateInput = dialog.querySelector('.endDateInput')
        //endDateInput.disabled = true  //false on production!

        const groupSelector = dialog.querySelector('.groupSelect')
        Object.keys(groups).map(group => {
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(group))
            groupSelector.appendChild(option)
        })

        const prioritySelector = dialog.querySelector('.prioritySelect')
        for (const p of priorities) {
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(p))
            prioritySelector.appendChild(option)
        }
        prioritySelector.value = priorities[4]

        /*
        for (let priority = 1; priority <= 5; priority++){
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(priority))
            prioritySelector.appendChild(option)
        }
        prioritySelector.value = '5'
        */

        const seriesTypeSelector = dialog.querySelector('.seriesType')
        for (const type of seriesTypes) {
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(type))
            seriesTypeSelector.appendChild(option)
        }
        seriesTypeSelector.addEventListener('change', () => {
            if(seriesTypeSelector.options.selectedIndex !== 0) {
                endDateInput.disabled = false
                endDateInput.style = 'outline: 2px dotted green;'
            } else {
                endDateInput.disabled = true
                endDateInput.style = 'display: none;'
            }
        })

        const createButton = dialog.querySelector('.createButton')
        createButton.addEventListener('click', () => {
            const title = dialog.querySelector('.titleInput').value
            const content = dialog.querySelector('.contentInput').value
            const reservor = dialog.querySelector('.reserverInput').value
            const startDate = dialog.querySelector('.dateInput').value
            const clock_start = dialog.querySelector('.startInput').value
            const clock_end = dialog.querySelector('.endInput').value
            const group = [groupSelector.value]
            const priority = prioritySelector.options.selectedIndex + 1//prioritySelector.value
            const daysCheckBoxElement = dialog.getElementsByClassName('cbDay')

            const returnObject = {
                title,
                content,
                priority,
                reservor,
                start: dateNoTimezone(new Date(`${startDate}T${clock_start}`)),
                end: dateNoTimezone(new Date(`${startDate}T${clock_end}`)),
                group,
                arrayOfDates: null
            }

            switch(seriesTypeSelector.options.selectedIndex){
                case 0: /*individual*/
                    dialog.remove()
                    resolve({data: returnObject, series: false})
                    return
                    // break
                
                case 1: /*weekly series*/
                    returnObject.arrayOfDates = weeklySeries(
                        startDate,
                        endDateInput.value,
                        clock_start,
                        clock_end,
                        daysCheckBoxElement)
                    break

                case 2: /*odd weeks series*/
                    returnObject.arrayOfDates = weeklySeries(
                        startDate,
                        endDateInput.value,
                        clock_start,
                        clock_end,
                        daysCheckBoxElement,
                        'odd')
                    break

                case 3: /*even weeks series*/
                    returnObject.arrayOfDates = weeklySeries(
                        startDate,
                        endDateInput.value,
                        clock_start,
                        clock_end,
                        daysCheckBoxElement,
                        'even')
                    break

                case 4: /*month frist*/
                    console.log('todo')
                    break

                case 2: /*month last*/
                    console.log('todo')
                    break
            }

            // add validation! TODO!!!!!!!!!!!!!!!!

            dialog.remove()
            //resolve({data:'bla bla ', series: false})
            resolve({data: returnObject, series: true})
            return
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