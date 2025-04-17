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
    eventSelectName = 'vuosiKalenteriSelect'
    
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
        this.sortEventsByDate()
        /*
        this.events.sort((a, b) => {
            return a.start - b.start
        })*/
    }

    #errorLogger(...params){
        if (this.#errorLog) {
            console.log('eLogger:', ...params)
        }
    }

    sortEventsByDate(){
        this.events.sort((a, b) => {
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

    addEvent({id, series_id,  priority, start, end, group, title, content, reservor}) {
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
            new Date(start),
            new Date(end),
            group, 
            title, 
            content,
            reservor
        ))

        this.#errorLogger('event with id:', id, 'added.')
        document.dispatchEvent(new Event(this.eventUpdateName))
    }

    selectEvent(id){
        if(typeof id !== 'number' || id % 1 !== 0) {
            throw new Error('id is not a integer')
        }

        document.dispatchEvent(new CustomEvent(this.eventSelectName, {detail:{id:id}}))
    }
}
