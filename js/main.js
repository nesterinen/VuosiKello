/*
import YearEvents from eventsHandler.js
import VuosiTable from table.js
*/

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

document.addEventListener('DOMContentLoaded', async () => {
    const mainElement = document.getElementById('VuosiKalenteri')
    if (mainElement === null) return

    mainElement.innerHTML = `
        <div class='vuosiKalenteriContainer'>
            <div class='infoContainer'>
                <p>infoContainer</p>
            </div>

            <div class='circleContainer'>
                <p>circleContainer</p>
            </div>

            <div class='tableContainer'>
                <p>tableContainer</p>
            </div>
        </div>

        <button class='testButton'>Test</button>
    `


    const yearEvents = new YearEvents(testData)

    const infoContainer = mainElement.querySelector('.infoContainer')
    const infoElement = new InfoElement(infoContainer)

    const circleContainer = mainElement.querySelector('.circleContainer')
    const yearCircle = new VuosiKalenteri(
        circleContainer,
        {
            yearEvents,
            monthClick: (month) => {
                vuosiTable.setEventFilterByMonth(month)
            },
            eventClick: (id) => {
                //console.log(yearEvents.getEvent(id))
                //vuosiTable.selectEvent(id)
                yearEvents.selectEvent(id)
            }
        }
    )

    const tableContainer = mainElement.querySelector('.tableContainer')
    const vuosiTable = new VuosiTable(
        tableContainer,
        {
            yearEvents,
            groups: php_args.groups,
            deleteClick: (id) => {
                yearEvents.deleteEvent(id)
            },
            eventClick: (eventObj) => {
                yearEvents.selectEvent(eventObj.data.id)
            }
        }
    )

    infoElement.render()
    yearCircle.render()
    vuosiTable.render()

    document.addEventListener(yearEvents.eventUpdateName, () => {
        vuosiTable.updateTable()
        yearCircle.updateMonthElements()
    })

    document.addEventListener(yearEvents.eventSelectName, (event) => {
        vuosiTable.selectEvent(event.detail.id)
    })

    const testButton = mainElement.querySelector('.testButton')
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


let testData = [
    {"id":1461983130,"series_id":null,"priority":5,"reservor":"Rackham","group":"Kouhu","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-13T10:00:00.000Z","end":"2025-04-13T12:00:00.000Z"},{"id":14640275,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-14T10:00:00.000Z","end":"2025-04-14T12:00:00.000Z"},{"id":765741625,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-16T10:00:00.000Z","end":"2025-04-16T12:00:00.000Z"},{"id":2112347033,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-18T10:00:00.000Z","end":"2025-04-18T12:00:00.000Z"},{"id":859044917,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-21T10:00:00.000Z","end":"2025-04-21T12:00:00.000Z"},{"id":34677464,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-23T10:00:00.000Z","end":"2025-04-23T12:00:00.000Z"},{"id":811002305,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-25T10:00:00.000Z","end":"2025-04-25T12:00:00.000Z"},{"id":1633812838,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-28T10:00:00.000Z","end":"2025-04-28T12:00:00.000Z"},{"id":302067611,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-30T10:00:00.000Z","end":"2025-04-30T12:00:00.000Z"},{"id":1653275679,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-02T10:00:00.000Z","end":"2025-05-02T12:00:00.000Z"},{"id":1054248080,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-05T10:00:00.000Z","end":"2025-05-05T12:00:00.000Z"},{"id":1187774971,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-07T10:00:00.000Z","end":"2025-05-07T12:00:00.000Z"},{"id":430715747,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-09T10:00:00.000Z","end":"2025-05-09T12:00:00.000Z"},{"id":1368657294,"series_id":1193777668,"priority":3,"reservor":"Rackham","group":"Hallinto","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-12T10:00:00.000Z","end":"2025-05-12T12:00:00.000Z"},{"id":1047990459,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-15T10:00:00.000Z","end":"2025-04-15T12:00:00.000Z"},{"id":1385368390,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-16T10:00:00.000Z","end":"2025-04-16T12:00:00.000Z"},{"id":1953760580,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-17T10:00:00.000Z","end":"2025-04-17T12:00:00.000Z"},{"id":1701745091,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-18T10:00:00.000Z","end":"2025-04-18T12:00:00.000Z"},{"id":1317871231,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-21T10:00:00.000Z","end":"2025-04-21T12:00:00.000Z"},{"id":1285113709,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-29T10:00:00.000Z","end":"2025-04-29T12:00:00.000Z"},{"id":1056473312,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-30T10:00:00.000Z","end":"2025-04-30T12:00:00.000Z"},{"id":661803076,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-01T10:00:00.000Z","end":"2025-05-01T12:00:00.000Z"},{"id":2017996052,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-02T10:00:00.000Z","end":"2025-05-02T12:00:00.000Z"},{"id":848540806,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-05T10:00:00.000Z","end":"2025-05-05T12:00:00.000Z"},{"id":1065671817,"series_id":1776163586,"priority":1,"reservor":"Rackham","group":"Esihenkilöt","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-13T10:00:00.000Z","end":"2025-05-13T12:00:00.000Z"},{"id":854462951,"series_id":1225592149,"priority":2,"reservor":"Rackham","group":"Wörkkis","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-22T10:00:00.000Z","end":"2025-04-22T12:00:00.000Z"},{"id":1593639544,"series_id":1225592149,"priority":2,"reservor":"Rackham","group":"Wörkkis","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-24T10:00:00.000Z","end":"2025-04-24T12:00:00.000Z"},{"id":23347379,"series_id":1225592149,"priority":2,"reservor":"Rackham","group":"Wörkkis","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-06T10:00:00.000Z","end":"2025-05-06T12:00:00.000Z"},{"id":1713809491,"series_id":1225592149,"priority":2,"reservor":"Rackham","group":"Wörkkis","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-08T10:00:00.000Z","end":"2025-05-08T12:00:00.000Z"},{"id":791110706,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-14T10:00:00.000Z","end":"2025-04-14T12:00:00.000Z"},{"id":1185677562,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-18T10:00:00.000Z","end":"2025-04-18T12:00:00.000Z"},{"id":1882516250,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-21T10:00:00.000Z","end":"2025-04-21T12:00:00.000Z"},{"id":727203851,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-25T10:00:00.000Z","end":"2025-04-25T12:00:00.000Z"},{"id":1176848371,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-04-28T10:00:00.000Z","end":"2025-04-28T12:00:00.000Z"},{"id":686564605,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-02T10:00:00.000Z","end":"2025-05-02T12:00:00.000Z"},{"id":1487374122,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-05T10:00:00.000Z","end":"2025-05-05T12:00:00.000Z"},{"id":586716818,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-09T10:00:00.000Z","end":"2025-05-09T12:00:00.000Z"},{"id":1633221642,"series_id":1052314772,"priority":5,"reservor":"Rackham","group":"Asumispalvelut","title":"Laborum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","start":"2025-05-12T10:00:00.000Z","end":"2025-05-12T12:00:00.000Z"}
]