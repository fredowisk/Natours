/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZnJlZG93aXNrIiwiYSI6ImNrdjhuOHZvejAyOWoyeG5vanlkZGxxNXgifQ.mES_ZhZPY6QDTYyBOpJANQ';

  const [lat, lng] = locations[0].coordinates;

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/fredowisk/ckv8r3mv58bbk14piycgv6uhj',
    zoom: 1,
    scrollZoom: false
  });

  const newButton = document.getElementById('zoom');

  newButton.addEventListener('click', () => {
    locations.forEach(location => {
      const el = document.createElement('div');
      el.className = 'marker';

      new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(location.coordinates)
        .addTo(map);

      new mapboxgl.Popup({
        offset: 30
      })
        .setLngLat(location.coordinates)
        .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
        .addTo(map);
    });

    map.flyTo({
      center: [lat, lng],
      zoom: 6,
      bearing: 0,
      speed: 1, // make the flying slow
      easing: t => t,
      essential: true,
      padding: {
        top: 400,
        bottom: 200,
        left: 100,
        right: 100
      }
    });

    newButton.style.display = 'none';
  });
};
