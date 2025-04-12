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
    const circleContainer = vkElement.querySelector('.circleContainer')

    const yearEvents = new YearEvents(generatedEvents)

    const vuosiTable = new VuosiTable(
        tableContainer,
        {
            yearEvents,
            deleteClick: (id) => {
                yearEvents.deleteEvent(id)
            }
        }
    )

    const YearCircle = new VuosiKalenteri(
        circleContainer,
        {
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
        vuosiTable.updateTable()
        YearCircle.updateMonthElements()
    })
    

    YearCircle.render()
    vuosiTable.render()


    //vuosiTable.setEventFilterByGroup('johto')
})


class VuosiTable {
    element
    YearEvents

    selectedMonth = 0
    monthClick = null
    eventFilter = null

    #errorLog = true

    eventUpdateName = 'vuosiKalenteriUpdate'

    constructor(element, {yearEvents, monthClick, deleteClick}) {
        this.element = this.#CheckIfDomElement(element)
        this.YearEvents = yearEvents
        this.monthClick = monthClick && typeof monthClick == 'function' ? monthClick : this.#monthClickFunction
        this.deleteClick = deleteClick && typeof deleteClick == 'function' ? deleteClick : this.#deleteEventFunction
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
            this.eventFilter = null
        } else {
            this.eventFilter = group
        }

        this.updateTable()
        this.#errorLogger('filter:', group, ',set.')
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

    render(){
        this.element.innerHTML = `
            <div class='vktContainer'>
                <div class='monthSelector'>
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

        this.element.querySelector(".monthSelector").appendChild(this.#buttonGenerator())
        const p1 = document.createElement('p')
        p1.textContent = 'hello'

        this.element.querySelector(".monthSelector").appendChild(p1)

        this.updateTable()
    }

    updateTable(){
        const eventList = this.element.querySelector('.eventList')
        eventList.innerHTML = ''

        for (const yearEvent of this.YearEvents.events) {
            //filter by group
            if(this.eventFilter){
                if (this.eventFilter !== yearEvent.group){
                    continue
                }
            }

            if(yearEvent.date.getMonth() === this.selectedMonth) {
                const eventElement = document.createElement('div')
                eventElement.classList.add('eventElement')

                eventElement.innerHTML = `
                    <h1>${yearEvent.title}</h1>
                    <p>${yearEvent.content}</p>
                    <p>${yearEvent.group}</p>
                    <p>${yearEvent.date.toISOString()}</p>
                `

                const deleteButton = document.createElement('button')
                deleteButton.innerText = 'delete'
                deleteButton.addEventListener('click', () => {
                    this.deleteClick(yearEvent.id)
                })
                eventElement.append(deleteButton)

                eventList.append(eventElement)
            }
        }
    }
}