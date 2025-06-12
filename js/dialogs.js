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

/*
function dateNoTimezone(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}
*/

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

function validateAndColor(element, isInvalid){
    if(isInvalid){
        //element.style = 'outline: 2px solid red; z-index: 1;'
        element.classList.add('invalidValue')
    } else {
        //element.style = 'outline: none;'
        element.classList.remove('invalidValue')
    }

    return isInvalid
}

async function EventCreationDialog(groups) {
    let extraIsVisible = false
    //const seriesTypes = ['weekly', 'oddWeeks', 'evenWeeks', 'lastDayOfMonth', 'firstDayOfMonth']
    const seriesTypes = [
        'ei sarjaa',
        'viikottain',
        'parittomat viikot',
        'parilliset viikot',
        'päivän numero',
        //'kuukauden ensimmäinen päivä',
        //'kuukauden viimeinen päivä'
    ]

    const priorities = [
        '1 - suurin',
        '2 - suuri',
        '3 - vakio',
        '4 - matala',
        '5 - matalin'
    ]

    function monthlyDay(
        dateDayNumber,
        dateStart,
        dateEnd,
        clockStart,
        clockEnd,){
            const startDateText = `${dateStart}T${clockStart}:00`
            const dateStartObject = new Date(startDateText)

            const endDateText = `${dateEnd}T${clockEnd}:00`
            const dateEndObject = new Date(endDateText)

            const diffTime = dateStartObject  - dateEndObject
            const diffDays = Math.floor(-diffTime / (1000 * 60 * 60 * 24))

            const arrayOfDates = []
            for (let i = 0; i <= diffDays; i++){
                const newDate = addDays(dateStartObject , i)
                
                if(newDate.getDate() === dateDayNumber){
                    const newDateEnd = new Date(newDate)
                    const [eHours, eMins] = clockEnd.split(':')
                    newDateEnd.setHours(parseInt(eHours))
                    newDateEnd.setMinutes(parseInt(eMins))
                    arrayOfDates.push({
                        start: dateNoTimezone(newDate), //newDate.toISOString(), // dateNoTimezone(newDate),
                        end: dateNoTimezone(newDateEnd)//newDateEnd.toISOString() //dateNoTimezone(newDateEnd)
                    })
                }
            }

            return arrayOfDates
    }

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
                        start: dateNoTimezone(newDate), //newDate.toISOString(), // dateNoTimezone(newDate),
                        end: dateNoTimezone(newDateEnd) //newDateEnd.toISOString() //dateNoTimezone(newDateEnd)
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

        <div class='extraSettings' style='display:none;'>

            <div class='baseElement'>
                <div class='baseText'>prioriteetti</div>
                <select class='prioritySelect'></select>
            </div>

            <div class='baseElement'>
                <div class='baseText'>sarjan tyyppi</div>
                <select class='seriesType'></select>
            </div>

            <div class='baseElement weekDaySelection' style='display:none;'>
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

            <div class='baseElement dateDaySelection' style='display:none;'>
                <div class='baseText'>päivän numero</div>
                <input type='number' class='dateDayInput'/>
            </div>

        </div>
        </div>
        `

        const endDateInput = dialog.querySelector('.endDateInput')
        endDateInput.disabled = true
        endDateInput.style = 'display: none;'

        // group check box selector START #############################################################
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
        let abortter = new AbortController() // abortter is used to kill document event listener
        gcsHeader.addEventListener('click', () => {
            showDropDown = !showDropDown

            if(showDropDown){
                groupSelections.style = `display: block; width: ${gcsHeader.clientWidth}px;`
                //groupSelections.style = 'display: block;'

                //close group checkbox dropdown if clicking outside of it, like normal dropdown.
                document.addEventListener('click', event => {
                    if(!groupSelections.contains(event.target) && event.target.parentNode != gcsHeader) {
                        gcsHeader.click() // this will get us to the else{} part
                    }
                }, {
                    signal: abortter.signal
                })
            } else {
                groupSelections.style = 'display: none;'

                abortter.abort('selector closed.')
                abortter = new AbortController() // abort() changes controller permanently, so we create new one.
            }
        })

        const groupSelections = groupSelector.querySelector('.gcsSelections')

        function addSelection(group){
            const selectBoxDiv = document.createElement('div')
            selectBoxDiv.innerHTML = `
                <label for="ec#${group}">
                <input type="checkbox" id="ec#${group}" />${group}</label>
            `

            groupSelections.appendChild(selectBoxDiv)
        }

        // groups used to be {group: color, group2: color2...} is now ['group1', 'group3', ...]
        if(groups instanceof Array){
            groups.map(group => {
                addSelection(group)
            })
        } else {
            Object.keys(groups).map(group => {
                addSelection(group)
            })
        }

        groupSelections.addEventListener('change', (e) => {
            const allCheckBoxElements = groupSelections.querySelectorAll('input')
            const checkedGroups = []
            for (const checkBoxElement of allCheckBoxElements) {
                if(checkBoxElement.checked){
                    checkedGroups.push(checkBoxElement.id.replace('ec#', ''))
                }
            }

            selectedGroupsArray = checkedGroups
            
            if(checkedGroups.length === 0){
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
                gcsHeader.innerHTML = `
                    <div></div>
                    <div>Ryhmiä: ${checkedGroups.length}</div>
                    <div></div>
                `
            }
        })

        // group check box selector END ###################################################


        const prioritySelector = dialog.querySelector('.prioritySelect')
        for (const p of priorities) {
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(p))
            prioritySelector.appendChild(option)
        }
        prioritySelector.value = priorities[2]


        const seriesTypeSelector = dialog.querySelector('.seriesType')
        for (const type of seriesTypes) {
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(type))
            seriesTypeSelector.appendChild(option)
        }
        seriesTypeSelector.addEventListener('change', () => {
            if(seriesTypeSelector.options.selectedIndex !== 0) {
                endDateInput.disabled = false
                /*endDateInput.style = 'outline: 2px dotted green;'*/
                endDateInput.style = ''
            } else {
                endDateInput.disabled = true
                endDateInput.style = 'display: none;'
            }

            if(seriesTypeSelector.options.selectedIndex > 0 && seriesTypeSelector.options.selectedIndex <= 3){
                weekDaySelectionContainer.style = 'display: block;'
            } else {
                weekDaySelectionContainer.style = 'display: none;'
            }

            if(seriesTypeSelector.options.selectedIndex === 4){
                dateDaySelectionContainer.style = 'display: block;'
            } else {
                dateDaySelectionContainer.style = 'display: none;'
            }
        })

        // allow only integers
        const dateDayInput = dialog.querySelector('.dateDayInput')
        dateDayInput.addEventListener('input', (e) => {
            dateDayInput.value = dateDayInput.value.replace('^[0-9]*$', '')
        })

        const weekDaySelectionContainer = dialog.querySelector('.weekDaySelection')
        const dateDaySelectionContainer = dialog.querySelector('.dateDaySelection')

        const createButton = dialog.querySelector('.createButton')
        createButton.addEventListener('click', () => {
            const title = dialog.querySelector('.titleInput').value
            const content = dialog.querySelector('.contentInput').value
            const reservor = dialog.querySelector('.reserverInput').value
            const startDate = dialog.querySelector('.dateInput').value
            const endDate = dialog.querySelector('.endDateInput').value
            const clock_start = dialog.querySelector('.startInput').value
            const clock_end = dialog.querySelector('.endInput').value
            //const group = selectedGroupsArray
            const priority = prioritySelector.options.selectedIndex + 1
            const daysCheckBoxElement = dialog.getElementsByClassName('cbDay')
            
            let checked = 0
            for (const checkbox of daysCheckBoxElement) {
                if(checkbox.checked) checked++;
            }

            // outline elements with invalid value
            const validations = [
                validateAndColor(dialog.querySelector('.titleInput'), title.length === 0),
                validateAndColor(dialog.querySelector('.reserverInput'), reservor.length === 0),
                validateAndColor(dialog.querySelector('.endInput'), clock_start >= clock_end),
                validateAndColor(dialog.querySelector('.daySelect'), checked === 0 && seriesTypeSelector.options.selectedIndex > 0 && seriesTypeSelector.options.selectedIndex <= 3),
                validateAndColor(dialog.querySelector('.dateInput'), startDate >= endDate && seriesTypeSelector.options.selectedIndex > 0),
                validateAndColor(dialog.querySelector('.groupCheckSelector'), selectedGroupsArray.length === 0),
                //validateAndColor(dateDayInput, seriesTypeSelector.options.selectedIndex === 4 && (parseInt(dateDayInput.value) < 1 || parseInt(dateDayInput.value) > 31))
                validateAndColor(dateDayInput, seriesTypeSelector.options.selectedIndex === 4 && !(parseInt(dateDayInput.value) >= 1 && parseInt(dateDayInput.value) <= 31))
            ]

            // if any invalid value return
            for (const invalid of validations){
                if(invalid === true){
                    return
                }
            }

            const returnObject = {
                title,
                content,
                priority,
                reservor,
                start: dateNoTimezone(new Date(`${startDate}T${clock_start}`)),//new Date(`${startDate}T${clock_start}`).toISOString(), //dateNoTimezone(new Date(`${startDate}T${clock_start}`)),
                end: dateNoTimezone(new Date(`${startDate}T${clock_end}`)),//new Date(`${startDate}T${clock_end}`).toISOString(), //dateNoTimezone(new Date(`${startDate}T${clock_end}`)),
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

                case 4: /*day date of month*/
                    returnObject.arrayOfDates = monthlyDay(
                        parseInt(dateDayInput.value),
                        startDate,
                        endDateInput.value,
                        clock_start,
                        clock_end
                    )
                    break

                case 2: /*month last*/
                    console.log('todo')
                    break
            }

            if(returnObject.arrayOfDates.length === 0){
                reject('no days selected for series')
                return
            }

            dialog.remove()
            resolve({data: returnObject, series: true})
            return
        })

        //const closeButtonX = dialog.querySelector('.closeButtonX') //ecHred
        const closeButtonX = dialog.querySelector('.ecHred')
        closeButtonX.addEventListener('click', () => {
            dialog.remove()
            reject('Dialog closed.')
        })

        const extraSettings = dialog.querySelector('.extraSettings')

        const extraButton = dialog.querySelector('.extraButton')
        extraButton.addEventListener('click', () => {
            extraIsVisible = !extraIsVisible
            if(extraIsVisible) {
                extraSettings.style = ''
            } else {
                extraSettings.style = 'display: none;'
            }
        })

        extraButton.click()

        /*
        jQuery(($) => {
            $("button.testButton").on('click', () => {
                console.log(seriesTypeSelector.value)
            })
        })
        */

        document.body.appendChild(dialog)
        dialog.showModal()
    })
}


async function InfoDialogOld(event, id, series_id) {
    days = ['sunnuntai',
        'maanantai',
        'tiistai',
        'keskiviikko',
        'torstai',
        'perjantai',
        'lauantai']
    
    return new Promise((resolve, reject) => {
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
                <textarea class='ddTextArea' spellcheck='false' readonly>${event.content}</textarea>
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

function InfoDialog(event, id, series_id, {deleteClick, seriesDeleteClick, downloadClick}) {
    days = ['sunnuntai',
        'maanantai',
        'tiistai',
        'keskiviikko',
        'torstai',
        'perjantai',
        'lauantai']
    
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
            <textarea class='ddTextArea' spellcheck='false' readonly>${event.content}</textarea>
        </div>

        <div class='ddEventFooter'>
            <div class='ddBaseText'>${event.reservor}</div>
            <div class='ddEventIds'>
                <div class='ddIdText'>id:${event.id}</div>
                <div class='ddIdText'>sarja:${event.series_id ? event.series_id : '-'}</div>
            </div>
        </div>

        <button class='downloadButton baseButton'>lataa kalenteri tapahtuma</button>
        <button class='deleteButton baseButton baseRed'>poista</button>
    `

    const deleteButton = dialog.querySelector('.deleteButton')
    deleteButton.addEventListener('click', () => {
        dialog.remove()
        //resolve({id, series_id: null})
        if(deleteClick){
            deleteClick()
            return
        } else {
            console.log('delete button clicked')
            return
        }
    })

    const closeButton = dialog.querySelector('.ddHred')
    closeButton.addEventListener('click', () => {
        dialog.remove()
        return
    })

    if(series_id){
        const deleteSeriesButton = document.createElement('button')
        deleteSeriesButton.classList.add('baseButton', 'baseRed')
        deleteSeriesButton.textContent = 'poista sarja'
        deleteSeriesButton.addEventListener('click', () => {
            dialog.remove()
            if(seriesDeleteClick){
                dialog.remove()
                seriesDeleteClick()
                return
            } else {
                console.log('delete series button clicked')
                return
            }
        })

        dialog.appendChild(deleteSeriesButton)
    }

    const downloadButton = dialog.querySelector('.downloadButton')
    downloadButton.addEventListener('click', () => {
        if(downloadClick){
            downloadClick()
            return
        } else {
            console.log('download button clicked')
            return
        }
    })

    document.body.appendChild(dialog)
    dialog.showModal()
}

