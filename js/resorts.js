'use strict';
/* Gebietsliste.
   Format je Zeile: id|Name|Land|Region|Breite|Länge|Höhe Tal|Höhe Berg|Grösse 1–5|Flags
   Grösse 1 = klein/lokal, 5 = sehr gross/sehr beliebt (fliesst in die Andrang-Schätzung ein).
   Flags: t = in der TopCard enthalten, p = TopCard-Partnergebiet (Wahltage, bitte selbst prüfen).
   Koordinaten und Höhen sind gerundete Richtwerte – genau genug für die Wettervorhersage. */

const SKI_RAW = `
arosa-lenzerheide|Arosa Lenzerheide|CH|Graubünden|46.729|9.557|1229|2865|5|t
laax|LAAX (Flims Laax Falera)|CH|Graubünden|46.807|9.258|1100|3018|5|t
davos-parsenn|Davos Klosters · Parsenn|CH|Graubünden|46.812|9.836|1191|2844|5|t
davos-jakobshorn|Davos · Jakobshorn|CH|Graubünden|46.789|9.835|1540|2590|3|t
klosters-madrisa|Klosters · Madrisa|CH|Graubünden|46.885|9.878|1124|2602|2|t
davos-rinerhorn|Davos · Rinerhorn|CH|Graubünden|46.741|9.782|1450|2490|2|t
st-moritz|St. Moritz · Corviglia|CH|Graubünden|46.497|9.838|1720|3057|5|
corvatsch|Corvatsch · Furtschellas|CH|Graubünden|46.459|9.817|1800|3303|4|
diavolezza|Diavolezza · Lagalb|CH|Graubünden|46.412|9.966|2093|2978|2|
scuol|Scuol · Motta Naluns|CH|Graubünden|46.797|10.298|1250|2783|3|
samnaun|Samnaun (Silvretta Arena)|CH|Graubünden|46.944|10.361|1840|2872|4|
savognin|Savognin|CH|Graubünden|46.597|9.598|1200|2713|3|
obersaxen|Obersaxen Mundaun|CH|Graubünden|46.747|9.103|1201|2310|3|
brigels|Brigels Waltensburg|CH|Graubünden|46.769|9.063|1100|2418|2|
disentis|Disentis|CH|Graubünden|46.703|8.853|1150|2833|2|
spluegen|Splügen · Tambo|CH|Graubünden|46.553|9.322|1480|2215|2|
bivio|Bivio|CH|Graubünden|46.469|9.650|1770|2560|1|
tschiertschen|Tschiertschen|CH|Graubünden|46.817|9.607|1350|2400|1|
gruesch-danusa|Grüsch-Danusa|CH|Graubünden|46.981|9.648|630|1800|2|
vals|Vals 3000|CH|Graubünden|46.617|9.181|1270|2941|1|
zuoz|Zuoz|CH|Graubünden|46.602|9.960|1720|2465|1|
brambruesch|Chur · Brambrüesch|CH|Graubünden|46.829|9.510|595|2174|1|
andermatt|Andermatt-Sedrun-Disentis|CH|Uri|46.636|8.594|1444|2961|4|
engelberg|Engelberg Titlis|CH|Obwalden|46.821|8.402|1003|3020|4|p
melchsee-frutt|Melchsee-Frutt|CH|Obwalden|46.775|8.269|1080|2255|2|
soerenberg|Sörenberg|CH|Luzern|46.823|8.035|1166|2350|2|
stoos|Stoos|CH|Schwyz|46.976|8.662|1300|1935|2|
hoch-ybrig|Hoch-Ybrig|CH|Schwyz|47.021|8.789|1038|1831|2|
flumserberg|Flumserberg|CH|St. Gallen|47.092|9.283|1220|2222|4|
pizol|Pizol|CH|St. Gallen|47.004|9.438|520|2227|3|
toggenburg|Toggenburg · Chäserrugg|CH|St. Gallen|47.203|9.353|900|2262|3|
braunwald|Braunwald|CH|Glarus|46.940|8.998|1256|1904|1|
elm|Elm|CH|Glarus|46.919|9.172|1000|2105|2|
airolo|Airolo-Pesciüm|CH|Tessin|46.528|8.609|1175|2250|2|
bosco-gurin|Bosco Gurin|CH|Tessin|46.317|8.492|1500|2400|1|
jungfrau|Jungfrau Ski Region (Grindelwald-Wengen)|CH|Bern|46.624|8.041|943|2500|5|p
muerren|Mürren-Schilthorn|CH|Bern|46.559|7.892|796|2970|3|
adelboden-lenk|Adelboden-Lenk|CH|Bern|46.493|7.559|1068|2362|4|p
gstaad|Gstaad|CH|Bern|46.475|7.286|1000|2151|4|
meiringen|Meiringen-Hasliberg|CH|Bern|46.741|8.209|600|2433|3|
glacier-3000|Glacier 3000 (Les Diablerets)|CH|Waadt|46.343|7.205|1350|3000|2|
villars|Villars-Gryon-Diablerets|CH|Waadt|46.299|7.055|1250|2120|3|
leysin|Leysin|CH|Waadt|46.343|7.012|1300|2205|2|
zermatt|Zermatt|CH|Wallis|46.021|7.749|1620|3899|5|
saas-fee|Saas-Fee|CH|Wallis|46.108|7.927|1800|3573|4|
verbier|Verbier (4 Vallées)|CH|Wallis|46.096|7.228|1500|3330|5|
nendaz|Nendaz · Veysonnaz|CH|Wallis|46.185|7.305|1400|3330|4|
crans-montana|Crans-Montana|CH|Wallis|46.311|7.482|1500|2927|4|
aletsch|Aletsch Arena|CH|Wallis|46.378|8.027|1050|2869|4|p
belalp|Belalp|CH|Wallis|46.371|7.977|1322|3112|2|
graechen|Grächen|CH|Wallis|46.195|7.838|1619|2868|2|
leukerbad|Leukerbad|CH|Wallis|46.379|7.627|1411|2610|2|
lauchernalp|Lauchernalp (Lötschental)|CH|Wallis|46.416|7.775|1419|3111|2|
grimentz-zinal|Grimentz-Zinal|CH|Wallis|46.180|7.576|1570|2900|3|
st-luc|St-Luc · Chandolin|CH|Wallis|46.221|7.598|1650|3000|2|
champery|Champéry (Portes du Soleil)|CH|Wallis|46.178|6.870|1050|2277|4|
anzere|Anzère|CH|Wallis|46.296|7.396|1500|2420|2|
malbun|Malbun|LI|Liechtenstein|47.102|9.610|1600|2000|1|
st-anton|St. Anton am Arlberg|AT|Tirol|47.130|10.268|1304|2811|5|
lech-zuers|Lech Zürs|AT|Vorarlberg|47.208|10.142|1450|2450|5|
ischgl|Ischgl (Silvretta Arena)|AT|Tirol|47.012|10.293|1377|2872|5|
soelden|Sölden|AT|Tirol|46.966|11.007|1350|3340|5|
obergurgl|Obergurgl-Hochgurgl|AT|Tirol|46.871|11.027|1800|3080|3|
serfaus|Serfaus-Fiss-Ladis|AT|Tirol|47.040|10.607|1200|2828|5|
kitzbuehel|Kitzbühel (KitzSki)|AT|Tirol|47.446|12.392|800|2000|5|
skiwelt|SkiWelt Wilder Kaiser – Brixental|AT|Tirol|47.504|12.193|620|1957|5|
zillertal-arena|Zillertal Arena|AT|Tirol|47.239|11.881|580|2500|4|
mayrhofen|Mayrhofen|AT|Tirol|47.167|11.865|630|2500|4|
hintertux|Hintertuxer Gletscher|AT|Tirol|47.111|11.676|1500|3250|3|
stubai|Stubaier Gletscher|AT|Tirol|47.020|11.160|1750|3210|4|
kaunertal|Kaunertaler Gletscher|AT|Tirol|46.864|10.713|2150|3108|2|
pitztal|Pitztaler Gletscher|AT|Tirol|46.925|10.879|1740|3440|2|
nauders|Nauders|AT|Tirol|46.889|10.501|1400|2850|3|
axamer-lizum|Axamer Lizum|AT|Tirol|47.195|11.300|1580|2340|2|
kuehtai|Kühtai|AT|Tirol|47.213|11.023|2020|2520|2|
ehrwald|Ehrwald (Zugspitz Arena)|AT|Tirol|47.399|10.920|1000|2100|3|
montafon|Silvretta Montafon|AT|Vorarlberg|47.020|9.970|700|2430|4|
damuels|Damüls-Mellau|AT|Vorarlberg|47.281|9.892|700|2050|3|
brandnertal|Brandnertal|AT|Vorarlberg|47.105|9.737|890|2000|2|
saalbach|Saalbach Hinterglemm Leogang Fieberbrunn|AT|Salzburg|47.391|12.636|830|2096|5|
zell-kaprun|Zell am See – Kaprun|AT|Salzburg|47.323|12.796|768|3029|4|
obertauern|Obertauern|AT|Salzburg|47.249|13.560|1630|2313|4|
flachau|Flachau (Snow Space Salzburg)|AT|Salzburg|47.345|13.392|800|1980|4|
gastein|Bad Gastein|AT|Salzburg|47.115|13.134|840|2686|4|
schladming|Schladming-Dachstein (Planai)|AT|Steiermark|47.393|13.688|745|2015|5|
nassfeld|Nassfeld|AT|Kärnten|46.563|13.276|610|2020|4|
bad-kleinkirchheim|Bad Kleinkirchheim|AT|Kärnten|46.814|13.797|1087|2055|3|
garmisch|Garmisch-Classic|DE|Bayern|47.474|11.062|740|2050|3|
zugspitze|Zugspitze|DE|Bayern|47.421|10.985|2000|2720|2|
oberstdorf|Oberstdorf-Kleinwalsertal|DE|Bayern|47.356|10.257|920|2224|4|
oberjoch|Oberjoch|DE|Bayern|47.516|10.407|1130|1560|2|
sudelfeld|Sudelfeld|DE|Bayern|47.676|12.030|800|1563|2|
brauneck|Brauneck (Lenggries)|DE|Bayern|47.668|11.530|700|1712|2|
steinplatte|Winklmoos-Steinplatte|DE|Bayern|47.630|12.570|740|1860|3|
balderschwang|Balderschwang|DE|Bayern|47.467|10.100|1044|1500|1|
arber|Grosser Arber|DE|Bayern|49.112|13.136|1050|1456|2|
feldberg|Feldberg|DE|Baden-Württemberg|47.860|8.036|945|1450|3|
winterberg|Winterberg|DE|Nordrhein-Westfalen|51.193|8.530|630|820|3|
chamonix|Chamonix-Mont-Blanc|FR|Haute-Savoie|45.924|6.870|1035|3275|5|
val-disere|Val d'Isère – Tignes|FR|Savoie|45.449|6.980|1550|3456|5|
trois-vallees|Les 3 Vallées (Courchevel-Méribel)|FR|Savoie|45.397|6.566|1300|3230|5|
val-thorens|Val Thorens|FR|Savoie|45.298|6.580|2300|3230|5|
paradiski|Paradiski (Les Arcs – La Plagne)|FR|Savoie|45.572|6.829|1200|3226|5|
alpe-dhuez|Alpe d'Huez|FR|Isère|45.092|6.068|1250|3330|5|
les-2-alpes|Les 2 Alpes|FR|Isère|45.010|6.124|1300|3568|4|
serre-chevalier|Serre Chevalier|FR|Hautes-Alpes|44.946|6.559|1200|2800|4|
avoriaz|Avoriaz · Morzine (Portes du Soleil)|FR|Haute-Savoie|46.192|6.775|1000|2466|5|
megeve|Megève (Évasion Mont-Blanc)|FR|Haute-Savoie|45.857|6.617|850|2353|4|
la-clusaz|La Clusaz|FR|Haute-Savoie|45.904|6.424|1100|2600|3|
flaine|Flaine (Grand Massif)|FR|Haute-Savoie|46.006|6.690|700|2500|4|
les-gets|Les Gets|FR|Haute-Savoie|46.159|6.670|1172|2002|3|
la-rosiere|La Rosière|FR|Savoie|45.627|6.850|1176|2641|3|
val-cenis|Val Cenis|FR|Savoie|45.287|6.900|1300|2800|3|
la-bresse|La Bresse-Hohneck (Vogesen)|FR|Vosges|48.040|6.960|900|1350|2|
metabief|Métabief (Jura)|FR|Doubs|46.774|6.352|900|1463|2|
livigno|Livigno|IT|Lombardei|46.538|10.135|1816|2798|4|
bormio|Bormio|IT|Lombardei|46.467|10.370|1225|3012|3|
madesimo|Madesimo|IT|Lombardei|46.438|9.358|1550|2880|2|
aprica|Aprica|IT|Lombardei|46.154|10.152|1162|2270|2|
tonale|Passo Tonale · Pontedilegno|IT|Lombardei|46.258|10.584|1121|3016|3|
cervinia|Breuil-Cervinia|IT|Aostatal|45.934|7.631|1524|3480|5|
courmayeur|Courmayeur|IT|Aostatal|45.791|6.969|1224|2755|3|
la-thuile|La Thuile|IT|Aostatal|45.714|6.953|1441|2641|3|
monterosa|Monterosa Ski (Gressoney · Alagna)|IT|Aostatal|45.826|7.826|1212|3275|4|
sestriere|Sestriere (Via Lattea)|IT|Piemont|44.958|6.879|1350|2823|4|
campiglio|Madonna di Campiglio|IT|Trentino|46.230|10.827|850|2500|4|
fassa|Val di Fassa (Canazei)|IT|Trentino|46.477|11.771|1450|2630|4|
groeden|Gröden / Val Gardena (Sellaronda)|IT|Südtirol|46.556|11.756|1236|2518|5|
alta-badia|Alta Badia|IT|Südtirol|46.549|11.873|1324|2778|5|
kronplatz|Kronplatz|IT|Südtirol|46.738|11.958|935|2275|4|
obereggen|Obereggen (Latemar)|IT|Südtirol|46.385|11.530|1540|2500|3|
schnalstal|Schnalstaler Gletscher|IT|Südtirol|46.756|10.782|2011|3212|2|
sulden|Sulden am Ortler|IT|Südtirol|46.527|10.590|1900|3250|2|
drei-zinnen|3 Zinnen Dolomiten|IT|Südtirol|46.700|12.350|1130|2200|3|
cortina|Cortina d'Ampezzo|IT|Venetien|46.540|12.136|1224|2930|4|
grandvalira|Grandvalira|AD|Andorra|42.540|1.730|1710|2640|5|
baqueira|Baqueira Beret|ES|Pyrenäen|42.700|0.930|1500|2610|4|
sierra-nevada|Sierra Nevada|ES|Andalusien|37.094|-3.398|2100|3300|3|
kranjska-gora|Kranjska Gora|SI|Oberkrain|46.485|13.786|800|1215|2|
spindleruv-mlyn|Špindlerův Mlýn|CZ|Riesengebirge|50.726|15.609|715|1310|3|
jasna|Jasná|SK|Niedere Tatra|48.970|19.580|943|2024|3|
are|Åre|SE|Jämtland|63.400|13.080|380|1274|4|
hemsedal|Hemsedal|NO|Viken|60.860|8.500|620|1450|3|
`;

