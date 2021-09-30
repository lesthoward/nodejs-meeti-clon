import { OpenStreetMapProvider } from 'leaflet-geosearch'
const lat = 10.016591
const long = -84.214341

if(document.querySelector('#map')) {
    const map = L.map('map').setView([lat, long], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    L.marker([lat, long]).addTo(map)
        .bindPopup('Escribe y encuentra un lugar en el mapa')
        .openPopup();
    
    const searcher = document.getElementById('searcher');
    if(searcher) {
        searcher.addEventListener('input', searchAddress)
    }

    function searchAddress (e) {
        if(e.target.value.length > 7) {
            const provider = new OpenStreetMapProvider()
            provider.search({query: e.target.value})
                .then(result => {
                    if(result.length) {
                        const coordinates = [result[0].y, result[0].x]
                        map.setView(coordinates, 16)
                        document.getElementById('direccion').value = result[0].label
                    }
                    // marker = new L.marker([result[0].y, result[0].x], {
                    //     // draggable: true,
                    //     // autoPan: true
                    // })
                    // .addTo(map)
                    // .bindPopup(result[0].label)
                    // .openPopup();
    
                })
        }
    }
    
}