function SettingsDialog(event, groups, {updateOneClick, updateSeriesClick}){
    let selectedGroupsArray = []

    const priorities = [
        '1 - suurin',
        '2 - suuri',
        '3 - vakio',
        '4 - matala',
        '5 - matalin'
    ]

    const dialog = document.createElement('dialog')
    dialog.classList.add('SettingsDialog')
    dialog.innerHTML = `
        <div class='ddHeader'>
                <div class='ddHtab'></div>
                <div class='ddHred'>&#x2715;</div>
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

            <div class='cNpContainer'>
                <div class='baseElement clockStartStop'>
                    <div class='baseText'>alku</div>
                    <div class='baseText'>loppu</div>
                    <input type='time' class='startInput' disabled/>
                    <input type='time' class='endInput' disabled/>
                </div>

                <div class='baseElement prioritySelector'>
                    <div class='baseText'>prioriteetti</div>
                    <select class='prioritySelect'></select>
                </div>
            </div>


            <div class='baseElement reservorNid'>
                <div>
                    <div class='baseText'>varaaja</div>
                    <input class='reserverInput'/>
                </div>

                <div class='idsContainer'>
                    <div class='baseText'>id: ${event.id}</div>
                    ${event.series_id ? `<div class='baseText'>sarja: ${event.series_id}</div>` : ''}
                </div>
            </div>
            
            <div class='buttonContainer'>
                <button class='extraButton baseButton updateEventButton'>päivitä tapahtuma</button>
                ${event.series_id ? `<button class='extraButton baseButton'>päivitä sarja</button>` : ''}
            </div>

        </div>
    `
    const title = dialog.querySelector('.titleInput')
    title.value = event.title

    /* Group selector Start ###############*/
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
    let abortter = new AbortController() // abortter is used to kill document event listener
    gcsHeader.addEventListener('click', () => {
        showDropDown = !showDropDown

        if(showDropDown){
            groupSelections.style = `display: block; width: ${gcsHeader.clientWidth}px;`
            //groupSelections.style = 'display: block;'

            //close group checkbox dropdown if clicking outside of it, like normal dropdown.
            document.addEventListener('click', event => {
                if(!groupSelections.contains(event.target) && event.target.parentNode != gcsHeader) {
                    gcsHeader.click() // this will get us to the else{} part
                }
            }, {
                signal: abortter.signal
            })
        } else {
            groupSelections.style = 'display: none;'

            abortter.abort('selector closed.')
            abortter = new AbortController() // abort() changes controller permanently, so we create new one.
        }
    })

    const groupSelections = groupSelector.querySelector('.gcsSelections')

    function addSelection(group, checked=false){
        const selectBoxDiv = document.createElement('div')
        if(checked) {
            selectBoxDiv.innerHTML = `
                <label for="ec#${group}">
                <input type="checkbox" id="ec#${group}" checked='true'/>${group}</label>
            `
        } else {
            selectBoxDiv.innerHTML = `
                <label for="ec#${group}">
                <input type="checkbox" id="ec#${group}" />${group}</label>
            `
        }

        groupSelections.appendChild(selectBoxDiv)
    }

    groups.map(group => {
        if(event.group.includes(group)){
            addSelection(group, true)
            return
        }
        addSelection(group)
    })

    function updateGroupSelectorHeader(){
        const allCheckBoxElements = groupSelections.querySelectorAll('input')
        const checkedGroups = []
        for (const checkBoxElement of allCheckBoxElements) {
            if(checkBoxElement.checked){
                checkedGroups.push(checkBoxElement.id.replace('ec#', ''))
            }
        }

        selectedGroupsArray = checkedGroups
        
        if(checkedGroups.length === 0){
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
            gcsHeader.innerHTML = `
                <div></div>
                <div>Ryhmiä: ${checkedGroups.length}</div>
                <div></div>
            `
        }
    }

    groupSelections.addEventListener('change', (e) => {
        updateGroupSelectorHeader()
    })

    updateGroupSelectorHeader()
    /* Group selector Stop ################*/

    const content = dialog.querySelector('.contentInput')
    content.value = event.content

    const [, startTime] = dateToString(event.start)
    const [, endTime] = dateToString(event.end)

    const clockStart = dialog.querySelector('.startInput')
    clockStart.value = startTime

    const clockEnd = dialog.querySelector('.endInput')
    clockEnd.value = endTime

    const prioritySelector = dialog.querySelector('.prioritySelect')
    for (const p of priorities) {
        const option = document.createElement('option')
        option.appendChild(document.createTextNode(p))
        prioritySelector.appendChild(option)
    }
    prioritySelector.value = priorities[event.priority - 1]

    const reservor = dialog.querySelector('.reserverInput')
    reservor.value = event.reservor

    const closeButton = dialog.querySelector('.ddHred')
    closeButton.addEventListener('click', () => {
        dialog.remove()
    })

    function updateAndCallBack(callBackFunction){
        const validations = [
            validateAndColor(title, title.value.length === 0),
            validateAndColor(reservor, reservor.value.length === 0),
            //validateAndColor(dialog.querySelector('.endInput'), clock_start >= clock_end),
            validateAndColor(dialog.querySelector('.groupCheckSelector'), selectedGroupsArray.length === 0),
        ]

        // if any invalid value return
        for (const invalid of validations){
            if(invalid === true){
                return
            }
        }

        const returnEvent = {
            title: title.value,
            group: selectedGroupsArray,
            content: content.value,
            priority: prioritySelector.options.selectedIndex + 1,
            reservor: reservor.value
        }

        let changes = 0
        Object.keys(returnEvent).map(key => {
            if(Array.isArray(returnEvent[key])){
                if(JSON.stringify(returnEvent[key]) !== JSON.stringify(event[key])){
                    changes += 1
                    //console.log('array', key, 'out', returnEvent[key], 'in', event[key])
                }
                return
            }

            if(returnEvent[key] !== event[key]){
                changes += 1
                //console.log('key', key, 'out', returnEvent[key], 'in', event[key])
            }
        })

        if(changes === 0) {
            alert('Tapahtumaan ei ole tehty muutoksia')
            return
        }

        callBackFunction(returnEvent)
        dialog.remove()
    }

    const updateEventButton = dialog.querySelector('.updateEventButton')
    updateEventButton.addEventListener('click', () => {
        updateAndCallBack(updateOneClick)
    })

    document.body.appendChild(dialog)
    dialog.showModal()
}