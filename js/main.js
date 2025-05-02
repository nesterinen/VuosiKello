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

        <button class='testButton'>Luo</button>
        <button class='downloadButton'>Lataa</button>
    `


    const yearEvents = new YearEvents(php_args.test_data) //testData

    const infoContainer = mainElement.querySelector('.infoContainer')
    const infoElement = new InfoElement(
        infoContainer,
        php_args.groups,
        {
            selectGroup: (group) => {
                yearEvents.selectGroup(group)
            }
        }
    )

    const circleContainer = mainElement.querySelector('.circleContainer')
    const yearCircle = new VuosiKalenteri(
        circleContainer,
        {
            yearEvents,
            monthClick: (month) => {
                vuosiTable.setEventFilterByMonth(month)
            },
            eventClick: (event) => {
                yearEvents.selectEvent(event)
            },
            centerClick: () => {
                vuosiTable.setEventFilterByMonth(null)
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
                if(confirm('Poista tapahtuma?')){
                    yearEvents.deleteEvent(id)
                }
            },
            eventClick: (eventObj) => {
                yearEvents.selectEvent(eventObj.data)
            },
            monthSelect: (month) => {
                yearCircle.setMonth(month)
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

    document.addEventListener(yearEvents.eventSelectName, (args) => {
        vuosiTable.selectEvent(args.detail.event)
        infoElement.updateEventInfo(yearEvents.getEvent(args.detail.event.id))
    })

    document.addEventListener(yearEvents.groupSelectName, (args) => {
        vuosiTable.setEventFilterByGroup(args.detail.group)
        yearCircle.setEventFilterByGroup(args.detail.group)
    })

    yearEvents.selectEventById(386669888)

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
            console.log('result', dialogResult)
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
    testButton.click()

    const downloadButton = mainElement.querySelector('.downloadButton')
    downloadButton.addEventListener('click', () => {
        const asdasd = JSON.stringify(yearEvents.events, null, " ")

        let fileToSave = new Blob([asdasd] ,{
            type: 'application/json'
        })

        const link = document.createElement("a")
        link.download = 'data.json'
        link.href = window.URL.createObjectURL(fileToSave)
        link.click()
        link.remove()
    })
})