console.log('settings.js')

document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.querySelector('#vuosi_settings_container')
    if(!mainElement) return

    //mainElement.textContent = ''
    mainElement.innerHTML = `
        <h1>VuosiKello</h1>
    `

    function deleteGroupById(id){
        const formData = new FormData()
        formData.append('action', 'vuosi_kello_delete_group_by_id')
        formData.append('id', id)

        return new Promise(async (resolve, reject) => {
            const response = await fetch(php_settings_args.ajax_url, {
                method: 'POST',
                body: formData,
            })

            if(!response.ok){
                // 404 if id not found
                reject(response.status)
            } else {
                resolve(id)
            }
        })
    }

    async function resetGroups(){
        const formData = new FormData()
        formData.append('action', 'vuosi_kello_restore_groups')
        return fetch(php_settings_args.ajax_url, {method:'POST', body:formData})
            .then(res => {
                if (res.ok) {
                    return res
                } else {
                    throw new Error(res.status)
                }
            })
    }

    async function createGroup(group) {
        const formData = new FormData()
        formData.append('action', 'vuosi_kello_add_group')
        formData.append('group_name', group)
        return fetch(php_settings_args.ajax_url, {method:'POST', body:formData})
            .then(res => {
                if (res.ok) {
                    return res
                } else {
                    throw new Error(res.status)
                }
            })
    }

    const groupCreatorContainer = document.createElement('div')
    groupCreatorContainer.classList.add('groupCreatorContainer')
    groupCreatorContainer.innerHTML = `
        <h2>Lisää ryhmä</h2>
    `

    const gCCinput = document.createElement('input')
    groupCreatorContainer.appendChild(gCCinput)

    const gCCbutton = document.createElement('button')
    gCCbutton.innerText = 'lisää'
    gCCbutton.addEventListener('click', () => {
        //console.log('input', gCCinput.value)
        gCCbutton.disabled = true
        createGroup(gCCinput.value)
            .then(async response => {
                response.json().then(result => {
                    groupsContainer.appendChild(createGroupSectionElement({group:gCCinput.value, id:result.data}, function (elementId) {
                        document.getElementById(elementId).remove()
                    }))

                    gCCinput.value = ''
                    gCCbutton.disabled = false
                })
                //location.reload()
            })
            .catch(e => {
                //alert(`database error: ${e}`)
                console.log('db error:', e)
            })
    })
    groupCreatorContainer.appendChild(gCCbutton)

    mainElement.appendChild(groupCreatorContainer)

    function createGroupSectionElement({group, id}, onDeleteFunction){
        const sectionElement = document.createElement('div')
        sectionElement.classList.add('sectionElement')
        sectionElement.id = `sectionElement_${id}`

        const groupTitle = document.createElement('div')
        groupTitle.innerText = group

        const deleteButton = document.createElement('button')
        deleteButton.innerHTML = 'poista'
        deleteButton.addEventListener('click', () => {
            if(!confirm('poista ryhmä?')) return

            deleteGroupById(id)
                .then(result => onDeleteFunction(sectionElement.id))
                .catch(e => alert(`database error: ${e}`))
        })

        sectionElement.appendChild(groupTitle)
        sectionElement.appendChild(deleteButton)

        return sectionElement
    }

    const groupsContainer = document.createElement('div')
    groupsContainer.classList.add('groupsContainer')
    groupsContainer.innerHTML = `
        <h2>Ryhmät</h2>
    `
    for(const group of php_settings_args.groups){
        groupsContainer.appendChild(createGroupSectionElement(group, function (elementId) {
            document.getElementById(elementId).remove()
        }))
    }
    mainElement.appendChild(groupsContainer)

    const otherContainer = document.createElement('div')
    otherContainer.classList.add('otherContainer')
    otherContainer.innerHTML = `
        <h2>Toiminnot</h2>
    `

    const resetGroupsButton = document.createElement('button')
    resetGroupsButton.innerHTML = 'palauta vakio ryhmät'
    resetGroupsButton.addEventListener('click', () => {
        if(confirm('Poista kaikki nykyiset ryhmät ja palauta vakio ryhmät?')){
            resetGroups()
                .then(response => {
                    location.reload()
                })
                .catch(e => alert(`database error: ${e}`))
        }
    })

    otherContainer.appendChild(resetGroupsButton)

    mainElement.appendChild(otherContainer)
})