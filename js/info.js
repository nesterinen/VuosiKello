class InfoElement {
    element

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
            <div class='generalInfo'>
                <h1>stuff</h1>
                <p>bla bla asd asd asd asd asd asd asd asdas dasdasd asdasd</p>
            </div>

            <div class='eventInfo'>
                <h1>thing</h1>
                <p>asd</p>
            </div>
        `
    }
}