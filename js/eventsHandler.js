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
    events = []

    #errorLog = true

    eventUpdateName = 'vuosiKalenteriUpdate'
    eventSelectName = 'vuosiKalenteriEventSelect'
    groupSelectName = 'vuosiKalenteriGroupSelect'

    #dateToday = new Date()
    
    constructor(eventsJsonArray=null) {
        if(eventsJsonArray){
            if(Array.isArray(eventsJsonArray) === false) throw new Error('eventsJsonArray not an array')
            this.events = []
            this.Initialize(eventsJsonArray)
        }
    }

    #addTimeZone(dateString){
        return new Date(new Date(dateString) - this.#dateToday.getTimezoneOffset()*60_000)
    }

    Initialize(eventsJsonArray, reInitialize=false){
        if(reInitialize){
            this.events = []
        }

        for (const obj of eventsJsonArray) {
            if('id' in obj && 'start' in obj && 'group' in obj && 'title' in obj && 'content' in obj){
                //if (obj.id === 26) console.log('obj', obj, 'todate', new Date(obj.start + '.000Z'))
                this.events.push(
                    new YearEvent(
                        obj.id,
                        obj.series_id,
                        obj.priority,
                        new Date(obj.start + '.000Z'),
                        new Date(obj.end + '.000Z'),
                        //this.#addTimeZone(obj.start), //new Date(obj.start),
                        //this.#addTimeZone(obj.end), //new Date(obj.end),
                        obj.group, 
                        obj.title, 
                        obj.content,
                        obj.reservor
                    )
                )
            } else {
                this.#errorLog('event:', obj)
                throw new Error('malformed eventsJsonArray object', obj)
            }
        }

        // sort by date
        this.sortEventsByDate()
        //this.sortEventsByPriorityThenDate()
        if(reInitialize){
            document.dispatchEvent(new Event(this.eventUpdateName))
        }
    }

    #errorLogger(...params){
        if (this.#errorLog) {
            console.log('eLogger(eventHandler.js):', ...params)
        }
    }

    sortEventsByDate(){
        this.events.sort((a, b) => {
            return a.start - b.start
        })
    }

    sortEventsByDateAndCallEvent(){
        this.events.sort((a, b) => {
            return a.start - b.start
        })
        document.dispatchEvent(new Event(this.eventUpdateName))
    }

    // does not play ball with table..
    sortEventsByPriorityThenDate(){
        this.events.sort((a, b) => {
            if(a.priority > b.priority){
                return 1
            } else if (a.priority < b.priority){
                return -1
            }

            return a.start - b.start
        })
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

    deleteEventBySeries(series_id){
        if(typeof series_id !== 'number' || series_id % 1 !== 0) {
            throw new Error('id is not a integer')
        }

        const filteredEvents = this.events.filter(yearEvent =>
            yearEvent.series_id !== series_id
        )

        if(filteredEvents.length !== this.events.length){
            this.events = filteredEvents
            this.#errorLogger('events with series_id:', series_id, 'deleted')
            document.dispatchEvent(new Event(this.eventUpdateName))
        } else {
            this.#errorLogger('no event with series_id:', series_id, 'found when deleting')
        }
    }

    addEvent({id, series_id,  priority, start, end, group, title, content, reservor}, sortAfter=true) {
        if(typeof id !== 'number' || id % 1 !== 0) {
            throw new Error('id is not a integer')
            //id = parseInt(id)
        }

        if (this.getEvent(id)) {
            throw new Error(`event with id: ${id} already exists`)
        }

        this.events.push(new YearEvent(
            id,
            series_id,
            priority,
            new Date(start),//this.#addTimeZone(start.slice(0,-1)),
            new Date(end),//this.#addTimeZone(end.slice(0,-1)),
            group, 
            title, 
            content,
            reservor
        ))

        if(sortAfter) {
            this.sortEventsByDate()
            document.dispatchEvent(new Event(this.eventUpdateName))
        }

        this.#errorLogger('event with id:', id, 'added.')
    }

    selectEventById(id){
        if(typeof id !== 'number' || id % 1 !== 0) {
            throw new Error('id is not a integer')
        }

        const foundEvent = this.events.find((obj) => obj.id === id)

        if(!foundEvent){
            this.#errorLogger('id', id, 'not found')
            return
        }

        this.#errorLogger('id', id, 'selected')
        document.dispatchEvent(new CustomEvent(this.eventSelectName, {detail:{event: foundEvent}}))
    }

    selectEvent(event){
        if(typeof event.id !== 'number' || event.id % 1 !== 0) {
            throw new Error('id is not a integer')
        }

        this.#errorLogger('event', event, 'selected')
        document.dispatchEvent(new CustomEvent(this.eventSelectName, {detail:{event:event}}))
    }

    selectGroup(group) {
        this.#errorLogger('group', group, 'selected')
        document.dispatchEvent(new CustomEvent(this.groupSelectName, {detail:{group:group}}))
    }

    updateEventDispatch(){
        document.dispatchEvent(new Event(this.eventUpdateName))
    }

    updateEventById(id, event){
        if(typeof id !== 'number' || id % 1 !== 0) {
            throw new Error('id is not a integer')
        }
        const eventToUpdate = this.events.find((yearEvent) => yearEvent.id === id)
        if(!eventToUpdate){
            throw new Error('event with id:', id, 'not found!')
        }

        //find returns (object reference) instead of value so it can be edited like this
        for (const [key, value] of Object.entries(event)){
            eventToUpdate[key] = value
        }
        
        this.#errorLogger('event with id:', id, 'updated')
        this.updateEventDispatch()
    }

    updateEventsBySeriesId(series_id, event){
        if(typeof series_id !== 'number' || series_id % 1 !== 0) {
            throw new Error('series_id is not a integer')
        }

        for (let i = 0; i < this.events.length; i++){
            if(this.events[i].series_id === series_id){
                this.events[i] = {...this.events[i], ...event}
            }
        }

        this.#errorLogger('event(s) with series_id:', series_id, 'updated')
        this.updateEventDispatch()
    }
}
