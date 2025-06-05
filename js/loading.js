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

    /*
    render(){
        this.element.innerHTML = `
            <div style='font-size: 10em; color: red;'>LOADING</div>
        `

        this.element.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'
    }
    */

    start(){
        this.element.innerHTML = `
            <div class='LoadingGraphic'>
                <div class='loadingText'>Ladataan</div>
                <div class='rotatingBorder'></div>
            </div>
        `

        this.element.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'
    }

    stop(){
        this.element.innerHTML = ''
    }
}