const BIKE_RAW = `
bike-lenzerheide|Bike Kingdom Lenzerheide|CH|Graubünden|46.729|9.557|1470|2865|5|t
bike-arosa|Arosa (Hörnli Trail)|CH|Graubünden|46.783|9.679|1739|2653|2|t
bike-laax|LAAX Bike (Flims Laax Falera)|CH|Graubünden|46.807|9.258|1100|2252|4|t
bike-davos|Davos Klosters Bike|CH|Graubünden|46.800|9.830|1560|2662|4|t
bike-chur|Alpenbikepark Chur (Brambrüesch)|CH|Graubünden|46.829|9.510|595|1600|2|
bike-st-moritz|St. Moritz (Corviglia Flow Trails)|CH|Graubünden|46.497|9.838|1822|2486|3|
bike-scuol|Scuol (Motta Naluns Trails)|CH|Graubünden|46.797|10.298|1250|2146|2|
bike-flumserberg|Flumserberg (BikerBerg)|CH|St. Gallen|47.092|9.283|1220|2020|2|
bike-kronberg|Bikepark Jakobsbad-Kronberg|CH|Appenzell|47.320|9.330|870|1663|1|
bike-engelberg|Engelberg (Trübsee · Jochpass)|CH|Obwalden|46.821|8.402|1003|2207|2|
bike-wiriehorn|Bikepark Wiriehorn|CH|Bern|46.600|7.540|1010|1436|1|
bike-gurten|Gurten Trail (Bern)|CH|Bern|46.920|7.441|570|858|1|
bike-verbier|Verbier Bikepark|CH|Wallis|46.096|7.228|1500|2200|4|
bike-crans-montana|Crans-Montana Bikepark|CH|Wallis|46.311|7.482|1500|2260|2|
bike-bellwald|Bellwald Bikepark|CH|Wallis|46.426|8.160|1560|2050|2|
bike-zermatt|Zermatt (Sunnegga · Gornergrat)|CH|Wallis|46.021|7.749|1620|3089|3|
bike-morgins|Morgins · Champéry (Portes du Soleil)|CH|Wallis|46.238|6.853|1320|2000|4|
bike-tamaro|Monte Tamaro Bikepark|CH|Tessin|46.123|8.923|470|1530|2|
bike-leogang|Epic Bikepark Leogang|AT|Salzburg|47.440|12.720|840|1760|5|
bike-saalbach|Saalbach Hinterglemm|AT|Salzburg|47.391|12.636|1003|2020|5|
bike-wagrain|Bikepark Wagrain|AT|Salzburg|47.335|13.300|850|1700|2|
bike-schladming|Bikepark Schladming|AT|Steiermark|47.393|13.688|745|1830|4|
bike-soelden|Bike Republic Sölden|AT|Tirol|46.966|11.007|1350|2670|4|
bike-serfaus|Bikepark Serfaus-Fiss-Ladis|AT|Tirol|47.040|10.607|1427|1980|4|
bike-innsbruck|Bikepark Innsbruck (Muttereralm)|AT|Tirol|47.228|11.380|950|1608|3|
bike-nauders|Nauders · Reschenpass (3-Länder Enduro)|AT|Tirol|46.889|10.501|1400|2600|3|
bike-ischgl|Ischgl Trails|AT|Tirol|47.012|10.293|1377|2320|2|
bike-brandnertal|Bikepark Brandnertal|AT|Vorarlberg|47.140|9.770|890|1600|3|
bike-semmering|Bikepark Semmering|AT|Niederösterreich|47.632|15.829|1000|1340|2|
bike-petzen|Bikepark Petzen|AT|Kärnten|46.550|14.770|600|1700|2|
bike-winterberg|Bikepark Winterberg|DE|Nordrhein-Westfalen|51.193|8.530|630|740|4|
bike-willingen|Bikepark Willingen|DE|Hessen|51.292|8.610|570|838|3|
bike-todtnau|Bikepark Todtnau|DE|Baden-Württemberg|47.830|7.950|660|1158|3|
bike-bad-wildbad|Bikepark Bad Wildbad|DE|Baden-Württemberg|48.750|8.550|430|730|2|
bike-albstadt|Bikepark Albstadt|DE|Baden-Württemberg|48.210|9.020|750|950|1|
bike-geisskopf|Bikepark Geisskopf (Bischofsmais)|DE|Bayern|48.920|13.020|800|1097|3|
bike-oberammergau|Bikepark Oberammergau|DE|Bayern|47.590|11.070|840|1260|2|
bike-hindelang|Bikepark Hindelang|DE|Bayern|47.500|10.370|850|1320|2|
bike-samerberg|Bikepark Samerberg|DE|Bayern|47.780|12.200|700|900|1|
bike-ochsenkopf|Bikepark Ochsenkopf|DE|Bayern|50.030|11.810|650|1024|2|
bike-hahnenklee|Bikepark Hahnenklee (Harz)|DE|Niedersachsen|51.860|10.340|560|726|2|
bike-les-gets|Les Gets Bikepark|FR|Haute-Savoie|46.159|6.670|1172|1827|5|
bike-morzine|Morzine · Avoriaz Bikepark|FR|Haute-Savoie|46.179|6.709|1000|2020|5|
bike-chatel|Châtel Bikepark|FR|Haute-Savoie|46.267|6.840|1200|1900|4|
bike-tignes|Tignes · Val d'Isère Bikepark|FR|Savoie|45.468|6.906|2100|2704|4|
bike-les-arcs|Les Arcs Bikepark|FR|Savoie|45.572|6.829|1600|2400|3|
bike-les-2-alpes|Les 2 Alpes Bikepark|FR|Isère|45.010|6.124|1650|2600|4|
bike-alpe-dhuez|Alpe d'Huez Bikepark|FR|Isère|45.092|6.068|1860|2800|3|
bike-metabief|Métabief Bikepark|FR|Doubs|46.774|6.352|900|1420|2|
bike-lac-blanc|Lac Blanc Bikepark (Vogesen)|FR|Haut-Rhin|48.130|7.090|900|1228|3|
bike-livigno|Livigno Bikepark Mottolino|IT|Lombardei|46.538|10.135|1816|2400|4|
bike-paganella|Dolomiti Paganella Bike (Andalo)|IT|Trentino|46.165|11.004|1040|2125|4|
bike-val-di-sole|Val di Sole Bikeland|IT|Trentino|46.320|10.830|814|2040|3|
bike-kronplatz|Bikepark Kronplatz|IT|Südtirol|46.738|11.958|935|2275|3|
bike-plose|Plose (Brixen)|IT|Südtirol|46.700|11.720|1067|2050|2|
bike-la-thuile|La Thuile Bikepark|IT|Aostatal|45.714|6.953|1441|2400|3|
bike-pila|Pila Bikepark (Aosta)|IT|Aostatal|45.686|7.310|580|2300|3|
bike-finale|Finale Ligure (Shuttle-Trails)|IT|Ligurien|44.170|8.343|10|1000|5|
bike-vallnord|Vallnord Bike Park|AD|Andorra|42.545|1.515|1240|2360|4|
bike-maribor|Bikepark Pohorje (Maribor)|SI|Štajerska|46.530|15.600|325|1050|3|
bike-kranjska-gora|Bikepark Kranjska Gora|SI|Oberkrain|46.485|13.786|810|1215|2|
bike-spicak|Bikepark Špičák|CZ|Böhmerwald|49.170|13.220|860|1202|2|
bike-are|Åre Bike Park|SE|Jämtland|63.400|13.080|380|1274|4|
bike-hafjell|Hafjell Bike Park|NO|Innlandet|61.240|10.440|200|1030|3|
`;

