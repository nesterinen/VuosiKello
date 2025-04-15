document.addEventListener('DOMContentLoaded', async () => {
    const mainElement = document.getElementById('VuosiKalenteri')
    if (mainElement === null) return

    mainElement.innerHTML = `
        <button class='testButton'>off</button>
    `
    
})