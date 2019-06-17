// Data url for tectonic plates
const tectonicPlatesUrl = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json";


d3.json(tectonicPlatesUrl).then((bndrData) => {

    var tectonicBndr = L.geoJson(bndrData, {
        color: "orange",
        weight: 2
    });      
    
});
