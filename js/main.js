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
    const mainElement = document.getElementById('VuosiKalenteri')
    if (mainElement === null) return

    let eventData = []

    mainElement.innerHTML = `
        <button class='testButton'>Test</button>
    `

    console.log(testData)
})
*/

function dateNoTimezone(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}

document.addEventListener('DOMContentLoaded', async () => {
    const vkElement = document.getElementById('VuosiKalenteri')
    if (vkElement === null) return

    vkElement.innerHTML = `
        <div class='vuosiKalenteriContainer' style='display: flex;'>
            <div class='circleContainer'>
                <p>a</p>
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
})


class YearEvent {
    constructor (id, series_id,  priority, start, end, group, title, content, reservor) {
        this.id = id
        this.series_id = series_id
        this.priority = priority
        this.start = start
        this.end = end
        this.group = group
        this.title = title
        this.content = content
        this.reservor = reservor
    }
}

class YearEvents {
    events

    #errorLog = true

    eventUpdateName = 'vuosiKalenteriUpdate'
    
    constructor(eventsJsonArray) {
        if(Array.isArray(eventsJsonArray) === false) throw new Error('eventsJsonArray not an array')
        this.events = []
        this.#Initialize(eventsJsonArray)
    }

    #Initialize(eventsJsonArray){
        for (const obj of eventsJsonArray) {
            if('id' in obj && 'start' in obj && 'group' in obj && 'title' in obj && 'content' in obj){
                this.events.push(
                    new YearEvent(
                        obj.id,
                        obj.series_id,
                        obj.priority,
                        new Date(obj.start),
                        new Date(obj.end),
                        obj.group, 
                        obj.title, 
                        obj.content,
                        obj.reservor
                    )
                )
            } else {
                this.#errorLog('event:', obj)
                throw new Error('malformed eventsJsonArray')
            }
        }

        // sort by date
        this.events.sort((a, b) => {
            return a.start - b.start
        })
    }

    #errorLogger(...params){
        if (this.#errorLog) {
            console.log('eLogger:', ...params)
        }
    }

    getEvent(id) {
        if(typeof id !== 'number' || id % 1 !== 0) {
            throw new Error('id is not a integer')
        }
        return this.events.find((yearEvent) => yearEvent.id === id)
    }

    deleteEvent(id){
        if(typeof id !== 'number' || id % 1 !== 0) {
            throw new Error('id is not a integer')
        }

        const filteredEvents = this.events.filter(yearEvent => 
            yearEvent.id !== id
        )

        if(filteredEvents.length !== this.events.length){
            this.events = filteredEvents
            this.#errorLogger('event with id:', id, 'deleted')
            document.dispatchEvent(new Event(this.eventUpdateName))
        } else {
            this.#errorLogger('no event with id:', id, 'found when deleting')
        }

    }

    addEvent({id, start, group, title, content}) {
        if(typeof id !== 'number' || id % 1 !== 0) {
            throw new Error('id is not a integer')
        }

        if (this.getEvent(id)) {
            throw new Error(`event with id: ${id} already exists`)
        }

        this.events.push(new YearEvent(
            id,
            new Date(start),
            group,
            title,
            content
        ))

        this.#errorLogger('event with id:', id, 'added.')
        document.dispatchEvent(new Event(this.eventUpdateName))
    }
}


class VuosiTable {
    element
    YearEvents
    groups

    monthClick = null
    
    selectedMonth = 3
    monthFilter = false
    groupFilter = null

    #errorLog = true

    eventUpdateName = 'vuosiKalenteriUpdate'

    constructor(element, {yearEvents, monthClick, deleteClick, groups}) {
        this.element = this.#CheckIfDomElement(element)
        this.YearEvents = yearEvents

        this.monthClick = monthClick && typeof monthClick == 'function' ? monthClick : this.#monthClickFunction

        this.deleteClick = deleteClick && typeof deleteClick == 'function' ? deleteClick : this.#deleteEventFunction

        this.groups = groups ? groups : []

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

    #monthClickFunction(month){
        this.#errorLogger('monthClickFunction:', month)
        this.updateTable()
    }

    #deleteEventFunction(id){
        this.#errorLogger('deleteEventFunction:', id)
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
    }

    setEventFilterByMonth(month) {
        if(month === null | month === undefined){
            this.monthFilter = false
        } else {
            this.monthFilter = true
            this.selectedMonth = month
        }

        this.updateTable()
        this.#errorLogger('filter:', month, ',month set.')
    }

    // Visual #####################################################################

    #buttonGenerator(){
        const monthSelection = document.createElement('div')
        monthSelection.classList.add('vktMonths')

        for (let month = 0; month <= 11; month++){
            const msButton = document.createElement('button')
            msButton.textContent = this.#getKuukasiFromNumber(month)

            msButton.addEventListener('click', () => {
                this.selectedMonth = month
                this.updateTable()
                //this.monthClick(month)
            })

            monthSelection.appendChild(msButton)
        }

        return monthSelection
    }

    #tableHeader(){
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

        monthSelector.addEventListener('change', () => {
            if(monthSelector.value !== 'Kaikki'){
                this.setEventFilterByMonth(monthSelector.options.selectedIndex - 1)
            } else {
                this.setEventFilterByMonth(null)
            }
        })
        /*Month Selector end ########################################*/

        return header
    }

    render(){
        this.element.innerHTML = `
            <div class='vktContainer'>
                <div class='eventTableHeaderContainer'>
                </div>

                <div class='eventList'>
                    <div class='myTestElem'>
                        <h1>header</h1>
                        <p>paragraph</p>
                    </div>

                    <div class='myTestElem'>
                        <h1>header</h1>
                        <p>paragraph</p>
                    </div>

                    <div class='myTestElem'>
                        <h1>header</h1>
                        <p>paragraph</p>
                    </div>

                    <div class='myTestElem'>
                        <h1>header</h1>
                        <p>paragraph</p>
                    </div>
                </div>
            </div>
        `

        //this.element.querySelector(".eventTableHeader").appendChild(this.#buttonGenerator())
        this.element.querySelector(".eventTableHeaderContainer").appendChild(this.#tableHeader())

        this.updateTable()
    }

    #eventDomElement(yearEvent){
        const eventElement = document.createElement('div')
        eventElement.classList.add('eventElement')

        let [year, clockStart] = yearEvent.start.toISOString().split('T')
        let [, clockEnd] = yearEvent.end.toISOString().split('T')
        year = year.split('-').reverse().join('.')
        clockStart = clockStart.slice(0,5)
        clockEnd = clockEnd.slice(0,5)

        eventElement.innerHTML = `
            <div class='eventDateInfo'>
                <div>${year}</div>
                <div>${clockStart}-${clockEnd}</div>
            </div>

            <div>
                <div class='baseTextBold'>${yearEvent.title}</div>
                <div class='baseText'>${yearEvent.content}</div>
            </div>

            <div class='eventOtherInfo'>
                <div>prioriteetti: ${yearEvent.priority}</div>
                <div>varaaja: ${yearEvent.reservor}</div>
            </div>

            <div class='eventButtons'>
                <button class='infoButton baseButton'>info</button>
                <button class='deleteButton baseButton baseRed'>poista</button>
            </div>
        `

        const deleteButton = eventElement.querySelector('.deleteButton')
        deleteButton.addEventListener('click', () => {
            this.deleteClick(yearEvent.id)
        })

        const infoButton = eventElement.querySelector('.infoButton')
        infoButton.addEventListener('click', () => {
            console.log('date:', year, clockStart, clockEnd)
            console.log('grps', this.groups)
        })

        return eventElement
    }

    #eventDomElement2(yearEvent){
        const eventElement = document.createElement('div')
                eventElement.classList.add('eventElement')

                eventElement.innerHTML = `
                    <h1>${yearEvent.title}</h1>
                    <p>${yearEvent.content}</p>
                    <p>${yearEvent.group}</p>
                    <p>${yearEvent.start.toISOString()}</p>
                `

                const deleteButton = document.createElement('button')
                deleteButton.innerText = 'delete'
                deleteButton.addEventListener('click', () => {
                    this.deleteClick(yearEvent.id)
                })

                eventElement.append(deleteButton)

                return eventElement
    }

    updateTable(){
        const eventList = this.element.querySelector('.eventList')
        eventList.innerHTML = ''

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

            eventList.append(this.#eventDomElement(yearEvent))
        }
    }
}


let testData = [
    {"id":1461983130,"series_id":null,"priority":5,"reservor":"Rackham","group":"Kouhu","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-13T10:00:00.000Z","end":"2025-04-13T12:00:00.000Z"},{"id":14640275,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-14T10:00:00.000Z","end":"2025-04-14T12:00:00.000Z"},{"id":765741625,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-16T10:00:00.000Z","end":"2025-04-16T12:00:00.000Z"},{"id":2112347033,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-18T10:00:00.000Z","end":"2025-04-18T12:00:00.000Z"},{"id":859044917,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-21T10:00:00.000Z","end":"2025-04-21T12:00:00.000Z"},{"id":34677464,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-23T10:00:00.000Z","end":"2025-04-23T12:00:00.000Z"},{"id":811002305,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-25T10:00:00.000Z","end":"2025-04-25T12:00:00.000Z"},{"id":1633812838,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-28T10:00:00.000Z","end":"2025-04-28T12:00:00.000Z"},{"id":302067611,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-30T10:00:00.000Z","end":"2025-04-30T12:00:00.000Z"},{"id":1653275679,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-02T10:00:00.000Z","end":"2025-05-02T12:00:00.000Z"},{"id":1054248080,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-05T10:00:00.000Z","end":"2025-05-05T12:00:00.000Z"},{"id":1187774971,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-07T10:00:00.000Z","end":"2025-05-07T12:00:00.000Z"},{"id":430715747,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-09T10:00:00.000Z","end":"2025-05-09T12:00:00.000Z"},{"id":1368657294,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-12T10:00:00.000Z","end":"2025-05-12T12:00:00.000Z"},{"id":1047990459,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-15T10:00:00.000Z","end":"2025-04-15T12:00:00.000Z"},{"id":1385368390,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-16T10:00:00.000Z","end":"2025-04-16T12:00:00.000Z"},{"id":1953760580,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-17T10:00:00.000Z","end":"2025-04-17T12:00:00.000Z"},{"id":1701745091,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-18T10:00:00.000Z","end":"2025-04-18T12:00:00.000Z"},{"id":1317871231,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-21T10:00:00.000Z","end":"2025-04-21T12:00:00.000Z"},{"id":1285113709,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-29T10:00:00.000Z","end":"2025-04-29T12:00:00.000Z"},{"id":1056473312,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-30T10:00:00.000Z","end":"2025-04-30T12:00:00.000Z"},{"id":661803076,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-01T10:00:00.000Z","end":"2025-05-01T12:00:00.000Z"},{"id":2017996052,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-02T10:00:00.000Z","end":"2025-05-02T12:00:00.000Z"},{"id":848540806,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-05T10:00:00.000Z","end":"2025-05-05T12:00:00.000Z"},{"id":1065671817,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-13T10:00:00.000Z","end":"2025-05-13T12:00:00.000Z"},{"id":854462951,"series_id":1225592149,"priority":2,"reservor":"Rackham","group":"Wörkkis","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-22T10:00:00.000Z","end":"2025-04-22T12:00:00.000Z"},{"id":1593639544,"series_id":1225592149,"priority":2,"reservor":"Rackham","group":"Wörkkis","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-24T10:00:00.000Z","end":"2025-04-24T12:00:00.000Z"},{"id":23347379,"series_id":1225592149,"priority":2,"reservor":"Rackham","group":"Wörkkis","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-06T10:00:00.000Z","end":"2025-05-06T12:00:00.000Z"},{"id":1713809491,"series_id":1225592149,"priority":2,"reservor":"Rackham","group":"Wörkkis","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-08T10:00:00.000Z","end":"2025-05-08T12:00:00.000Z"},{"id":791110706,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-14T10:00:00.000Z","end":"2025-04-14T12:00:00.000Z"},{"id":1185677562,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-18T10:00:00.000Z","end":"2025-04-18T12:00:00.000Z"},{"id":1882516250,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-21T10:00:00.000Z","end":"2025-04-21T12:00:00.000Z"},{"id":727203851,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-25T10:00:00.000Z","end":"2025-04-25T12:00:00.000Z"},{"id":1176848371,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-28T10:00:00.000Z","end":"2025-04-28T12:00:00.000Z"},{"id":686564605,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-02T10:00:00.000Z","end":"2025-05-02T12:00:00.000Z"},{"id":1487374122,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-05T10:00:00.000Z","end":"2025-05-05T12:00:00.000Z"},{"id":586716818,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-09T10:00:00.000Z","end":"2025-05-09T12:00:00.000Z"},{"id":1633221642,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-12T10:00:00.000Z","end":"2025-05-12T12:00:00.000Z"}
]