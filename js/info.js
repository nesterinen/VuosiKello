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
                <div class='groupSelectCheckBoxes'></div>
            </div>

            <div class='eventInfo'>
                <h1>Loading...</h1>
            </div>
        `

        //<select class='groupSelect'></select>
        /* // Group selector
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
        // Group selector end */

        // Group checkbox selector start
        let showDropDown = false

        const groupSelectCheckBoxes = this.element.querySelector('.groupSelectCheckBoxes')
        groupSelectCheckBoxes.innerHTML = `
            <div>
                <div class='gsbHeaderText'>Kaikki</div>
            </div>
            <div class='gsbSelections'>
            </div>
        `

        const groupSelections = groupSelectCheckBoxes.querySelector('.gsbSelections')
        Object.keys(this.groups).map(group => {
            const selectBoxDiv = document.createElement('div')
            selectBoxDiv.innerHTML = `
                <label for="${group}">
                <input type="checkbox" id="${group}" />${group}</label>
            `

            groupSelections.appendChild(selectBoxDiv)
        })

        groupSelections.addEventListener('change', (e) => {
            //console.log(e.target.id, e.target.checked)
            const allCheckBoxElements = groupSelections.querySelectorAll('input')
            const checkedGroups = []
            for (const checkBoxElement of allCheckBoxElements) {
                //console.log('cb', checkBoxElement.id, checkBoxElement.checked)
                if(checkBoxElement.checked){
                    checkedGroups.push(checkBoxElement.id)
                }
            }
            
            this.selectGroup(checkedGroups)

            if(checkedGroups.length === 0){
                gsbHeader.textContent = 'Kaikki'
            } else {
                gsbHeader.textContent = checkedGroups
            }
        })

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