function parseResorts(raw, type) {
  return raw.trim().split('\n').map(line => {
    const [id, name, cc, region, lat, lon, base, top, size, flags = ''] = line.split('|');
    return { id, name, cc, region, lat: +lat, lon: +lon, base: +base, top: +top, size: +size, type,
      topcard: flags.includes('t'), partner: flags.includes('p') };
  });
}
const RESORTS = [...parseResorts(SKI_RAW, 'ski'), ...parseResorts(BIKE_RAW, 'bike')];

const COUNTRY_NAMES = { CH: 'Schweiz', AT: 'Österreich', DE: 'Deutschland', FR: 'Frankreich', IT: 'Italien', LI: 'Liechtenstein',
  AD: 'Andorra', ES: 'Spanien', SI: 'Slowenien', CZ: 'Tschechien', SK: 'Slowakei', SE: 'Schweden', NO: 'Norwegen' };

/* Richtpreise Tageskarte Erwachsene in CHF: wd = Wochentag, we = Wochenende/Feiertag, hs = Hochsaison.
   est markiert Schätzwerte (1 = geschätzt). Quelle der recherchierten Werte in src.
   Stand der Recherche: November 2026. Viele Gebiete rechnen dynamisch – die Werte sind Richtpreise. */
const PRICES = {
  'arosa-lenzerheide': { wd: 79, we: 85, hs: 89, est: { wd: 1, we: 1 }, src: 'Hauptsaison 2026/27 an der Kasse: CHF 89 (schneehoehen.de)' },
  'davos-parsenn':     { wd: 78, we: 84, hs: 87, est: { wd: 1, we: 1 }, src: 'Kombi Parsenn + Jakobshorn, Hauptsaison 2026/27: CHF 87 (schneehoehen.de); Regionalpass CHF 94' },
  'davos-jakobshorn':  { wd: 78, we: 84, hs: 87, est: { wd: 1, we: 1 }, src: 'Kombi Parsenn + Jakobshorn, Hauptsaison 2026/27: CHF 87 (schneehoehen.de)' },
  'klosters-madrisa':  { wd: 62, we: 66, hs: 69, est: { wd: 1, we: 1, hs: 1 } },
  'davos-rinerhorn':   { wd: 58, we: 62, hs: 65, est: { wd: 1, we: 1, hs: 1 } },
  'laax':              { wd: 79, we: 89, hs: 99, est: { wd: 1, we: 1, hs: 1 } },
  'bike-lenzerheide':  { wd: 53, we: 56, hs: 56, est: { we: 1, hs: 1 }, src: 'Tageskarte Bike 2026 ab CHF 53 (graubuenden.ch)' },
  'bike-arosa':        { wd: 45, we: 45, hs: 48, est: { wd: 1, we: 1, hs: 1 } },
  'bike-laax':         { wd: 52, we: 52, hs: 55, est: { wd: 1, we: 1, hs: 1 } },
  'bike-davos':        { wd: 49, we: 49, hs: 52, est: { wd: 1, we: 1, hs: 1 } },
  'jungfrau':          { wd: 75, we: 80, hs: 83, est: { wd: 1, we: 1 }, src: 'Hauptsaison 2026/27: CHF 83 (schneehoehen.de)' },
};

