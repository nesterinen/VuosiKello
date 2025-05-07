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
    group: str[]
    title: str
    content: str
    start: date
    end: date
}
*/

/*
    id: int (PRIMARY KEY),
    series_id: int | null (FOREIGN KEY),
    priority: int,
    reservor: varchar 255,
    group: json (str[]),
    title: varchar 255,
    content: text,
    start: datetime,
    end: datetime
*/

document.addEventListener('DOMContentLoaded', async () => {
    const mainElement = document.getElementById('VuosiKalenteri')
    if (mainElement === null) return

    let dataFromDatabase = []
    await jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: php_args_vuosi.ajax_url,
        data: {action: "vuosi_kello_get_all"},
        success: (response) => {
            console.log('response data:', response.data)
            dataFromDatabase = response.data.map(obj => {
                //return {...obj, id: parseInt(obj.id)}
                return obj
            })
        },
        error: (jqXHR) => {
            if(jqXHR.status&&jqXHR.status==200){
                console.log('err', jqXHR);
            } else {
                console.log('errorResponse:', jqXHR.responseText)
              }
        }
    }).catch((error) => {
        alert(`Virhe: ${error.statusText} (${error.status})`)
    })
    

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
        <button class='testButton2'>Luo db</button>
    `
    //


    //const yearEvents = new YearEvents(php_args_vuosi.test_data) //testData
    const yearEvents = new YearEvents(dataFromDatabase)

    const infoContainer = mainElement.querySelector('.infoContainer')
    const infoElement = new InfoElement(
        infoContainer,
        php_args_vuosi.groups,
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
            groups: php_args_vuosi.groups,
            deleteClick: async (id, series_id) => {
                const dialogResult = await DeleteDialog(id, series_id).catch((e) => {
                    console.log('dialog', e)
                    return null
                })

                if(!dialogResult) return
                
                if(dialogResult.series_id){
                    jQuery.ajax({
                        type: "POST",
                        dataType: "json",
                        url: php_args_vuosi.ajax_url,
                        data: {
                            action: "vuosi_kello_delete_by_series",
                            series_id
                        },
                        success: (response) => {
                            yearEvents.deleteEventBySeries(series_id)
                        },
                        error: (jqXHR) => {
                            if(jqXHR.status&&jqXHR.status==200){
                                console.log('err', jqXHR);
                            } else {
                                console.log('errorResponse:', jqXHR.responseText)
                              }
                        }
                    }).catch((error) => {
                        alert(`Virhe: ${error.statusText} (${error.status})`)
                    })
                } else { // delete individual
                    jQuery.ajax({
                        type: "POST",
                        dataType: "json",
                        url: php_args_vuosi.ajax_url,
                        data: {
                            action: "vuosi_kello_delete_one",
                            id: id
                        },
                        success: (response) => {
                            yearEvents.deleteEvent(id)
                        },
                        error: (jqXHR) => {
                            if(jqXHR.status&&jqXHR.status==200){
                                console.log('err', jqXHR);
                            } else {
                                console.log('errorResponse:', jqXHR.responseText)
                              }
                        }
                    }).catch((error) => {
                        alert(`Virhe: ${error.statusText} (${error.status})`)
                    })
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
        //vuosiTable.firstEventToday = null
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

    //yearEvents.selectEventById(386669888)

    const testButton = mainElement.querySelector('.testButton')
    testButton.addEventListener('click', async () => {
        const dialogResult = await EventCreationDialog(php_args_vuosi.groups).catch((e) => {
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
    //testButton.click()

    const testButton2 = mainElement.querySelector('.testButton2')
    testButton2.addEventListener('click', async () => {
        const dialogResult = await EventCreationDialog(php_args_vuosi.groups).catch((e) => {
            console.log(e)
            return null
        })

        if (!dialogResult) {
            console.log('done')
            return
        }

        if(dialogResult.series === false) {
            //console.log('result', dialogResult.data)
            const {priority, reservor, group, title, content, start, end} = dialogResult.data
            
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: php_args_vuosi.ajax_url,
                data: {
                    action: "vuosi_kello_post_one",
                    priority, reservor, group, title, content, start, end
                },
                success: (response) => {
                    yearEvents.addEvent({
                        id: response.data.id,
                        priority, reservor, group, title, content, start, end
                    })
                    yearEvents.selectEventById(response.data.id)
                },
                error: (jqXHR) => {
                    if(jqXHR.status&&jqXHR.status==200){
                        console.log('err', jqXHR);
                    } else {
                        console.log('errorResponse:', jqXHR.responseText)
                      }
                }
            }).catch((error) => {
                alert(`Virhe: ${error.statusText} (${error.status})`)
            })

        } else {
            console.log('series', dialogResult)
            const {arrayOfDates, priority, reservor, group, title, content, start, end} = dialogResult.data

            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: php_args_vuosi.ajax_url,
                data: {
                    action: "vuosi_kello_post_series",
                    arrayOfDates, priority, reservor, group, title, content, start, end
                },
                success: (response) => {
                    response.data.events.map((obj) => {
                        yearEvents.addEvent(obj, false)
                    })
                    yearEvents.sortEventsByDateAndCallEvent()
                },
                error: (jqXHR) => {
                    if(jqXHR.status&&jqXHR.status==200){
                        console.log('err', jqXHR);
                    } else {
                        console.log('errorResponse:', jqXHR.responseText)
                      }
                }
            })
            /*
            const result = backendSimulationMultiple(dialogResult.data)
            for(const event of result) {
                yearEvents.addEvent(event)
            }
            yearEvents.sortEventsByDate()
            vuosiTable.updateTable()
            */
        }
    })

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