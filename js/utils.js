function idGenerator(){ // DELETE
    const randomness = Math.random() * 10000 + 100
    return parseInt(randomness);
}

function dateNoTimezone(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}

function getRandomInt(max=2_147_483_647) {
    return Math.floor(Math.random() * max);
}

function backendSimulationIndividual(eventObject, series_id=null){
    return {
        id: getRandomInt(),
        series_id: series_id,
        priority: eventObject.priority,
        reservor: eventObject.reservor,
        group: eventObject.group,
        title: eventObject.title,
        content: eventObject.content,
        start: eventObject.start,
        end: eventObject.end
    }
}

function backendSimulationMultiple(eventObject){
    let eventObjectsArray = []
    const series_id = getRandomInt()
    for(const date of eventObject.arrayOfDates){
        const newEventObj = backendSimulationIndividual({
            ...eventObject,
            start: date.start,
            end: date.end
        }, series_id)
        eventObjectsArray.push(newEventObj)
    }
    return eventObjectsArray
}