/*
datatype: {
    id: int
    series_id: int | null
    priority: int
    reservor: str
    group: str | array
    title: str
    content: str
    start: date
    end: date
}
*/
class VuosiTable {
    element
    YearEvents
    groups

    selectedMonth = 0
    monthFilter = false
    groupFilter = null

    #errorLog = true

    eventUpdateName = 'vuosiKalenteriUpdate'

    selectedEvent = null
    firstEventToday = null //{element: null, data: null}
    dateToday = new Date()

    constructor(element, {yearEvents, eventClick, deleteClick, monthSelect,groups}) {
        this.element = this.#CheckIfDomElement(element)
        this.YearEvents = yearEvents

        this.eventClick = eventClick && typeof eventClick == 'function' ? eventClick : this.#eventClickFunction
        this.deleteClick = deleteClick && typeof deleteClick == 'function' ? deleteClick : this.#deleteEventFunction
        this.monthSelect = monthSelect && typeof monthSelect == 'function' ? monthSelect : this.#monthSelectEventFunction

        this.groups = groups ? groups : []

    }

    #scrollToTodayEvent(){
        if(this.firstEventToday){
            this.element.querySelector('.eventList').scrollTo({
                top: this.firstEventToday.element.offsetTop -  this.firstEventToday.element.scrollHeight - this.firstEventToday.element.offsetHeight,
                left: 0,
                behavior: 'smooth'
            })
        }
    }

    #scrollToEventElement(eventElement){
        if(eventElement && eventElement instanceof HTMLElement){
            this.element.querySelector('.eventList').scrollTo({
                top: eventElement.offsetTop -  eventElement.scrollHeight - eventElement.offsetHeight,
                left: 0,
                behavior: 'smooth'
            })
        }
    }

    #getEventElement(id){
        const eventList = this.element.querySelector('.eventList')
        for (const element of eventList.children) {
            if(element.id == id) {
                return element
            }
        }

        return null
    }

    #CheckIfDomElement(element){
        if(element && element instanceof HTMLElement){
            return element
        } else {
            throw new Error(`${element} is not an instance of HTMLElement`)
        }
    }

    #getKuukasiFromNumber(kuukausi){
        switch (kuukausi) {
            case 0:
                return 'Tammikuu'
            case 1:
                return 'Helmikuu'
            case 2: 
                return 'Maaliskuu'
            case 3:
                return 'Huhtikuu'
            case 4:
                return 'Toukokuu'
            case 5:
                return 'Kesäkuu'
            case 6:
                return 'Heinäkuu'
            case 7:
                return 'Elokuu'
            case 8:
                return 'Syyskuu'
            case 9:
                return 'Lokakuu'
            case 10:
                return 'Marraskuu'
            case 11:
                return 'Joulukuu'
            default:
                return 'getKuukausiFault'
        }
    }

    #deleteEventFunction(id, series_id){
        this.#errorLogger('deleteEventFunction:', id, series_id)
    }

    #eventClickFunction({element, data}){
        this.#errorLogger('eventClickFunction', element, data)
        //this.selectEvent(data.id)
    }

    #monthSelectEventFunction(params){
        this.#errorLogger('monthSelectEventFunction', params)
    }

    selectEvent(event){
        if(this.selectedMonth !== event.start.getMonth() && this.monthFilter === true) {
            this.setEventFilterByMonth(event.start.getMonth())
        }

        if(this.selectedEvent) {
            //this.selectedEvent.style = ''
            this.selectedEvent.classList.remove('selectedTableEvent')
        }

        this.selectedEvent = this.#getEventElement(event.id)
        if(this.selectedEvent === null) return
        this.#scrollToEventElement(this.selectedEvent)

        this.selectedEvent.classList.add('selectedTableEvent')
    }

    #errorLogger(...params){
        if (this.#errorLog) {
            console.log('eLogger(table.js):', ...params)
        }
    }

    // group used to be string, now its array...
    setEventFilterByGroup(group) {
        if(!group){
            this.groupFilter = null
        } else {
            if(typeof group === 'string') {
                this.groupFilter = [group]
            }

            if(Array.isArray(group)){
                if(group.length === 0) {
                    this.groupFilter = null
                } else {
                    this.groupFilter = group
                }
            }
        }

        if(group === 'Kaikki'){
            this.groupFilter = null
        }

        this.updateTable()
        this.#errorLogger('filter:', this.groupFilter, ', group(s) set.')
        this.#scrollToTodayEvent()
    }

    setEventFilterByMonth(month) {
        if(month === null | month === undefined){
            this.monthFilter = false
        } else {
            this.monthFilter = true
            this.selectedMonth = month
        }

        this.monthSelect(month)
        this.updateTable()
        this.#updateTableHeader(month)
        this.#errorLogger('filter:', month, ',month set.')
        this.#scrollToTodayEvent()
    }

    // Visual #####################################################################
    #updateTableHeader(setMonth=false){
        const parentElement = this.element.querySelector('.eventTableHeaderContainer')
        parentElement.innerHTML = ``

        const header = document.createElement('div')
        header.classList.add('eventTableHeader')
        header.innerHTML = `
            <div>
                <div class='tableHeaderText'>Kuukausi:</div>
                <select class='monthSelect'></select>
            </div>
        `

        /*Month Selector ############################################*/
        const monthSelector = header.querySelector('.monthSelect')

        const optionMonthAll = document.createElement('option')
        optionMonthAll.appendChild(document.createTextNode('Kaikki'))
        monthSelector.appendChild(optionMonthAll)

        for (let month = 0; month <= 11; month++){
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(this.#getKuukasiFromNumber(month)))
            monthSelector.appendChild(option)
        }

        if(typeof setMonth === 'number' && setMonth >= 0 && setMonth <= 11){
            monthSelector.value = this.#getKuukasiFromNumber(setMonth)
        }

        monthSelector.addEventListener('change', () => {
            if(monthSelector.value !== 'Kaikki'){
                this.setEventFilterByMonth(monthSelector.options.selectedIndex - 1)
            } else {
                this.setEventFilterByMonth(null)
            }
        })
        /*Month Selector end ########################################*/

        parentElement.appendChild(header)
    }

    render(){
        this.element.innerHTML = `
            <div class='vktContainer'>
                <div class='eventTableHeaderContainer'>
                </div>

                <div class='eventList'>
                    <div>Error...</div>
                </div>
            </div>
        `

        this.#updateTableHeader()
        this.updateTable()

        //this.#scrollToTodayEvent()
        if(this.firstEventToday){
            this.#scrollToEventElement(this.firstEventToday.element)
        }
    }

    #eventDomElement(yearEvent){
        const eventElement = document.createElement('div')
        eventElement.classList.add('eventElement')
        eventElement.id = yearEvent.id

        //let datstr = new Date(mydat - mydat.getTimezoneOffset()*60_000).toISOString()
        let [year, clockStart] = new Date(yearEvent.start - this.dateToday.getTimezoneOffset()*60_000).toISOString().split('T')
        let [, clockEnd] = new Date(yearEvent.end - this.dateToday.getTimezoneOffset()*60_000).toISOString().split('T')
        //let [year, clockStart] = yearEvent.start.toISOString().split('T')
        //let [, clockEnd] = yearEvent.end.toISOString().split('T')

        year = year.split('-').reverse().join('.')
        clockStart = clockStart.slice(0,5)
        clockEnd = clockEnd.slice(0,5)

        const markerColor = `--mkColor: ${this._getColorFromPriority(yearEvent.priority)}`
        eventElement.innerHTML = `
            <div class='eventDateInfo'>
                <div class='baseText'>${year}</div>
                <div class='baseText'>${clockStart}-${clockEnd}</div>
            </div>

            <div class='eventMainInfo'>
                <div class='baseTextBold withMarker' style='${markerColor}'>${yearEvent.title}</div>
                <div class='baseText eventContent'>${yearEvent.content}</div>
            </div>

            <div class='eventButtons'>
                <button class='deleteButton baseButton baseRed'>poista</button>
            </div>
        `

        const deleteButton = eventElement.querySelector('.deleteButton')
        deleteButton.addEventListener('click', () => {
            this.deleteClick(yearEvent.id, yearEvent.series_id)
        })

        eventElement.addEventListener('click', (e) => {
            if(e.target instanceof HTMLButtonElement) return
            this.eventClick({element: eventElement, data:yearEvent})
        })

        return eventElement
    }

    updateTable(selectId=null){
        const eventList = this.element.querySelector('.eventList')
        eventList.innerHTML = ''

        this.firstEventToday = null

        for (const yearEvent of this.YearEvents.events) {
            // filter style if event.group is array... workaround because it used to be string..
            if(this.groupFilter) {
                if(Array.isArray(yearEvent.group)){
                    let groupMatches = false
    
                    for(const group_filter of this.groupFilter){
                        for(const event_group of yearEvent.group) {
                            if(group_filter === event_group){
                                groupMatches = true
                            }
                        }
                    }
    
                    // filter out if no match
                    if(!groupMatches) continue
                    
                } else if(typeof yearEvent.group === 'string'){
                    if(!this.groupFilter.includes(yearEvent.group)){
                        continue
                    }
                }
            }

            if(this.monthFilter){
                if(yearEvent.start.getMonth() !== this.selectedMonth) {
                    continue
                }
            }

            const eventElement = this.#eventDomElement(yearEvent)
            
            //if(this.firstEventToday === null & yearEvent.start.getMonth() === this.dateToday.getMonth()){
            if(this.firstEventToday === null & yearEvent.start >= this.dateToday){
                this.firstEventToday = {element: eventElement, data: yearEvent}
                this.firstEventToday.element.style = 'border-top: 5px solid gold; border-bottom: 5px solid gold;'
            }
            
            eventList.append(eventElement)
        }
    }

    _getColorFromPriority(priority){
        switch (priority) {
            case 1:
                return 'red'
            case 2:
                return 'orange'
            case 3:
                return 'gold'
            case 4:
                return 'limegreen'
            case 5:
                return 'darkgreen'
            default:
                return 'grey'
        }
    }
}