/*
import YearEvents from eventsHandler.js
import VuosiTable from table.js
*/

/*
    id: int (PRIMARY KEY),
    series_id: int | null (FOREIGN KEY),
    priority: int,
    reservor: varchar 255,
    groups_json: json (str[]),
    title: varchar 255,
    content: text,
    start: datetime,
    end: datetime
*/

document.addEventListener('DOMContentLoaded', async () => {
    const mainElement = document.getElementById(php_args_vuosi.element_name)
    if (mainElement === null) return

    const organizationGroups = php_args_vuosi.actual_groups.length > 0 ? php_args_vuosi.actual_groups : php_args_vuosi.default_groups

    let selectedYear = new Date().getFullYear()

    async function fetchAll(year=null) {
        return new Promise((resolve, reject) => {
            jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: php_args_vuosi.ajax_url,
            data: {action: "vuosi_kello_get_all", year: year},
                success: (response) => {
                    resolve(response.data)
                },
                error: (jqXHR) => {
                    if(jqXHR.status&&jqXHR.status==200){
                        //console.log('err', jqXHR);
                        reject(`jqXHR_: ${jqXHR}`)
                    } else {
                        //console.log('errorResponse:', jqXHR.responseText)
                        reject(`jqXHR: ${jqXHR.responseText}`)
                    }
                }
            }).catch((error) => {
                reject(`Virhe: ${error.statusText} (${error.status})`)
            })
        })
    }

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

        <button class='testButton2'>Luo</button>
        <button class='downloadButton'>JSON</button>
        <button class='csvDownloadButton'>CSV</button>
    `


    const yearEvents = new YearEvents()

    fetchAll(selectedYear)
        .then(result => {
            yearEvents.Initialize(result)
            yearEvents.updateEvent()
            if(vuosiTable.firstEventToday){
                yearEvents.selectEvent(vuosiTable.firstEventToday.data)
            }
        })
        .catch(err => {
            alert(err)
        })

    const infoContainer = mainElement.querySelector('.infoContainer')
    const infoElement = new InfoElement(
        infoContainer,
        organizationGroups,
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
            },
            prevButton: (buttonElement) => {
                selectedYear -= 1
                buttonElement.disabled = true
                fetchAll(selectedYear)
                    .then(results => {
                        yearEvents.Initialize(results, true)
                        yearCircle.setDate(new Date(Date.UTC(selectedYear)))
                        yearCircle.update()
                    })
                    .catch(err => console.log('err', err))
                    .finally(() => buttonElement.disabled = false)
            },
            nextButton: (buttonElement) => {
                selectedYear += 1
                buttonElement.disabled = true
                fetchAll(selectedYear)
                    .then(results => {
                        yearEvents.Initialize(results, true)
                        yearCircle.setDate(new Date(Date.UTC(selectedYear)))
                        yearCircle.update()
                    })
                    .catch(err => console.log('err', err))
                    .finally(() => buttonElement.disabled = false)
            }
        }
    )

    const tableContainer = mainElement.querySelector('.tableContainer')
    const vuosiTable = new VuosiTable(
        tableContainer,
        {
            yearEvents,
            deleteClick: async (id, series_id) => {
                const dialogResult = await DeleteDialog(yearEvents.getEvent(id), id, series_id).catch((e) => {
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

    const testButton2 = mainElement.querySelector('.testButton2')
    testButton2.addEventListener('click', async () => {
        const dialogResult = await EventCreationDialog(organizationGroups).catch((e) => {
            console.log(e)
            return null
        })

        if (!dialogResult) {
            console.log('done')
            return
        }

        if(dialogResult.series === false) {
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
                    console.log('response', response)
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
                alert(`${error.statusText} (${error.status}) ${error.responseJSON.data}`)
            })

        } else {
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
            }).catch((error) => {
                alert(`${error.statusText} (${error.status}) ${error.responseJSON.data}`)
            })
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

    function csvGenerator(items){
        // https://stackoverflow.com/questions/44396943/generate-a-csv-file-from-a-javascript-array-of-objects
        let csv = ''

        // Loop the array of objects
        for(let row = 0; row < items.length; row++){
            let keysAmount = Object.keys(items[row]).length
            let keysCounter = 0

            // If this is the first row, generate the headings
            if(row === 0){

            // Loop each property of the object
            for(let key in items[row]){
                // This is to not add a comma at the last cell
                // The '\r\n' adds a new line
                csv += key + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                keysCounter++
            }
            } else {
                for(let key in items[row]){
                    /*
                    if(key === 'id'){
                        if(items[row][key] === 114){
                            console.log('item', items[row]['start'].toUTCString())
                        }
                    }
                    */

                    if(key === 'group'){
                        csv += items[row][key][0] + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                        keysCounter++
                        continue
                    }

                    if(key === 'start' || key === 'end'){
                        //csv += items[row][key].toUTCString() + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                        csv += items[row][key] + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                        keysCounter++
                        continue
                    }

                    csv += items[row][key] + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                    keysCounter++
                }
            }

            keysCounter = 0
        }

        return csv
    }

    const csvDownloadButton = mainElement.querySelector('.csvDownloadButton')
    csvDownloadButton.addEventListener('click', () => {
        const csvData = csvGenerator(yearEvents.events)

        //https://stackoverflow.com/questions/42462764/javascript-export-csv-encoding-utf-8-issue

        // if seperator is added byteOrderMark does not work....
        const byteOrderMark = "\uFEFF"
        const seperator = "sep=,\r\n"
        
        const link = document.createElement('a')
        link.id = 'download-csv'
        link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(byteOrderMark + seperator + csvData));
        //link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvData));
        link.setAttribute('download', 'tapahtumat2.csv');
        link.click()
        link.remove()
        
        
    })

    //csvDownloadButton.click()

    mainElement.scrollIntoView()
})