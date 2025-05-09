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
    let extraIsVisible = false
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

        const dateNow = new Date()
        const dateNextMonth = new Date(new Date().setMonth(dateNow.getMonth() + 1))

        const dnStr = dateNow.toISOString().split('T')[0]
        const dnmStr = dateNextMonth.toISOString().split('T')[0]

        let selectedGroupsArray = []

        dialog.innerHTML = `
        <div class='ecHeader'>
                <div class='ecHtab'></div>
                <div class='ecHred'>&#x2715;</div>
        </div>

        <div class='ecContainer'>
        <div class='baseSettings'>

            <div class='titleGroup'>

                <div class='baseElement'>
                    <div class='baseText'>otsikko</div>
                    <input class='baseInput titleInput'/>
                </div>
                
                <div class='baseElement'>
                    <div class='baseText'>ryhmä</div>
                    <div class='groupCheckSelector'></div>
                </div>

            </div>

            
            <div class='baseElement'>
                <div class='baseText'>sisältö</div>
                <textarea rows='10' cols='50' class='baseTextArea contentInput' spellcheck='false'></textarea>
            </div>

            <div class='baseElement dateTimeElement'>
                <div class='baseText'>päivämäärä</div>
                <div class='baseText'>alku</div>
                <div class='baseText'>loppu</div>
                <input type='date' value=${dnStr} class='dateInput'/>
                <input type='time' value='10:00' class='startInput'/>
                <input type='time' value='12:00' class='endInput'/>
                <input type='date' value=${dnmStr} class='endDateInput'/>
            </div>

            <div class='baseElement'>
                <div class='baseText'>varaaja</div>
                <input class='reserverInput'/>
            </div>
            
            <div class='buttonContainer'>
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
        </div>
        `

        const endDateInput = dialog.querySelector('.endDateInput')
        endDateInput.disabled = true
        endDateInput.style = 'display: none;'

        // group check box selector ##############################
        let showDropDown = false

        const groupSelector = dialog.querySelector('.groupCheckSelector')
        groupSelector.innerHTML = `
            <div>
                <div class='gcsHeaderText'>
                    <div>+</div>
                    <div>Valitse</div>
                    <div>+</div>
                </div>
            </div>
            <div class='gcsSelections'>
            </div>
        `

        const gcsHeader = groupSelector.querySelector('.gcsHeaderText')
        gcsHeader.addEventListener('click', () => {
            showDropDown = !showDropDown
            if(showDropDown){
                groupSelections.style = 'display: block;'
            } else {
                groupSelections.style = 'display: none;'
            }
        })

        const groupSelections = groupSelector.querySelector('.gcsSelections')
        Object.keys(groups).map(group => {
            const selectBoxDiv = document.createElement('div')
            selectBoxDiv.innerHTML = `
                <label for="ec#${group}">
                <input type="checkbox" id="ec#${group}" />${group}</label>
            `

            groupSelections.appendChild(selectBoxDiv)
        })

        groupSelections.addEventListener('change', (e) => {
            //console.log(e.target.id, e.target.checked)
            const allCheckBoxElements = groupSelections.querySelectorAll('input')
            const checkedGroups = []
            for (const checkBoxElement of allCheckBoxElements) {
                //console.log('cb', checkBoxElement.id, checkBoxElement.checked)
                if(checkBoxElement.checked){
                    checkedGroups.push(checkBoxElement.id.replace('ec#', ''))
                }
            }

            selectedGroupsArray = checkedGroups
            
            if(checkedGroups.length === 0){
                //gsbHeader.textContent = 'Kaikki'
                gcsHeader.innerHTML = `
                    <div>+</div>
                    <div>Valitse</div>
                    <div>+</div>
                `
            } else if (checkedGroups.length === 1){
                gcsHeader.innerHTML = `
                    <div></div>
                    <div>${checkedGroups[0]}</div>
                    <div></div>
                `
            } else {
                //gcsHeader.textContent = checkedGroups
                gcsHeader.innerHTML = `
                    <div></div>
                    <div>Ryhmiä: ${checkedGroups.length}</div>
                    <div></div>
                `
            }
        })

        // group check box selector END ##############################


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
            //const group = selectedGroupsArray
            const priority = prioritySelector.options.selectedIndex + 1//prioritySelector.value
            const daysCheckBoxElement = dialog.getElementsByClassName('cbDay')

            const returnObject = {
                title,
                content,
                priority,
                reservor,
                start: dateNoTimezone(new Date(`${startDate}T${clock_start}`)),
                end: dateNoTimezone(new Date(`${startDate}T${clock_end}`)),
                group: selectedGroupsArray,
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

        /*
        const closeButton = dialog.querySelector('.closeButton')
        closeButton.addEventListener('click', () => {
            dialog.remove()
            reject('Dialog closed.')
        })
        */

        //const closeButtonX = dialog.querySelector('.closeButtonX') //ecHred
        const closeButtonX = dialog.querySelector('.ecHred')
        closeButtonX.addEventListener('click', () => {
            dialog.remove()
            reject('Dialog closed.')
        })

        const extraSettings = dialog.querySelector('.extraSettings')
        //extraSettings.style = '' // REMOOOOOOOVEEE LAATTTEEER ######################

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


async function DeleteDialog(event, id, series_id) {
    days = ['sunnuntai',
        'maanantai',
        'tiistai',
        'keskiviikko',
        'torstai',
        'perjantai',
        'lauantai']
    
    return new Promise((resolve, reject) => {
        /*
        const [startDate, startTime] = this.#dateToString(event.start)
        const [, endTime] = this.#dateToString(event.end)
        const weekDay = this.days[event.start.getDay()]
        */

        const [startDate, startTime] = dateToString(event.start)
        const [, endTime] = dateToString(event.end)
        const weekDay = days[event.start.getDay()]

        const spacedGroups = event.group.toString().replaceAll(',', ', ')

        const dialog = document.createElement('dialog')
        dialog.classList.add('DeleteDialog')
        dialog.innerHTML = `
            <div class='ddHeader'>
                <div class='ddHtab'></div>
                <div class='ddHred'>&#x2715;</div>
            </div>

            <div class='ddInfoMain'>
                <div class='ddMainText'>${event.title}</div>

                <div class='ddIgp'>
                    <div class='ddGroups ddBaseText'>${spacedGroups}</div>
                    <div class='ddBaseText'>prioriteetti: ${event.priority}</div>
                </div>

                <div class='ddDateTime'>
                    <div class='ddBaseText'>${weekDay}</div>
                    <div class='ddBaseText'>${startDate}</div>
                    <div class='ddBaseText'>${startTime} - ${endTime}</div>
                </div>
            </div>

            <div>
                <textarea class='ddTextArea' spellcheck='false'>${event.content}</textarea>
            </div>

            <div class='ddEventFooter'>
                <div class='ddBaseText'>${event.reservor}</div>
                <div class='ddEventIds'>
                    <div class='ddIdText'>id:${event.id}</div>
                    <div class='ddIdText'>sarja:${event.series_id ? event.series_id : '-'}</div>
                </div>
            </div>

            <button class='deleteButton baseButton baseRed'>poista</button>
        `

        const deleteButton = dialog.querySelector('.deleteButton')
        deleteButton.addEventListener('click', () => {
            dialog.remove()
            resolve({id, series_id: null})
        })

        const closeButton = dialog.querySelector('.ddHred')
        closeButton.addEventListener('click', () => {
            dialog.remove()
            reject('closed')
        })

        if(series_id){
            const deleteSeriesButton = document.createElement('button')
            deleteSeriesButton.classList.add('baseButton', 'baseRed')
            deleteSeriesButton.textContent = 'poista sarja'
            deleteSeriesButton.addEventListener('click', () => {
                dialog.remove()
                resolve({id, series_id})
            })

            dialog.appendChild(deleteSeriesButton)
        }

        document.body.appendChild(dialog)
        dialog.showModal()
    })
}