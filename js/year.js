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

    selectedMonth = this.#dateNow.getMonth()

    constructor(element, {yearEvents, monthClick, eventClick, eventFilter, centerClick}) {
        this.element = this.#CheckIfDomElement(element)
        this.YearEvents = yearEvents
        this.monthElements = []

        this.monthClick = monthClick && typeof monthClick == 'function' ? monthClick : this.#monthClickFunction
        this.eventClick = eventClick && typeof eventClick == 'function' ? eventClick : this.#eventClickFunction
        this.centerClick = eventClick && typeof centerClick == 'function' ? centerClick : this.#centerClickFunction
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

    #centerClickFunction(){
        console.log('#centerClickFunction:')
    }

    #errorLogger(...params){
        if (this.#errorLog) {
            console.log('cLogger(year.js):', ...params)
        }
    }

    setMonth(month){
        this.selectedMonth = month
        this.updateMonthElements()
    }

    // assuming group is string array.
    setEventFilterByGroup(group) {
        if(!Array.isArray(group)){
            throw new Error('setEventFilterByGroup parameter was not an array.')
        }

        if(!group){
            this.eventFilter = null
        } else {
            if(group.length === 0) {
                this.eventFilter = null
            } else {
                this.eventFilter = group
            }
        }

        this.updateMonthElements()
        this.#errorLogger('filter:', this.eventFilter, ',set.')
    }

    dateString(date){
        return date.toISOString().split('T')[0].split('-').reverse().join('.')
    }

    // Visual side ###################
    render() {
        this.element.innerHTML = `
            <div id='MonthCircle' style='--m: 12'>
                <div class='CircleCenter'>
                </div>
            </div>
        `

        const center = this.element.querySelector('.CircleCenter')
        center.innerHTML = `
            <div class='ycHeaderText'>${this.#dateNow.getFullYear()}</div>
            <div class='ycBaseText'>${this.dateString(this.#dateNow)}</div>
        `
        center.addEventListener('click', () => {
            this.centerClick()

            this.selectedMonth = null
            this.updateMonthElements()
        })

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
                    if(event.target.id === 'MonthElement' || event.target.id === 'monthTitle'){
                        this.monthClick(month)

                        //this is done to recolor selected.
                        this.selectedMonth = month
                        this.updateMonthElements()
                    }
                })
            }
            element.append(newElement)
            this.monthElements.push(newElement)
        }
    }

    updateMonthElements(){

        function createMonthElement(VuosiKalenteri, event){
            const newEventElement = document.createElement('div')
            newEventElement.style = `--mkColor: ${VuosiKalenteri._getColorFromPriority(event.priority)}`
            newEventElement.classList.add('mtBaseText')
            newEventElement.textContent = event.title

            newEventElement.addEventListener('click', () => {
                VuosiKalenteri.eventClick(event)
                VuosiKalenteri.updateMonthElements()
            })

            return newEventElement
        }

        //sort by date
        function sortEventsByPriorityThenDate(events){
            const newEvents = events.toSorted((a, b) => {
                if(a.priority > b.priority){
                    return 1
                } else if (a.priority < b.priority){
                    return -1
                }
    
                return a.start - b.start
            })
            
            return newEvents
        }

        const newEventsArray = sortEventsByPriorityThenDate(this.YearEvents.events)

        //filter and sort by months, temporary array.
        let eventsMonthSorted = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[], 8:[], 9:[], 10:[], 11:[], 12:[]}
        for (const yearEvent of newEventsArray) { //this.YearEvents.events
            // get only events from current year
            if(yearEvent.start.getFullYear() !== this.#dateNow.getFullYear()){
                continue
            }

            if(this.eventFilter){
                if(Array.isArray(yearEvent.group)){
                    //filter by group array
                    if(this.eventFilter){
                        let groupMatches = false
                        for(const groupFilter of this.eventFilter) {
                            for (const groupEvent of yearEvent.group) {
                                if(groupFilter === groupEvent){
                                    groupMatches = true
                                }
                            }
                        }
                        
                        //no matches, skip rest.
                        if(!groupMatches) continue
                    }
                } else if(typeof yearEvent.group === 'string'){
                    if(!this.eventFilter.includes(yearEvent.group)){
                        continue
                    }
                }
            }

            eventsMonthSorted[yearEvent.start.getMonth()].push(yearEvent)
        }

        // Sort by priority
        /*
        for(let month = 0; month <= 11; month++){
            eventsMonthSorted[month].sort((a, b) => a.priority - b.priority)
        }
        */
        
        for(let month = 0; month <= 11; month++){

            //const isSelected = month === this.selectedMonth ? true : false
            this.monthElements[month].innerHTML = `
                <div id='monthTitle'>${this._getKuukasiFromNumber(month)}</div>
            `
            if(month === this.selectedMonth){
                this.monthElements[month].classList.add('selectedMonth')
            } else {
                this.monthElements[month].classList.remove('selectedMonth')
            }

            if (eventsMonthSorted[month].length > 0) {
                //BAD solution for filtering out older events to push current at the top
                if(month === this.#dateNow.getMonth() && eventsMonthSorted[month].length > this.maxEventsPerMonth){
                    let elementsAdded = 0
                    for (let index = 0; index < eventsMonthSorted[month].length; index++) {
                        if(elementsAdded > this.maxEventsPerMonth) continue

                        //console.log('now:', this.#dateNow.getTime() , 'event:', eventsMonthSorted[month][index].start.getTime())
                        if(eventsMonthSorted[month][index].start.getTime() - this.#dateNow.getTime() <= -86_400_000){
                            continue
                        }

                        const newEventElement = createMonthElement(this, eventsMonthSorted[month][index])

                        this.monthElements[month].append(newEventElement)
                        elementsAdded++;
                    }

                    continue
                }
            
                for (let index = 0; index < this.maxEventsPerMonth && index < eventsMonthSorted[month].length; index++) {
                    const newEventElement = createMonthElement(this, eventsMonthSorted[month][index])
                    

                    this.monthElements[month].append(newEventElement)
                }
            }
        }
        
       eventsMonthSorted = null
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