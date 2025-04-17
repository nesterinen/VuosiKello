/*
datatype: {
    id: int
    series_id: int | null
    priority: int
    reservor: str
    group: str
    title: str
    content: str
    start: date
    end: date
}
*/

/*
document.addEventListener('DOMContentLoaded', async () => {
    const vkElement = document.getElementById('VuosiKalenteri')
    if (vkElement === null) return

    vkElement.innerHTML = `
        <div class='vuosiKalenteriContainer' style='display: flex;'>
            <div class='circleContainer'>
                <p>cContainer</p>
                <button class='testButton'>Test</button>
            </div>

            <div class='tableContainer'>
                <p>b</p>        
            </div>
        </div>
    `
    const tableContainer = vkElement.querySelector('.tableContainer')

    const yearEvents = new YearEvents(testData)

    console.log(yearEvents)

    const vuosiTable = new VuosiTable(
        tableContainer,
        {
            yearEvents,
            groups: php_args.groups,
            deleteClick: (id) => {
                yearEvents.deleteEvent(id)
            }
        }
    )

    document.addEventListener(yearEvents.eventUpdateName, () => {
        vuosiTable.updateTable()
    })
    

    vuosiTable.render()

    const testButton = vkElement.querySelector('.testButton')
    testButton.addEventListener('click', async () => {

        const dialogResult = await EventCreationDialog(php_args.groups).catch((e) => {
            console.log(e)
            return null
        })

        if (!dialogResult) {
            console.log('done')
            return
        }

        if(dialogResult.series === false) {
            const result = backendSimulationIndividual(dialogResult.data)
            yearEvents.addEvent(result)
            yearEvents.sortEventsByDate()
            vuosiTable.updateTable()
        } else {
            const result = backendSimulationMultiple(dialogResult.data)
            for(const event of result) {
                yearEvents.addEvent(event)
            }
            yearEvents.sortEventsByDate()
            vuosiTable.updateTable()
        }
    })
})
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
    firstEventToday = null//{element: null, data: null}
    dateToday = new Date()

    constructor(element, {yearEvents, eventClick, deleteClick, groups}) {
        this.element = this.#CheckIfDomElement(element)
        this.YearEvents = yearEvents

        this.eventClick = eventClick && typeof eventClick == 'function' ? eventClick : this.#eventClickFunction
        this.deleteClick = deleteClick && typeof deleteClick == 'function' ? deleteClick : this.#deleteEventFunction

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

    #deleteEventFunction(id){
        this.#errorLogger('deleteEventFunction:', id)
    }

    #eventClickFunction({element, data}){
        this.#errorLogger('eventClickFunction', element, data)
        //this.selectEvent(data.id)
    }

    selectEvent(id){
        if(this.selectedEvent) {
            this.selectedEvent.style = ''
        }
        this.selectedEvent = this.#getEventElement(id)
        if(this.selectedEvent === null) return
        this.#scrollToEventElement(this.selectedEvent)
        this.selectedEvent.style = 'border-top: 5px solid Yellow; border-bottom: 5px solid Yellow;'
        //this.updateTable(id)
    }

    #errorLogger(...params){
        if (this.#errorLog) {
            console.log('tLogger:', ...params)
        }
    }

    setEventFilterByGroup(group) {
        if(!group){
            this.groupFilter = null
        } else {
            this.groupFilter = group
        }

        this.updateTable()
        this.#errorLogger('filter:', group, ', group set.')
        this.#scrollToTodayEvent()
    }

    setEventFilterByMonth(month) {
        if(month === null | month === undefined){
            this.monthFilter = false
        } else {
            this.monthFilter = true
            this.selectedMonth = month
        }

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
                <div class='baseTextBold'>ryhmä</div>
                <select class='groupSelect'></select>
            </div>
            <div>
                <div class='baseTextBold'>kuukausi</div>
                <select class='monthSelect'></select>
            </div>
        `

        /*Group Selector ############################################*/
        const groupSelector = header.querySelector('.groupSelect')

        const optionGroupAll = document.createElement('option')
        optionGroupAll.appendChild(document.createTextNode('Kaikki'))
        groupSelector.appendChild(optionGroupAll)

        Object.keys(this.groups).map(group => {
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(group))
            groupSelector.appendChild(option)
        })

        groupSelector.addEventListener('change', () => {
            if(groupSelector.value !== 'Kaikki'){
                this.setEventFilterByGroup(groupSelector.value)
            } else {
                this.setEventFilterByGroup(null)
            }
        })
        /*Group Selector end ########################################*/


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
        //return header
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

        //this.element.querySelector(".eventTableHeader").appendChild(this.#buttonGenerator())
        //this.element.querySelector(".eventTableHeaderContainer").appendChild(this.updateTableHeader())

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

        let [year, clockStart] = yearEvent.start.toISOString().split('T')
        let [, clockEnd] = yearEvent.end.toISOString().split('T')
        year = year.split('-').reverse().join('.')
        clockStart = clockStart.slice(0,5)
        clockEnd = clockEnd.slice(0,5)

        eventElement.innerHTML = `
            <div class='eventDateInfo'>
                <div class='baseText'>${year}</div>
                <div class='baseText'>${clockStart}-${clockEnd}</div>
            </div>

            <div class='eventMainInfo'>
                <div class='baseTextBold'>${yearEvent.title}</div>
                <div class='baseText eventContent'>${yearEvent.content}</div>
            </div>

            <div class='eventOtherInfo'>
                <div class='baseText'>p: ${yearEvent.priority}</div>
                <div class='baseText'>v: ${yearEvent.reservor}</div>
                <div class='baseText'>r: ${yearEvent.group}</div>
            </div>

            <div class='eventButtons'>
                <button class='infoButton baseButton'>info</button>
                <button class='deleteButton baseButton baseRed'>poista</button>
            </div>
        `

        const deleteButton = eventElement.querySelector('.deleteButton')
        deleteButton.addEventListener('click', () => {
            this.deleteClick(yearEvent.id)
            //this.updateTable()
        })

        const infoButton = eventElement.querySelector('.infoButton')
        infoButton.addEventListener('click', () => {
            this.#errorLogger('infoButton:', year, clockStart, clockEnd)
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
            //filter by group
            if(this.groupFilter){
                if (this.groupFilter !== yearEvent.group){
                    continue
                }
            }

            if(this.monthFilter){
                if(yearEvent.start.getMonth() !== this.selectedMonth) {
                    continue
                }
            }

            const eventElement = this.#eventDomElement(yearEvent)
            
            if(this.firstEventToday === null & yearEvent.start >= this.dateToday){
                this.firstEventToday = {element: eventElement, data: yearEvent}
                this.firstEventToday.element.style = 'border-top: 5px solid Chartreuse; border-bottom: 5px solid Chartreuse;'
            }

            if(selectId){
                if(yearEvent.id === selectId){
                    eventElement.style = 'border-top: 5px solid Yellow; border-bottom: 5px solid Yellow;'
                }
            }

            eventList.append(eventElement)
        }
    }
}