/* Saison und Betriebszeiten: from/to als Monat-Tag (jährlich wiederkehrend), first = erste Bergfahrt, last = letzte Talfahrt.
   est markiert Schätzwerte. Recherchiert im November 2026 für den Winter 2026/27; Vorsaison-Wochenenden sind nicht abgebildet. */
const OPS = {
  'arosa-lenzerheide': { from: '11-28', to: '04-11', first: '08:30', last: '16:45', est: {}, src: 'Saison 28.11.2026 bis 11.4.2027 (graubuenden.ch), Betriebszeiten laut bergfex' },
  'laax':              { from: '12-05', to: '04-11', first: '08:30', last: '17:30', est: {}, src: 'Saison 5.12.2026 bis 11.4.2027, Anlagen 08:30 bis 17:30 (graubuenden.ch)' },
  'davos-parsenn':     { from: '11-20', to: '04-04', first: '08:30', last: '16:30', est: { first: 1, last: 1 }, src: 'Durchgehender Betrieb 20.11.2026 bis 4.4.2027, davor Wochenendbetrieb ab 13.11. (davos.ch)' },
  'davos-jakobshorn':  { from: '12-04', to: '04-11', first: '08:30', last: '16:30', est: { first: 1, last: 1 }, src: 'Durchgehender Betrieb 4.12.2026 bis 11.4.2027, davor Wochenendbetrieb 27. bis 29.11. (davos.ch)' },
  'klosters-madrisa':  { from: '12-18', to: '03-29', first: '08:30', last: '16:30', est: { first: 1, last: 1 }, src: 'Betrieb 18.12.2026 bis 29.3.2027 (davos.ch)' },
  'davos-rinerhorn':   { from: '12-18', to: '03-29', first: '08:30', last: '16:30', est: { first: 1, last: 1 }, src: 'Betrieb 18.12.2026 bis 29.3.2027, während des WEF geschlossen (davos.ch)' },
  'bike-lenzerheide':  { from: '05-22', to: '10-25', first: '09:00', last: '17:00', est: { to: 1, first: 1, last: 1 }, src: 'Saisonstart 22.5.2026 (graubuenden.ch)' },
};
