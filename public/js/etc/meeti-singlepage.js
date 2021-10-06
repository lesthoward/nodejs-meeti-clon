import axios from 'axios';

let $assistantState = document.querySelector('#assistantState').value;
const $assistantForm = document.querySelector('#addAssistant');
const $btnAssistant = document.querySelector('#btnAssistant');
const $mensaje = document.querySelector('#mensaje');


if($assistantForm) {
    $assistantForm.addEventListener('click', addAssistant)
}

async function addAssistant (e) {
    e.preventDefault()
    const requestBody = {
        assistantState: $assistantState
    }
    if($assistantState === 'confirm') {
        $assistantState = 'cancel'
        $btnAssistant.value = 'No, cancelar asistencia'
        $btnAssistant.classList.remove('btn-azul')
        $btnAssistant.classList.add('btn-rojo')
    } else {
        $assistantState = 'confirm'
        $btnAssistant.value = 'Si, confirmar asistencia'
        $btnAssistant.classList.remove('btn-rojo')
        $btnAssistant.classList.add('btn-azul')
    }
    const response = await axios.post(this.action, requestBody)
    $mensaje.innerHTML = ''
    $mensaje.appendChild(document.createTextNode(response.data))
}