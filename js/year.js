function idGenerator(){
    const randomness = Math.random() * 10000 + 100
    return parseInt(randomness);
}

document.addEventListener('DOMContentLoaded', async () => {
    return
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

// YearClass #########################################################################

class YearEvent {
    constructor (id, date, group, title, content) {
        this.id = id
        this.date = date
        this.group = group
        this.title = title
        this.content = content
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
            if('id' in obj && 'date' in obj && 'group' in obj && 'title' in obj && 'content' in obj){
                this.events.push(
                    new YearEvent(
                        obj.id, 
                        new Date(obj.date), 
                        obj.group, 
                        obj.title, 
                        obj.content)
                )
            } else {
                this.#errorLog('event:', obj)
                throw new Error('malformed eventsJsonArray')
            }
        }

        // sort by date
        this.events.sort((a, b) => {
            return a.date - b.date
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

    addEvent({id, date, group, title, content}) {
        if(typeof id !== 'number' || id % 1 !== 0) {
            throw new Error('id is not a integer')
        }

        if (this.getEvent(id)) {
            throw new Error(`event with id: ${id} already exists`)
        }

        this.events.push(new YearEvent(
            id,
            new Date(date),
            group,
            title,
            content
        ))

        this.#errorLogger('event with id:', id, 'added.')
        document.dispatchEvent(new Event(this.eventUpdateName))
    }
}

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
        this.element.innerHTML = `
        <div class='VuosiKalenteriContainer'>
            <div id='MonthCircle' style='--m: 12'>
                <div id='CircleCenter'>
                    <p>${this.#dateNow.getFullYear()}</p>
                </div>
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
            if(yearEvent.date.getFullYear() !== this.#dateNow.getFullYear()){
                continue
            }

            //filter by group
            if(this.eventFilter){
                if (this.eventFilter !== yearEvent.group){
                    continue
                }
            }

            eventsMonthSorted[yearEvent.date.getMonth()].push(yearEvent)
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

let events = [
    {
        //priority???
        id: 1,
        date: '2025-01-19T16:48:18.060Z',
        group: 'workkis',
        title: 'juhlat',
        content: 'jotkut bileet jee jee'
    },
    {
        //priority??
        id: 2,
        date: '2025-04-19T16:48:18.060Z',
        group: 'workkis',
        title: 'muutto',
        content: 'paikka a sulkeutuu siirretään kamat paikkaan b'
    },
    {
        //priority???
        id: 3,
        date: '2025-08-19T16:48:18.060Z',
        group: 'talonpojat',
        title: 'kevät siivous',
        content: 'hiekkojen yms poisto bla bla'
    }
]


const generatedEvents = [{"id":1,"date":"2025-03-26T04:17:50Z","group":"tekninen","title":"policy","content":"Polarised analyzing forecast"},
    {"id":2,"date":"2024-04-09T13:12:57Z","group":"johto","title":"task-force","content":"Fundamental scalable archive"},
    {"id":3,"date":"2025-08-25T10:14:02Z","group":"johto","title":"upward-trending","content":"Reduced methodical collaboration"},
    {"id":4,"date":"2024-04-25T19:40:09Z","group":"workkis","title":"needs-based","content":"Down-sized empowering project"},
    {"id":5,"date":"2024-11-18T05:38:52Z","group":"workkis","title":"software","content":"Virtual grid-enabled benchmark"},
    {"id":6,"date":"2025-04-13T06:11:42Z","group":"johto","title":"framework","content":"Grass-roots holistic leverage"},
    {"id":7,"date":"2024-07-30T21:46:18Z","group":"workkis","title":"data-warehouse","content":"Extended upward-trending hub"},
    {"id":8,"date":"2025-10-29T18:26:16Z","group":"tekninen","title":"secured line","content":"Upgradable mobile application"},
    {"id":9,"date":"2024-08-23T09:56:16Z","group":"workkis","title":"groupware","content":"Visionary regional standardization"},
    {"id":10,"date":"2024-06-04T05:03:20Z","group":"workkis","title":"zero defect","content":"Right-sized mission-critical open architecture"},
    {"id":11,"date":"2025-05-20T06:57:23Z","group":"tekninen","title":"benchmark","content":"Streamlined mobile Graphic Interface"},
    {"id":12,"date":"2025-09-20T05:05:45Z","group":"johto","title":"project","content":"Robust local approach"},
    {"id":13,"date":"2024-07-02T07:36:52Z","group":"workkis","title":"artificial intelligence","content":"Expanded tangible open system"},
    {"id":14,"date":"2024-05-02T16:06:57Z","group":"workkis","title":"Proactive","content":"Versatile systematic support"},
    {"id":15,"date":"2025-12-08T00:05:55Z","group":"johto","title":"internet solution","content":"Re-engineered non-volatile adapter"},
    {"id":16,"date":"2025-01-29T18:39:03Z","group":"tekninen","title":"Monitored","content":"Cloned cohesive infrastructure"},
    {"id":17,"date":"2024-08-03T16:49:33Z","group":"tekninen","title":"Reverse-engineered","content":"Sharable maximized budgetary management"},
    {"id":18,"date":"2025-03-17T07:33:56Z","group":"tekninen","title":"Object-based","content":"Distributed regional throughput"},
    {"id":19,"date":"2025-02-11T13:32:42Z","group":"tekninen","title":"upward-trending","content":"Pre-emptive even-keeled methodology"},
    {"id":20,"date":"2025-09-17T12:59:09Z","group":"johto","title":"focus group","content":"Universal 24 hour capability"},
    {"id":21,"date":"2025-04-05T16:07:51Z","group":"tekninen","title":"implementation","content":"Business-focused incremental superstructure"},
    {"id":22,"date":"2024-10-31T10:41:57Z","group":"tekninen","title":"user-facing","content":"Virtual upward-trending portal"},
    {"id":23,"date":"2024-05-22T15:17:48Z","group":"johto","title":"local area network","content":"Compatible well-modulated monitoring"},
    {"id":24,"date":"2025-03-19T00:38:36Z","group":"johto","title":"full-range","content":"Fully-configurable exuding orchestration"},
    {"id":25,"date":"2025-10-10T12:06:19Z","group":"johto","title":"User-centric","content":"Customer-focused grid-enabled flexibility"},
    {"id":26,"date":"2024-06-01T00:47:27Z","group":"tekninen","title":"actuating","content":"Managed transitional product"},
    {"id":27,"date":"2024-12-08T23:50:28Z","group":"workkis","title":"directional","content":"Devolved multimedia monitoring"},
    {"id":28,"date":"2025-03-27T00:37:31Z","group":"workkis","title":"data-warehouse","content":"Multi-layered solution-oriented projection"},
    {"id":29,"date":"2024-09-21T23:21:24Z","group":"tekninen","title":"real-time","content":"Networked static architecture"},
    {"id":30,"date":"2025-02-25T01:48:39Z","group":"workkis","title":"Front-line","content":"Robust 24/7 pricing structure"},
    {"id":31,"date":"2024-11-09T02:43:17Z","group":"workkis","title":"Organic","content":"Operative value-added firmware"},
    {"id":32,"date":"2024-07-30T23:47:15Z","group":"tekninen","title":"Future-proofed","content":"Multi-channelled motivating migration"},
    {"id":33,"date":"2024-04-07T11:39:57Z","group":"johto","title":"value-added","content":"Inverse bifurcated extranet"},
    {"id":34,"date":"2025-09-01T19:45:26Z","group":"johto","title":"Cross-platform","content":"Team-oriented responsive customer loyalty"},
    {"id":35,"date":"2024-11-19T16:30:38Z","group":"tekninen","title":"De-engineered","content":"Centralized well-modulated open system"},
    {"id":36,"date":"2025-08-06T00:55:05Z","group":"workkis","title":"Right-sized","content":"Networked responsive hardware"},
    {"id":37,"date":"2025-08-15T06:15:18Z","group":"johto","title":"attitude","content":"Vision-oriented intermediate leverage"},
    {"id":38,"date":"2025-07-26T01:18:41Z","group":"johto","title":"process improvement","content":"Operative asymmetric info-mediaries"},
    {"id":39,"date":"2024-12-23T01:49:55Z","group":"johto","title":"Centralized","content":"Seamless motivating interface"},
    {"id":40,"date":"2025-11-10T21:18:34Z","group":"tekninen","title":"Optimized","content":"Optimized tangible encryption"},
    {"id":41,"date":"2025-05-08T17:10:22Z","group":"tekninen","title":"complexity","content":"Cross-platform demand-driven neural-net"},
    {"id":42,"date":"2025-06-05T04:55:54Z","group":"johto","title":"composite","content":"Cloned foreground support"},
    {"id":43,"date":"2024-04-12T02:51:21Z","group":"johto","title":"Automated","content":"Profit-focused methodical projection"},
    {"id":44,"date":"2024-09-18T14:47:01Z","group":"tekninen","title":"orchestration","content":"Optimized value-added conglomeration"},
    {"id":45,"date":"2024-12-21T23:48:24Z","group":"workkis","title":"Centralized","content":"Balanced full-range matrix"},
    {"id":46,"date":"2025-07-01T22:47:53Z","group":"johto","title":"matrix","content":"Open-architected neutral flexibility"},
    {"id":47,"date":"2024-03-31T06:56:30Z","group":"tekninen","title":"Profit-focused","content":"De-engineered motivating knowledge user"},
    {"id":48,"date":"2024-11-02T11:14:20Z","group":"johto","title":"human-resource","content":"Re-contextualized full-range functionalities"},
    {"id":49,"date":"2025-07-31T00:26:25Z","group":"workkis","title":"moderator","content":"Decentralized background product"},
    {"id":50,"date":"2025-10-03T21:12:49Z","group":"johto","title":"bifurcated","content":"Multi-layered mobile hierarchy"},
    {"id":51,"date":"2025-07-28T06:12:58Z","group":"johto","title":"system engine","content":"Visionary optimizing toolset"},
    {"id":52,"date":"2024-06-23T14:40:16Z","group":"workkis","title":"interactive","content":"Adaptive disintermediate monitoring"},
    {"id":53,"date":"2025-01-21T17:46:33Z","group":"workkis","title":"core","content":"Customer-focused regional application"},
    {"id":54,"date":"2025-06-01T23:15:02Z","group":"tekninen","title":"focus group","content":"Extended actuating intranet"},
    {"id":55,"date":"2025-09-23T07:48:06Z","group":"johto","title":"Switchable","content":"Reduced intermediate capability"},
    {"id":56,"date":"2024-04-14T09:37:13Z","group":"johto","title":"archive","content":"Reverse-engineered needs-based groupware"},
    {"id":57,"date":"2024-07-25T02:07:35Z","group":"johto","title":"Fundamental","content":"Persistent 4th generation collaboration"},
    {"id":58,"date":"2025-12-07T08:10:40Z","group":"workkis","title":"instruction set","content":"Right-sized upward-trending installation"},
    {"id":59,"date":"2024-09-13T16:38:08Z","group":"johto","title":"logistical","content":"Open-source directional attitude"},
    {"id":60,"date":"2024-10-23T13:38:31Z","group":"tekninen","title":"multi-state","content":"Horizontal multi-tasking algorithm"},
    {"id":61,"date":"2025-01-13T15:43:19Z","group":"tekninen","title":"structure","content":"Horizontal object-oriented ability"},
    {"id":62,"date":"2025-12-13T13:34:57Z","group":"tekninen","title":"asymmetric","content":"Advanced disintermediate capacity"},
    {"id":63,"date":"2025-05-27T10:06:41Z","group":"johto","title":"modular","content":"Fully-configurable cohesive architecture"},
    {"id":64,"date":"2024-09-17T20:25:47Z","group":"workkis","title":"info-mediaries","content":"Advanced clear-thinking neural-net"},
    {"id":65,"date":"2024-05-05T16:37:16Z","group":"johto","title":"moderator","content":"Object-based mobile synergy"},
    {"id":66,"date":"2025-10-05T13:48:19Z","group":"johto","title":"client-driven","content":"Virtual actuating portal"},
    {"id":67,"date":"2024-04-04T12:48:16Z","group":"tekninen","title":"Customizable","content":"Triple-buffered content-based framework"},
    {"id":68,"date":"2025-10-20T02:18:42Z","group":"tekninen","title":"Re-contextualized","content":"Adaptive national matrices"},
    {"id":69,"date":"2025-12-07T06:06:13Z","group":"johto","title":"initiative","content":"Inverse tertiary adapter"},
    {"id":70,"date":"2024-10-19T07:25:08Z","group":"tekninen","title":"archive","content":"Intuitive mission-critical service-desk"},
    {"id":71,"date":"2025-07-03T15:08:45Z","group":"tekninen","title":"Synergized","content":"Up-sized upward-trending software"},
    {"id":72,"date":"2024-12-09T15:51:59Z","group":"workkis","title":"frame","content":"Public-key stable instruction set"},
    {"id":73,"date":"2025-09-14T21:51:26Z","group":"johto","title":"Realigned","content":"Horizontal modular Graphical User Interface"},
    {"id":74,"date":"2025-04-13T04:02:33Z","group":"workkis","title":"adapter","content":"Organic bandwidth-monitored complexity"},
    {"id":75,"date":"2024-10-05T21:50:26Z","group":"johto","title":"migration","content":"Optional tangible array"},
    {"id":76,"date":"2024-09-21T11:50:11Z","group":"tekninen","title":"Compatible","content":"Quality-focused tangible encryption"},
    {"id":77,"date":"2024-05-25T18:40:15Z","group":"workkis","title":"capacity","content":"Diverse multi-state implementation"},
    {"id":78,"date":"2025-08-30T06:38:40Z","group":"tekninen","title":"ability","content":"Stand-alone fault-tolerant knowledge base"},
    {"id":79,"date":"2025-05-20T11:46:04Z","group":"tekninen","title":"workforce","content":"Future-proofed zero tolerance initiative"},
    {"id":80,"date":"2024-07-21T13:50:17Z","group":"johto","title":"interactive","content":"Assimilated discrete projection"},
    {"id":81,"date":"2024-08-23T23:48:08Z","group":"johto","title":"Switchable","content":"Digitized system-worthy workforce"},
    {"id":82,"date":"2025-12-16T08:43:33Z","group":"tekninen","title":"Implemented","content":"Configurable upward-trending artificial intelligence"},
    {"id":83,"date":"2024-04-07T07:05:57Z","group":"johto","title":"Function-based","content":"Synchronised modular monitoring"},
    {"id":84,"date":"2025-05-15T00:10:28Z","group":"workkis","title":"knowledge base","content":"Profit-focused multimedia knowledge base"},
    {"id":85,"date":"2025-07-23T23:58:20Z","group":"tekninen","title":"fresh-thinking","content":"Innovative systematic help-desk"},
    {"id":86,"date":"2024-06-21T12:03:13Z","group":"tekninen","title":"interface","content":"De-engineered full-range internet solution"},
    {"id":87,"date":"2025-10-05T05:53:39Z","group":"workkis","title":"Virtual","content":"Cross-platform explicit orchestration"},
    {"id":88,"date":"2025-02-05T02:03:53Z","group":"johto","title":"clear-thinking","content":"Adaptive cohesive secured line"},
    {"id":89,"date":"2024-03-23T14:52:23Z","group":"tekninen","title":"Synchronised","content":"Secured maximized Graphical User Interface"},
    {"id":90,"date":"2025-04-04T08:44:18Z","group":"johto","title":"protocol","content":"Adaptive even-keeled success"},
    {"id":91,"date":"2024-09-26T21:56:27Z","group":"tekninen","title":"explicit","content":"Configurable multi-state capability"},
    {"id":92,"date":"2024-10-21T21:43:38Z","group":"johto","title":"next generation","content":"Cross-platform optimizing capability"},
    {"id":93,"date":"2024-09-07T18:59:46Z","group":"tekninen","title":"Integrated","content":"Future-proofed explicit open system"},
    {"id":94,"date":"2025-11-29T13:19:25Z","group":"johto","title":"Assimilated","content":"Programmable impactful knowledge user"},
    {"id":95,"date":"2024-07-22T07:02:21Z","group":"workkis","title":"paradigm","content":"Profit-focused non-volatile encryption"},
    {"id":96,"date":"2024-09-21T17:58:04Z","group":"johto","title":"coherent","content":"Compatible bottom-line task-force"},
    {"id":97,"date":"2025-10-26T09:02:41Z","group":"johto","title":"definition","content":"Up-sized next generation project"},
    {"id":98,"date":"2024-10-25T02:01:17Z","group":"tekninen","title":"matrices","content":"Front-line mobile functionalities"},
    {"id":99,"date":"2024-12-02T21:49:46Z","group":"tekninen","title":"static","content":"Reduced client-driven leverage"},
    {"id":100,"date":"2024-03-30T03:34:03Z","group":"workkis","title":"systemic","content":"Ameliorated user-facing leverage"}]