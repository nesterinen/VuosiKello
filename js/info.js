/*
datatype: {
    id: int
    series_id: int | null
    priority: int
    reservor: str
    group: str | array
    title: str
    content: str
    start: date
    end: date
}
*/

class InfoElement {
    element

    #errorLog = true

    days = ['maanantai',
            'tiistai',
            'keskiviikko',
            'torstai',
            'perjantai',
            'lauantai',
            'sunnuntai']

    groups

    constructor(element, groups, {selectGroup}){
        this.element = this.#CheckIfDomElement(element)
        this.selectGroup = selectGroup && typeof selectGroup == 'function' ? selectGroup : this.#groupFilterFunction
        this.groups = groups
    }

    #CheckIfDomElement(element){
        if(element && element instanceof HTMLElement){
            return element
        } else {
            throw new Error(`${element} is not an instance of HTMLElement`)
        }
    }

    render(){
        this.element.innerHTML = `
            <div class='generalInfo'>
                <h1>PKMTT</h1>
                <select class='groupSelect'></select>
                <div class='groupSelectCheckBoxes'></div>
            </div>

            <div class='eventInfo'>
                <h1>Loading...</h1>
            </div>
        `

        // Group selector
        const groupSelector = this.element.querySelector('.groupSelect')

        const optionGroupAll = document.createElement('option')
        optionGroupAll.appendChild(document.createTextNode('Kaikki'))
        groupSelector.appendChild(optionGroupAll)

        Object.keys(this.groups).map(group => {
            const option = document.createElement('option')
            option.appendChild(document.createTextNode(group))
            groupSelector.appendChild(option)
        })

        groupSelector.addEventListener('change', (args) => {
            //console.log('args', groupSelector.value, args.target.value)
            this.selectGroup(args.target.value)
        })
        // Group selector end

        // Group checkbox selector start
        let showDropDown = false

        const groupSelectCheckBoxes = this.element.querySelector('.groupSelectCheckBoxes')
        groupSelectCheckBoxes.innerHTML = `
            <div>
                <div class='gsbHeaderText'>blablabla</div>
            </div>
            <div class='gsbSelections'>
            </div>
        `

        /*
                <label for="one">
                    <input type="checkbox" id="one" />First checkbox</label>
                <label for="two">
                    <input type="checkbox" id="two" />Second checkbox</label>
                <label for="three">
                    <input type="checkbox" id="three" />Third checkbox</label>
                <label for="four">
                    <input type="checkbox" id="four" />Fourth checkbox</label>
                <label for="five">
                    <input type="checkbox" id="five" />Fifth checkbox</label>
        */

        const groupSelections = groupSelectCheckBoxes.querySelector('.gsbSelections')
        Object.keys(this.groups).map(group => {
            const selectBoxDiv = document.createElement('div')
            selectBoxDiv.innerHTML = `
                <label for="cb${group}">
                <input type="checkbox" id="cb${group}" />${group}</label>
            `

            groupSelections.appendChild(selectBoxDiv)
        })

        /*
        for (let i = 0; i < 5; i++){
            const selectBoxDiv = document.createElement('div')
            selectBoxDiv.innerHTML = `
                <label for="one">
                <input type="checkbox" id="one" />First checkbox</label>
            `

            groupSelections.appendChild(selectBoxDiv)
        }
        */

        console.log('grasdasd', groupSelections)

        const gsbHeader = groupSelectCheckBoxes.querySelector('.gsbHeaderText')
        gsbHeader.addEventListener('click', () => {
            showDropDown = !showDropDown
            if(showDropDown){
                groupSelections.style = 'display: block;'
            } else {
                groupSelections.style = 'display: none;'
            }
        })
        // Group checkbox selector end
    }

    #groupFilterFunction(group){
        this.#errorLogger('group', group, 'selected')
    }

    #dateToString(dateObj){
        let [date, time] = dateObj.toISOString().split('T')
        date = date.split('-').reverse().join('.')
        time = time.split(':').slice(0, 2).join(':')
        return [date, time]        
    }

    updateEventInfo(event){
        const eventInfo = this.element.querySelector('.eventInfo')
        if (!event) return

        const [startDate, startTime] = this.#dateToString(event.start)
        const [, endTime] = this.#dateToString(event.end)
        const weekDay = this.days[event.start.getDay()]

        const spacedGroups = event.group.toString().replaceAll(',', ', ')

        eventInfo.innerHTML = `
            <div class='eiEventHeader'>
                <div class='eiHeaderText'>${event.title} (${event.priority})</div>
                <div class='eiHeaderText2Groups'>${spacedGroups}</div>
            </div>


            <div class='eiDateTime'>
                <div class='eiBaseText'>${weekDay}</div>
                <div class='eiBaseText'>${startDate}</div>
                <div class='eiBaseText'>${startTime} - ${endTime}</div>
            </div>

            <div>
                <textarea class='eiTextArea'>${event.content}</textarea>
            </div>
            
            <div class='eiEventFooter'>
                <div>${event.reservor}</div>
                <div class='eventIds'>
                    <div class='eiIdText'>id:${event.id}</div>
                    <div class='eiIdText'>sarja:${event.series_id ? event.series_id : '-'}</div>
                </div>
            </div>
            `

    }

    #errorLogger(...params){
        if (this.#errorLog) {
            console.log('eLogger(info.js):', ...params)
        }
    }
}