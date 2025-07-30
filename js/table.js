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

    selectedMonth = 0
    monthFilter = false
    groupFilter = null
    titleFilter = ''

    #errorLog = true

    eventUpdateName = 'vuosiKalenteriUpdate'

    selectedEvent = null
    firstEventToday = null //{element: null, data: null}
    dateToday = new Date()

    constructor(element, {yearEvents, eventClick, deleteClick, monthSelect, addClick, downloadCSV, downloadICS, downloadJSON, clickFileButton, clickSettingsButton}) {
        this.element = this.#CheckIfDomElement(element)
        this.YearEvents = yearEvents

        this.eventClick = eventClick && typeof eventClick == 'function' ? eventClick : this.#eventClickFunction
        this.deleteClick = deleteClick && typeof deleteClick == 'function' ? deleteClick : this.#deleteEventFunction
        this.monthSelect = monthSelect && typeof monthSelect == 'function' ? monthSelect : this.#monthSelectEventFunction
        
        this.addClick = addClick && typeof addClick == 'function' ? addClick : this.#addClickFunction
        this.downloadCSV = downloadCSV && typeof downloadCSV == 'function' ? downloadCSV : this.#downloadFunction
        this.downloadICS = downloadICS && typeof downloadICS == 'function' ? downloadICS : this.#downloadFunction
        this.downloadJSON = downloadJSON && typeof downloadJSON == 'function' ? downloadJSON : this.#downloadFunction

        this.fileButton = clickFileButton && typeof clickFileButton == 'function' ? clickFileButton : this.#fileButtonFunction
        this.settingsButton = clickSettingsButton && typeof clickSettingsButton == 'function' ? clickSettingsButton : this.#settingsClickFunction
    
        
    }

    #scrollToTodayEvent(){
        let headerHeight = this.element.querySelector('.eventTableHeaderContainer').scrollHeight
        headerHeight = headerHeight ? headerHeight : 0
        
        if(this.firstEventToday){
            this.element.querySelector('.eventList').scrollTo({
                //top: this.firstEventToday.element.offsetTop -  this.firstEventToday.element.scrollHeight - this.firstEventToday.element.offsetHeight,
                top: this.firstEventToday.element.offsetTop -  this.firstEventToday.element.scrollHeight - headerHeight,
                left: 0,
                behavior: 'smooth'
            })
        }
    }

    #scrollToEventElement(eventElement){
        let headerHeight = this.element.querySelector('.eventTableHeaderContainer').scrollHeight
        headerHeight = headerHeight ? headerHeight : 0

        if(eventElement && eventElement instanceof HTMLElement){
            this.element.querySelector('.eventList').scrollTo({
                //top: eventElement.offsetTop -  eventElement.scrollHeight - eventElement.offsetHeight,
                top: eventElement.offsetTop -  eventElement.scrollHeight - headerHeight,
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

    #addClickFunction(){
        this.#errorLogger('addClickFunction')
    }

    #downloadFunction(){
        this.#errorLogger('downloadFunction')
    }

    #fileButtonFunction(id){
        this.#errorLogger('fileClickFunction', id)
    }

    #settingsClickFunction(id, series_id){
        this.#errorLogger('settingsClickFunction', id, series_id)
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
            <div class='tableHeaderText'>Kuukausi:</div>
            <select class='monthSelect'></select>
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

        /*Title filter ############################################## */
        const search = document.createElement('div')
        search.classList.add('eventTableSearch')
        search.innerHTML = `
            <div class='tableHeaderText'>Hae:</div>
            <input class='titleFilterInput' value='${this.titleFilter}'/>
        `
        const titleInput = search.querySelector('.titleFilterInput')
        // change happens on enter, input happens when typing
        titleInput.addEventListener('input', () => {
            this.titleFilter = titleInput.value
            //this.#errorLogger('titleFilter:', this.titleFilter)
            this.updateTable()
        })
        //titleInput.oninput = (e) => console.log('eWTF', e)

        /*Title filter end ########################################## */
        parentElement.appendChild(header)
        parentElement.appendChild(search)
    }

    render(){
        this.element.innerHTML = `
            <div class='vktContainer'>
                <div class='eventTableHeaderContainer'>
                </div>

                <div class='eventList'>
                    <div>Error...</div>
                </div>

                <div class='eventTableFooterContainer'>
                    <button class='eTableAdd baseButton baseGreen'>Lisää tapahtuma</button>
                    <button class='eTableCSV baseButton'>Lataa CSV</button>
                    <button class='eTableICS baseButton'>Lataa ICS</button>
                    <button class='eTableJSON baseButton'>Lataa JSON</button>
                </div>
            </div>
        `

        const addClickButton = this.element.querySelector('.eTableAdd')
        addClickButton.addEventListener('click', () => {
            this.addClick()
        })

        const csvDownloadButton = this.element.querySelector('.eTableCSV')
        csvDownloadButton.addEventListener('click', () => {
            this.downloadCSV()
        })
        const icsDownloadButton = this.element.querySelector('.eTableICS')
        icsDownloadButton.addEventListener('click', () => {
            this.downloadICS()
        })
        const jsonDownloadButton = this.element.querySelector('.eTableJSON')
        jsonDownloadButton.addEventListener('click', () => {
            this.downloadJSON()
        })

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

        //let [year, clockStart] = new Date(yearEvent.start - this.dateToday.getTimezoneOffset()*60_000).toISOString().split('T')
        //let [, clockEnd] = new Date(yearEvent.end - this.dateToday.getTimezoneOffset()*60_000).toISOString().split('T')
        let [year, clockStart] = yearEvent.start.toISOString().split('T')
        let [, clockEnd] = yearEvent.end.toISOString().split('T')

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
                <button class='baseButton tableButton fileButton'>
                    <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 9V17.8C19 18.9201 19 19.4802 18.782 19.908C18.5903 20.2843 18.2843 20.5903 17.908 20.782C17.4802 21 16.9201 21 15.8 21H8.2C7.07989 21 6.51984 21 6.09202 20.782C5.71569 20.5903 5.40973 20.2843 5.21799 19.908C5 19.4802 5 18.9201 5 17.8V6.2C5 5.07989 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.0799 3 8.2 3H13M19 9L13 3M19 9H14C13.4477 9 13 8.55228 13 8V3" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                <button class='baseButton tableButton settingsButton'>
                    <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.9046 3.06005C12.6988 3 12.4659 3 12 3C11.5341 3 11.3012 3 11.0954 3.06005C10.7942 3.14794 10.5281 3.32808 10.3346 3.57511C10.2024 3.74388 10.1159 3.96016 9.94291 4.39272C9.69419 5.01452 9.00393 5.33471 8.36857 5.123L7.79779 4.93281C7.3929 4.79785 7.19045 4.73036 6.99196 4.7188C6.70039 4.70181 6.4102 4.77032 6.15701 4.9159C5.98465 5.01501 5.83376 5.16591 5.53197 5.4677C5.21122 5.78845 5.05084 5.94882 4.94896 6.13189C4.79927 6.40084 4.73595 6.70934 4.76759 7.01551C4.78912 7.2239 4.87335 7.43449 5.04182 7.85566C5.30565 8.51523 5.05184 9.26878 4.44272 9.63433L4.16521 9.80087C3.74031 10.0558 3.52786 10.1833 3.37354 10.3588C3.23698 10.5141 3.13401 10.696 3.07109 10.893C3 11.1156 3 11.3658 3 11.8663C3 12.4589 3 12.7551 3.09462 13.0088C3.17823 13.2329 3.31422 13.4337 3.49124 13.5946C3.69158 13.7766 3.96395 13.8856 4.50866 14.1035C5.06534 14.3261 5.35196 14.9441 5.16236 15.5129L4.94721 16.1584C4.79819 16.6054 4.72367 16.829 4.7169 17.0486C4.70875 17.3127 4.77049 17.5742 4.89587 17.8067C5.00015 18.0002 5.16678 18.1668 5.5 18.5C5.83323 18.8332 5.99985 18.9998 6.19325 19.1041C6.4258 19.2295 6.68733 19.2913 6.9514 19.2831C7.17102 19.2763 7.39456 19.2018 7.84164 19.0528L8.36862 18.8771C9.00393 18.6654 9.6942 18.9855 9.94291 19.6073C10.1159 20.0398 10.2024 20.2561 10.3346 20.4249C10.5281 20.6719 10.7942 20.8521 11.0954 20.94C11.3012 21 11.5341 21 12 21C12.4659 21 12.6988 21 12.9046 20.94C13.2058 20.8521 13.4719 20.6719 13.6654 20.4249C13.7976 20.2561 13.8841 20.0398 14.0571 19.6073C14.3058 18.9855 14.9961 18.6654 15.6313 18.8773L16.1579 19.0529C16.605 19.2019 16.8286 19.2764 17.0482 19.2832C17.3123 19.2913 17.5738 19.2296 17.8063 19.1042C17.9997 18.9999 18.1664 18.8333 18.4996 18.5001C18.8328 18.1669 18.9994 18.0002 19.1037 17.8068C19.2291 17.5743 19.2908 17.3127 19.2827 17.0487C19.2759 16.8291 19.2014 16.6055 19.0524 16.1584L18.8374 15.5134C18.6477 14.9444 18.9344 14.3262 19.4913 14.1035C20.036 13.8856 20.3084 13.7766 20.5088 13.5946C20.6858 13.4337 20.8218 13.2329 20.9054 13.0088C21 12.7551 21 12.4589 21 11.8663C21 11.3658 21 11.1156 20.9289 10.893C20.866 10.696 20.763 10.5141 20.6265 10.3588C20.4721 10.1833 20.2597 10.0558 19.8348 9.80087L19.5569 9.63416C18.9478 9.26867 18.6939 8.51514 18.9578 7.85558C19.1262 7.43443 19.2105 7.22383 19.232 7.01543C19.2636 6.70926 19.2003 6.40077 19.0506 6.13181C18.9487 5.94875 18.7884 5.78837 18.4676 5.46762C18.1658 5.16584 18.0149 5.01494 17.8426 4.91583C17.5894 4.77024 17.2992 4.70174 17.0076 4.71872C16.8091 4.73029 16.6067 4.79777 16.2018 4.93273L15.6314 5.12287C14.9961 5.33464 14.3058 5.0145 14.0571 4.39272C13.8841 3.96016 13.7976 3.74388 13.6654 3.57511C13.4719 3.32808 13.2058 3.14794 12.9046 3.06005Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                <button class='baseButton tableButton deleteButton'>
                    <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `
        // waste basket 🗑 🗑️
        // gear ⚙ &#9881;
        // <span class='glyphicon glyphicon-file'></span>
        // <span class='glyphicon glyphicon-cog'></span>
        // <span class='glyphicon glyphicon-trash'></span>
        const fileButton = eventElement.querySelector('.fileButton')
        fileButton.addEventListener('click', () => {
            this.fileButton(yearEvent.id)
        })

        const settingsButton = eventElement.querySelector('.settingsButton')
        settingsButton.addEventListener('click', () => {
            this.settingsButton(yearEvent.id, yearEvent.series_id)
        })

        const deleteButton = eventElement.querySelector('.deleteButton')
        deleteButton.addEventListener('click', () => {
            this.deleteClick(yearEvent.id, yearEvent.series_id)
        })


        eventElement.addEventListener('click', (e) => {
            if(e.target instanceof HTMLButtonElement || e.target instanceof HTMLSpanElement) return
            this.eventClick({element: eventElement, data:yearEvent})
        })

        return eventElement
    }

    //refactor later? rerendering everything everytime instead of hiding seems pretty ineffictient
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

            if(this.titleFilter !== ''){
                //if(!yearEvent.title.includes(this.titleFilter)){
                if(!yearEvent.title.toLowerCase().includes(this.titleFilter.toLowerCase())){
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