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

    days = ['sunnuntai',
            'maanantai',
            'tiistai',
            'keskiviikko',
            'torstai',
            'perjantai',
            'lauantai']

    groups

    #dateToday = new Date()

    constructor(element, groups, {selectGroup, iconUrl}){
        this.element = this.#CheckIfDomElement(element)
        this.selectGroup = selectGroup && typeof selectGroup == 'function' ? selectGroup : this.#groupFilterFunction
        this.groups = groups
        this.iconUrl = iconUrl && typeof iconUrl == 'string' ? iconUrl : null

        console.log('ic', iconUrl, this.iconUrl)
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
                <div class='infoHeader'></div>
                <div class='groupSelectCheckBoxes'></div>
            </div>

            <div class='eventInfo'>
                <h1>...</h1>
            </div>
        `

        const infoHeader = this.element.querySelector('.infoHeader')

        const headerText = document.createElement('div')
        headerText.textContent = 'PKMTT'

        if(this.iconUrl){
            const iconImg = document.createElement('img')
            iconImg.src = this.iconUrl
            iconImg.style = 'width:59px;height:34px;'
            iconImg.alt = 'icon'
            iconImg.classList.add('iconImg')

            infoHeader.appendChild(iconImg)
        }

        infoHeader.appendChild(headerText)

        // Group checkbox selector start ##############################################################
        let showDropDown = false

        const groupSelectCheckBoxes = this.element.querySelector('.groupSelectCheckBoxes')
        groupSelectCheckBoxes.innerHTML = `
            <div>
                <div class='gsbHeaderText'>
                    <div>+</div>
                    <div>Suodatin</div>
                    <div>+</div>
                </div>
            </div>
            <div class='gsbSelections'>
            </div>
        `

        const groupSelections = groupSelectCheckBoxes.querySelector('.gsbSelections')

        function addSelection(group){
            const selectBoxDiv = document.createElement('div')
            selectBoxDiv.innerHTML = `
                <label for="${group}">
                <input type="checkbox" id="${group}" />${group}</label>
            `

            groupSelections.appendChild(selectBoxDiv)
        }

        // groups used to be {group: color, group2: color2...} is now ['group1', 'group3', ...]
        if(this.groups instanceof Array){
            this.groups.map(group => {
                addSelection(group)
            })
        } else {
            Object.keys(this.groups).map(group => {
                addSelection(group)
            })
        }

        groupSelections.addEventListener('change', (e) => {
            const allCheckBoxElements = groupSelections.querySelectorAll('input')
            const checkedGroups = []
            for (const checkBoxElement of allCheckBoxElements) {
                if(checkBoxElement.checked){
                    checkedGroups.push(checkBoxElement.id)
                }
            }
            
            this.selectGroup(checkedGroups)

            if(checkedGroups.length === 0){
                gsbHeader.innerHTML = `
                    <div>+</div>
                    <div>Suodatin</div>
                    <div>+</div>
                `
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
        // Group checkbox selector end #########################################################################
    }

    #groupFilterFunction(group){
        this.#errorLogger('group', group, 'selected')
    }

    #dateToString(dateObj){
        let [date, time] = dateObj.toISOString().split('T')
        //let [date, time] = new Date(dateObj - this.#dateToday.getTimezoneOffset()*60_000).toISOString().split('T')
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
                <textarea class='eiTextArea' readonly>${event.content}</textarea>
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