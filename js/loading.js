/*
class LoadingGraphic {
    element
    isLoading = false

    constructor(element){
        this.element = this.#CheckIfDomElement(element)
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
            <div style='font-size: 10em; color: red;'>LOADING</div>
        `

        this.element.style = 'position: absolute; top: 100px; left:100px'
    }
}
*/