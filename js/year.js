/*
document.addEventListener('DOMContentLoaded', async () => {
    const vkElement = document.getElementById('VuosiKalenteri')
    if (vkElement === null) return

    const yearEvents = new YearEvents(generatedEvents)
    
    const YearCircle = new VuosiKalenteri(
        vkElement, {
            yearEvents,
            monthClick: (month) => {
                let pResult = confirm('Add test event?')
                if(pResult) {
                    yearEvents.addEvent({
                        id: idGenerator(),
                        date: new Date(new Date().setMonth(month)).toUTCString(),
                        group: 'johto',
                        title: 'TEST',
                        content: 'TEST CONTENT BLA BLA BLA'
                    })
                }
            },
            eventClick: (id) => {
                yearEvents.deleteEvent(id)
            }
        }
    )

    document.addEventListener(yearEvents.eventUpdateName, () => {
        YearCircle.updateMonthElements()
    })
    
    YearCircle.render()

    YearCircle.setEventFilterByGroup('johto')

    if (false) {
        setTimeout(() => {
            YearCircle.setEventFilterByGroup('johto')
        }, 1000)
    
        setTimeout(() => {
            yearEvents.addEvent({
                id: 101,
                date: '2025-01-19T16:48:18.060Z',
                group: 'johto',
                title: 'juhlat',
                content: 'jotkut bileet jee jee'
            })
        }, 2000)

        setTimeout(() => {
            yearEvents.deleteEvent(19)
        }, 3000)
    }
})
*/

// YearClass #########################################################################
class VuosiKalenteri {
    element
    #dateNow = new Date() // '2024-01-19T16:48:18.060Z'
    YearEvents
    monthElements
    maxEventsPerMonth = 4

    monthClick = null
    eventClick

    eventFilter = null

    #errorLog = true

    constructor(element, {yearEvents, monthClick, eventClick, eventFilter}) {
        this.element = this.#CheckIfDomElement(element)
        this.YearEvents = yearEvents
        this.monthElements = []

        this.monthClick = monthClick && typeof monthClick == 'function' ? monthClick : this.#monthClickFunction
        this.eventClick = eventClick && typeof eventClick == 'function' ? eventClick : this.#eventClickFunction
        this.eventFilter = eventFilter ? eventFilter : null
    }

    #CheckIfDomElement(element){
        if(element && element instanceof HTMLElement){
            return element
        } else {
            throw new Error(`${element} is not an instance of HTMLElement`)
        }
    }

    #eventClickFunction(id){
        this.#errorLogger('#eventClickFunction:', id)
    }

    #monthClickFunction(month){
        this.#errorLogger('#monthClickFunction:', month)
    }

    #errorLogger(...params){
        if (this.#errorLog) {
            console.log('cLogger:', ...params)
        }
    }

    setEventFilterByGroup(group) {
        if(!group){
            this.eventFilter = null
        } else {
            this.eventFilter = group
        }

        this.updateMonthElements()
        this.#errorLogger('filter:', group, ',set.')
    }

    // Visual side ###################

    render() {
        /*
        this.element.innerHTML = `
        <div class='VuosiKalenteriContainer'>
            <div id='MonthCircle' style='--m: 12'>
                <div id='CircleCenter'>
                    <p>${this.#dateNow.getFullYear()}</p>
                </div>
            </div>
        </div>
        `
        */

        this.element.innerHTML = `
            <div id='MonthCircle' style='--m: 12'>
                <div id='CircleCenter'>
                    <p>${this.#dateNow.getFullYear()}</p>
                </div>
            </div>
        `

        const circleElement = document.getElementById('MonthCircle')
        this._createMonthElements(circleElement)
        this.updateMonthElements()
    }

    _createMonthElements(element){
        for(let month = 0; month <= 11; month++){
            const newElement = document.createElement('div')
            newElement.id = 'MonthElement'
            newElement.style = `--i: ${month};`
            newElement.innerHTML = `
            <p>month${month}</p>
            `
            if (this.monthClick) {
                newElement.addEventListener('click', (event) => {
                    // call function only if the monthelement was clicked
                    // we dont want call if individual yearEvent was clicked instead
                    if(event.target.id === 'MonthElement'){
                        this.monthClick(month)
                    }
                })
            }
            element.append(newElement)
            this.monthElements.push(newElement)
        }
    }

    updateMonthElements(){
        //filter and sort by months, temporary array.
        let eventsMonthSorted = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[], 8:[], 9:[], 10:[], 11:[], 12:[]}
        for (const yearEvent of this.YearEvents.events) {
            // get only events from current year
            if(yearEvent.start.getFullYear() !== this.#dateNow.getFullYear()){
                continue
            }

            //filter by group
            if(this.eventFilter){
                if (this.eventFilter !== yearEvent.group){
                    continue
                }
            }

            eventsMonthSorted[yearEvent.start.getMonth()].push(yearEvent)
        }
        
        for(let month = 0; month <= 11; month++){

            this.monthElements[month].innerHTML = `
                <h4>${this._getKuukasiFromNumber(month)}</h4>
            `

            if (eventsMonthSorted[month].length > 0) {
                for (let index = 0; index < this.maxEventsPerMonth -1 && index < eventsMonthSorted[month].length; index++) {
                    const newEventElement = document.createElement('p')
                    newEventElement.textContent = eventsMonthSorted[month][index].title

                    const id = eventsMonthSorted[month][index].id
                    newEventElement.addEventListener('click', () => {
                        //this.eventClick(this.getEvent(id))
                        this.eventClick(id)
                        this.updateMonthElements()
                    })

                    this.monthElements[month].append(newEventElement)
                }
            }
        }
        
       eventsMonthSorted = null
    }

    _getKuukasiFromNumber(kuukausi){
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
                this.#errorLog('Month out of range 0-11')
                return 'getKuukausiFault'
        }
    }
}