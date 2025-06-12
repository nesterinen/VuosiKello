/*
import YearEvents from eventsHandler.js
import InfoElement from info.js
import VuosiKalenteri from year.js
import VuosiTable from table.js
import LoadingGraphic from loading.js

import {EventCreationDialog, InfoDialog} from dialogs.js
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

            <div class='loadingContainer'></div>
        </div>
    `

    const loading = new LoadingGraphic(mainElement.querySelector('.loadingContainer'))
    //loading.start()
    //<img src='${php_args_vuosi.logo_url}' alt='PKMTT_LOGO' style="width:59px;height:34px;"/>

    async function fetchAll(year=null) {
        loading.start()
        return new Promise((resolve, reject) => {
            jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: php_args_vuosi.ajax_url,
            data: { action: "vuosi_kello_get_all", year: year },
            }).done((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                reject(`${error.statusText}(${error.status}): ${error.responseText}`)
            })
        })
        .finally(() => loading.stop())
    }

    async function deleteOne(id) {
        loading.start()
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: php_args_vuosi.ajax_url,
                data: { action: "vuosi_kello_delete_one", id: id }
            })
            .done((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                reject(`${error.statusText}(${error.status}): ${error.responseText}`)
            })
        })
        .finally(() => loading.stop())
    }

    async function deleteSeries(series_id) {
        loading.start()
        return new Promise((resolve, reject) => {
            jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: php_args_vuosi.ajax_url,
            data: { action: "vuosi_kello_delete_by_series", series_id: series_id }
            })
            .done((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                reject(`${error.statusText}(${error.status}): ${error.responseText}`)
            })
        })
        .finally(() => loading.stop())
    }

    async function postOne({priority, reservor, group, title, content, start, end}) {
        loading.start()
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: php_args_vuosi.ajax_url,
                data: {
                    action: "vuosi_kello_post_one",
                    priority, reservor, group, title, content, start, end
                }
            })
            .done((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                reject(`${error.statusText}(${error.status}): ${error.responseText}`)
            })
        })
        .finally(() => loading.stop())
    }

    async function postSeries({arrayOfDates, priority, reservor, group, title, content, start, end}) {
        loading.start()
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: php_args_vuosi.ajax_url,
                data: {
                    action: "vuosi_kello_post_series",
                    arrayOfDates, priority, reservor, group, title, content, start, end
                }
            }).done((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                reject(`${error.statusText}(${error.status}): ${error.responseText}`)
            })
        })
        .finally(() => loading.stop())
    }

    const yearEvents = new YearEvents()

    fetchAll(selectedYear)
        .then(result => {
            yearEvents.Initialize(result)
            yearEvents.updateEvent()
            if(vuosiTable.firstEventToday){
                yearEvents.selectEvent(vuosiTable.firstEventToday.data)
            }

            /*
            SettingsDialog(
                yearEvents.getEvent(422),
                organizationGroups,
                {
                    updateOneClick: (asd) => {console.log('asd', asd)},
                    updateSeriesClick: (asd) => {console.log('asd', asd)} 
                }
            )
            */
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
            },
            //iconUrl: php_args_vuosi.logo_url
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
                    .catch(err => {
                        selectedYear += 1
                        console.log('err', err)
                        alert(err)
                    })
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
                    .catch(err => {
                        selectedYear -=1
                        console.log('err', err)
                        alert(err)
                    })
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
                InfoDialog(yearEvents.getEvent(id), id, series_id, {
                    downloadClick: () => {
                        downloadICS([yearEvents.getEvent(id)])
                    },

                    deleteClick: () => {
                        deleteOne(id)
                            .then(() => {
                                yearEvents.deleteEvent(id)
                            })
                            .catch(error => {
                                console.log('del err:', error)
                                alert(error)
                            })
                    },

                    seriesDeleteClick: () => {
                        deleteSeries(series_id)
                            .then(() => {
                                yearEvents.deleteEventBySeries(series_id)
                            })
                            .catch(error => {
                                console.log('dels err:', error)
                                alert(error)
                            })
                    }
                })
            },
            eventClick: (eventObj) => {
                yearEvents.selectEvent(eventObj.data)
            },
            monthSelect: (month) => {
                yearCircle.setMonth(month)
            },
            addClick: () => {
                createEventDialog()
            },
            downloadCSV: () => {
                downloadCSV()
            },
            downloadICS: () => {
                downloadICS(yearEvents.events)
            },
            downloadJSON: () => {
                downloadJSON()
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

    async function createEventDialog(){
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

            postOne({priority, reservor, group, title, content, start, end})
                .then(response => {
                    yearEvents.addEvent({
                        id: response.id,
                        priority, reservor, group, title, content, start, end
                        //priority, reservor, group, title, content, start, end
                    })
                    yearEvents.selectEventById(response.id)
                })
                .catch(error => {
                    console.log('post one err:', error)
                    alert(error)
                })
        } else {
            const {arrayOfDates, priority, reservor, group, title, content, start, end} = dialogResult.data

            postSeries({arrayOfDates, priority, reservor, group, title, content, start, end})
                .then(response => {
                    response.events.map((obj) => {
                        yearEvents.addEvent(obj, false)
                    })
                    yearEvents.sortEventsByDateAndCallEvent()
                })
                .catch(error => {
                    console.log('post series err:', error)
                    alert(error)
                })
        }
    }

    //Refactor/relocate downloads/generators to utils or other file.
    function downloadJSON(){
        if(yearEvents.events.length === 0){
            alert('Ei ladattavia tapahtumia.')
            return
        }

        const asdasd = JSON.stringify(yearEvents.events, null, " ")

        let fileToSave = new Blob([asdasd] ,{
            type: 'application/json'
        })

        const link = document.createElement("a")
        link.download = `Tapahtumat-${selectedYear}.json`
        link.href = window.URL.createObjectURL(fileToSave)
        link.click()
        link.remove()
    }

    function csvGenerator(items, seperator=',', delimiter='\r\n'){
        // https://stackoverflow.com/questions/44396943/generate-a-csv-file-from-a-javascript-array-of-objects
        let csv = ''

        /*
        \n is a symbol for new line
        \t is a symbol for tab
        \r is for 'return'
        */

        //generate headings
        let keysAmount = Object.keys(items[0]).length
        let keysCounter = 0

        for(let key in items[0]){
            // This is to not add a comma at the last cell
            // The '\r\n' adds a new line
            let translatedKey = ''

            switch (key) {
                case 'id':
                    translatedKey = 'Tunnus'; break;
                case 'series_id':
                    translatedKey = 'Sarjatunnus'; break;
                case 'priority':
                    translatedKey = 'Prioriteetti'; break;
                case 'start':
                    //translatedKey = 'Alku päivämäärä'; break;
                    translatedKey = 'päivämäärä'; break;
                case 'end':
                    //translatedKey = 'Loppu päivämäärä'; break;
                    translatedKey = 'kello'; break;
                case 'group':
                    translatedKey = 'Ryhmät'; break;
                case 'title':
                    translatedKey = 'Otsikko'; break;
                case 'content':
                    translatedKey = 'Sisältö'; break;
                case 'reservor':
                    translatedKey = 'Varaaja'; break;
                default:
                    translatedKey = key;
            }

            csv += translatedKey + (keysCounter+1 < keysAmount ? seperator : delimiter )
            //csv += key + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
            keysCounter++
        }

        keysCounter = 0

        //rest of the data
        for(let row = 0; row < items.length; row++){
            for(let key in items[row]){
                if (key === 'series_id'){
                    if(items[row][key] === null){
                        csv += '' + (keysCounter+1 < keysAmount ? seperator : delimiter )
                        keysCounter++
                        continue
                    }
                }

                if(key === 'group'){
                    if(seperator !== ','){
                        csv += items[row][key] + (keysCounter+1 < keysAmount ? seperator : delimiter)
                    } else {
                        csv += items[row][key].toString().replaceAll(',', ' ') + (keysCounter+1 < keysAmount ? seperator : delimiter )
                    }
                    keysCounter++
                    continue
                }

                if(key === 'start'){
                    csv += items[row][key].toLocaleDateString('fi-FI', {timeZone: 'UTC'}) + (keysCounter+1 < keysAmount ? seperator : delimiter )
                    keysCounter++
                    continue
                }

                if(key === 'end'){
                    csv += `${items[row]['start'].toLocaleTimeString('fi-FI', {timeZone: 'UTC'}).slice(0, -3)} - ${items[row]['end'].toLocaleTimeString('fi-FI', {timeZone: 'UTC'}).slice(0, -3)}`  + (keysCounter+1 < keysAmount ? seperator : delimiter)
                    keysCounter++
                    continue
                }

                csv += items[row][key] + (keysCounter+1 < keysAmount ? seperator : delimiter )
                keysCounter++
            }
            keysCounter = 0
        }

        return csv
    }

    function downloadCSV(){
        if(yearEvents.events.length === 0){
            alert('Ei ladattavia tapahtumia.')
            return
        }

        let filteredEvents = []

        if (vuosiTable.groupFilter){
            filteredEvents = yearEvents.events.filter((event) => {
                for(const group_filter of vuosiTable.groupFilter){
                    for(const event_group of event.group) {
                        if(group_filter === event_group){
                            return true
                        }
                    }
                }
            })
        } else {
            filteredEvents = yearEvents.events
        }

        const csvData = csvGenerator(filteredEvents, ';')

        const byteOrderMark = "\uFEFF"
        
        
        const link = document.createElement('a')
        link.id = 'download-csv'
        
        link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(byteOrderMark + csvData));
        link.setAttribute('download', `Tapahtumat-${selectedYear}.csv`);
        link.click()
        link.remove()
    }

    function icsGenerator(events){
        function dateToStr(date){
            return date.toISOString()       //025-01-03T09:00:00.000Z
                       .slice(0, -5)        //2025-01-03T09:00:00
                       //.replaceAll('.', '') //2025-01-03T09:00:00
                       .replaceAll('-', '') //0250103T09:00:00
                       .replaceAll(':', '') //20250103T090000
        }

        const dateNow = dateToStr(new Date())

        const icsHeader = 
             'BEGIN:VCALENDAR\n'
            +'VERSION:2.0\n'
            +'PRODID:VuosiKello\n'
            +'CALSCALE:GREGORIAN\n'
            +'METHOD:PUBLISH\n'
            +'X-WR-CALNAME:VuosiKello\n'
            +'X-WR-TIMEZONE:Europe/Helsinki\n'
            +'X-WR-CALDESC:VuosiKellon tapahtumat kalenteri muodossa.\n'


        const icsTimeZone = 
             'BEGIN:VTIMEZONE\n'
            +'TZID:Europe/Helsinki\n'
            +'END:VTIMEZONE\n'
        
        const icsFooter = 'END:VCALENDAR\n'

        let icsEventsData = ''
        
        for (const event of events) {
            icsEventsData += 
                 'BEGIN:VEVENT\n'
                +`SUMMARY:${event.title}\n`
                +`UID:${event.id}\n`
                +'SEQUENCE:0\n'
                +'STATUS:CONFIRMED\n'
                +'TRANSP:TRANSPARENT\n'
                +`DTSTART;TZID=Europe/Helsinki:${dateToStr(event.start)}\n`
                +`DTEND;TZID=Europe/Helsinki:${dateToStr(event.end)}\n`
                +`DTSTAMP:${dateNow}\n`
                +`LOCATION:${event.group}\n`
                +`DESCRIPTION:${event.content}\n`
                +'END:VEVENT\n'
        }

        return icsHeader + icsTimeZone + icsEventsData + icsFooter
    }

    function downloadICS(events){
        if(events.length === 0 ||!Array.isArray(events)){
            alert('Ei ladattavia tapahtumia.')
            return
        }

        const fileName = events.length === 1 ? `Tapahtuma-${events[0].title}-${events[0].id}.ics` : `Tapahtumat-${selectedYear}.ics`

        const data = icsGenerator(events)
        
        const link = document.createElement('a')
        link.id = 'download-ics'
        
        link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
        link.setAttribute('download', fileName);
        link.click()
        link.remove()
    }

    mainElement.scrollIntoView()
})