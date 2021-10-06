import axios from 'axios'
const commentsContainer = document.querySelector('.comentarios');
commentsContainer.addEventListener('click', (e) => formEvents(e));

const formEvents = async (e) => {
    if(e.target.classList.contains('btn-azul')) {
        const res = await axios.post('/meeti/delete-comment', {
            commentID: e.target.dataset.commentid
        })
        if(res.data === 'OK') {
            e.target.parentNode.parentNode.remove()
        }
    }
}