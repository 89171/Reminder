class MyClassElement extends HTMLElement {
    constructor() {
        super();
        this.render()
    }
    render(){
        const shadow = this.attachShadow({mode: 'open'});
        const div = document.createElement('div');
        div.textContent = 'hello world';
        div.style = "color: red"
        shadow.appendChild(div);
        return shadow
    }
}
customElements.define('my-class', MyClassElement);