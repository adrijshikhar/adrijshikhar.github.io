/**
 * Real astronomy data ported verbatim from the `stars.html` prototype
 * (validated against real ephemerides during development). Pure data only —
 * no DOM, no rendering. See `astronomy.ts` for the maths that consumes it.
 */

/** [name, RA hours (J2000), Dec degrees (J2000), visual magnitude] */
export type Star = readonly [name: string, raHours: number, decDeg: number, mag: number];

/** Orbital elements at J2000 plus per-century rates, plus an absolute-magnitude-ish constant. */
export type OrbitalElements = readonly [elements: number[], rates: number[], extra?: number];

/* ===========================================================================
   REAL STAR CATALOGUE — 58 brightest stars.
   [name, RA hours (J2000), Dec degrees (J2000), visual magnitude]
   Positions are J2000 mean places. Precession and proper motion are NOT
   applied — error is a few arcminutes, invisible at this rendering scale.
   =========================================================================== */
export const STARS: Star[] = [
 ['Sirius',6.7525,-16.716,-1.46], ['Canopus',6.3992,-52.696,-0.74],
 ['Rigil Kent.',14.6600,-60.834,-0.27], ['Arcturus',14.2610,19.182,-0.05],
 ['Vega',18.6156,38.784,0.03], ['Capella',5.2782,45.998,0.08],
 ['Rigel',5.2423,-8.202,0.13], ['Procyon',7.6551,5.225,0.34],
 ['Achernar',1.6286,-57.237,0.46], ['Betelgeuse',5.9195,7.407,0.50],
 ['Hadar',14.0637,-60.373,0.61], ['Altair',19.8464,8.868,0.77],
 ['Acrux',12.4433,-63.099,0.77], ['Aldebaran',4.5987,16.509,0.85],
 ['Spica',13.4199,-11.161,1.04], ['Antares',16.4901,-26.432,1.09],
 ['Pollux',7.7553,28.026,1.14], ['Fomalhaut',22.9608,-29.622,1.16],
 ['Deneb',20.6905,45.280,1.25], ['Mimosa',12.7953,-59.689,1.25],
 ['Regulus',10.1395,11.967,1.35], ['Adhara',6.9770,-28.972,1.50],
 ['Castor',7.5767,31.888,1.58], ['Shaula',17.5601,-37.104,1.62],
 ['Gacrux',12.5194,-57.113,1.63], ['Bellatrix',5.4185,6.350,1.64],
 ['Elnath',5.4382,28.608,1.65], ['Miaplacidus',9.2200,-69.717,1.67],
 ['Alnilam',5.6036,-1.202,1.69], ['Alnair',22.1372,-46.961,1.74],
 ['Alnitak',5.6793,-1.943,1.77], ['Alioth',12.9005,55.960,1.77],
 ['Dubhe',11.0621,61.751,1.79], ['Mirfak',3.4054,49.861,1.79],
 ['Wezen',7.1399,-26.393,1.83], ['Kaus Aus.',18.4029,-34.384,1.85],
 ['Alkaid',13.7923,49.313,1.86], ['Sargas',17.6221,-42.998,1.87],
 ['Avior',8.3752,-59.510,1.86], ['Menkalinan',5.9922,44.947,1.90],
 ['Atria',16.8111,-69.028,1.91], ['Alhena',6.6285,16.399,1.93],
 ['Peacock',20.4275,-56.735,1.94], ['Polaris',2.5303,89.264,1.98],
 ['Mirzam',6.3783,-17.956,1.98], ['Alphard',9.4597,-8.659,2.00],
 ['Hamal',2.1195,23.462,2.00], ['Diphda',0.7265,-17.987,2.04],
 ['Nunki',18.9212,-26.297,2.05], ['Saiph',5.7959,-9.670,2.06],
 ['Menkent',14.1114,-36.370,2.06], ['Algieba',10.3328,19.841,2.08],
 ['Mintaka',5.5334,-0.299,2.23], ['Mizar',13.3987,54.925,2.23],
 ['Schedar',0.6751,56.537,2.24], ['Caph',0.1530,59.150,2.28],
 ['Merak',11.0307,56.382,2.37], ['Phecda',11.8972,53.695,2.44],
 ['Ruchbah',1.4303,60.235,2.68], ['Megrez',12.2571,57.033,3.31],
 ['Gamma Cas',0.9451,60.717,2.47], ['Segin',1.9066,63.670,3.35],
 ['Delta Cru',12.2525,-58.749,2.79],
 // extra stars so more figures close properly across the wider field
 ['Sadr',20.3705,40.257,2.23],    ['Gienah Cyg',20.7702,33.970,2.48],
 ['Albireo',19.5121,27.960,3.18], ['Delta Cyg',19.7495,45.131,2.87],
 ['Dschubba',16.0055,-22.622,2.29],['Acrab',16.0906,-19.805,2.62],
 ['Epsilon Sco',16.8361,-34.293,2.29],
 ['Denebola',11.8177,14.572,2.14],['Zosma',11.2351,20.524,2.56],
 ['Alphecca',15.5781,26.715,2.22],['Rasalhague',17.5822,12.560,2.08],
 ['Alpheratz',0.1398,29.091,2.06],['Mirach',1.1622,35.620,2.06],
 ['Almach',2.0650,42.330,2.10],   ['Markab',23.0793,15.205,2.48],
 ['Scheat',23.0629,28.083,2.42],  ['Algenib',0.2206,15.184,2.83],
 // more real mag-2 to mag-3 stars — spreads decent-sized targets across the sky
 ['Kochab',14.8451,74.156,2.08],  ['Eltanin',17.9435,51.489,2.24],
 ['Alderamin',21.3097,62.586,2.45],['Sabik',17.1729,-15.725,2.43],
 ['Izar',14.7498,27.074,2.35],    ['Muphrid',13.9114,18.398,2.68],
 ['Unukalhai',15.7378,6.426,2.63],['Zubeneschamali',15.2833,-9.383,2.61],
 ['Zubenelgenubi',14.8479,-16.042,2.75],['Yed Prior',16.2393,-3.694,2.73],
 ['Cebalrai',17.7243,4.567,2.76], ['Enif',21.7364,9.875,2.39],
 ['Tarazed',19.7709,10.613,2.72], ['Sadalsuud',21.5260,-5.571,2.90],
 ['Deneb Algedi',21.7840,-16.127,2.85],['Rasalgethi',17.2443,14.390,3.08],
];

/* ===========================================================================
   PLANETS — Standish (JPL) approximate orbital elements, valid 1800–2050.
   [a, e, I, L, longPeri, longNode] at J2000 plus per-century rates.
   Solved with Kepler, converted heliocentric → geocentric → RA/Dec.
   Accurate to a few arcminutes, which is far below what this renders at.
   =========================================================================== */
export const PLANETS: Record<string, OrbitalElements> = {
  //          a            e           I          L            ϖ            Ω
  Mercury: [[ 0.38709927, 0.20563593,  7.00497902, 252.25032350,  77.45779628,  48.33076593],
            [ 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081], -0.4],
  Venus:   [[ 0.72333566, 0.00677672,  3.39467605, 181.97909950, 131.60246718,  76.67984255],
            [ 0.00000390,-0.00004107, -0.00078890,  58517.81538729, 0.00268329, -0.27769418], -4.1],
  Mars:    [[ 1.52371034, 0.09339410,  1.84969142,  -4.55343205, -23.94362959,  49.55953891],
            [ 0.00001847, 0.00007882, -0.00813131,  19140.30268499, 0.44441088, -0.29257343],  0.7],
  Jupiter: [[ 5.20288700, 0.04838624,  1.30439695,  34.39644051,  14.72847983, 100.47390909],
            [-0.00011607,-0.00013253, -0.00183714,   3034.74612775, 0.21252668,  0.20469106], -2.2],
  Saturn:  [[ 9.53667594, 0.05386179,  2.48599187,  49.95424423,  92.59887831, 113.66242448],
            [-0.00125060,-0.00050991,  0.00193609,   1222.49362201,-0.41897216, -0.28867794],  0.5],
};
export const EARTH: OrbitalElements = [[ 1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
               [ 0.00000562,-0.00004392, -0.01294668,  35999.37244981, 0.32327364, 0.0]];

/* Approximate distances in light years for the catalogue (Hipparcos/Gaia-era
   values, rounded). Used for the real 3-D separation readout when two objects
   are connected. */
export const LY: Record<string, number> = {
 'Sirius':8.6,'Canopus':310,'Rigil Kent.':4.4,'Arcturus':36.7,'Vega':25,'Capella':42.9,
 'Rigel':860,'Procyon':11.5,'Achernar':139,'Betelgeuse':548,'Hadar':390,'Altair':16.7,
 'Acrux':320,'Aldebaran':65,'Spica':250,'Antares':550,'Pollux':33.8,'Fomalhaut':25.1,
 'Deneb':2615,'Mimosa':280,'Regulus':79,'Adhara':430,'Castor':51,'Shaula':570,
 'Gacrux':88,'Bellatrix':250,'Elnath':134,'Miaplacidus':113,'Alnilam':2000,'Alnair':101,
 'Alnitak':1260,'Alioth':81,'Dubhe':123,'Mirfak':510,'Wezen':1600,'Kaus Aus.':143,
 'Alkaid':104,'Sargas':270,'Avior':610,'Menkalinan':81,'Atria':391,'Alhena':109,
 'Peacock':179,'Polaris':433,'Mirzam':500,'Alphard':177,'Hamal':66,'Diphda':96,
 'Nunki':228,'Saiph':650,'Menkent':61,'Algieba':130,'Mintaka':1200,'Mizar':83,
 'Schedar':228,'Caph':55,'Merak':79,'Phecda':84,'Ruchbah':99,'Megrez':58,
 'Gamma Cas':550,'Segin':410,'Delta Cru':345,'Sadr':1800,'Gienah Cyg':72,'Albireo':430,
 'Delta Cyg':165,'Dschubba':400,'Acrab':400,'Epsilon Sco':65,'Denebola':36,'Zosma':58,
 'Alphecca':75,'Rasalhague':48,'Alpheratz':97,'Mirach':197,'Almach':350,'Markab':133,
 'Scheat':196,'Algenib':470,'Kochab':131,'Eltanin':154,'Alderamin':49,'Sabik':88,
 'Izar':202,'Muphrid':37,'Unukalhai':74,'Zubeneschamali':185,'Zubenelgenubi':76,
 'Yed Prior':171,'Cebalrai':82,'Enif':690,'Tarazed':395,'Sadalsuud':540,
 'Deneb Algedi':39,'Rasalgethi':360,
};
export const AU_KM = 149597870.7, LY_KM = 9.4607e12;

/* real constellation figures — hovering any segment names the figure */
export const FIGURES: Array<[string, Array<[string, string]>]> = [
  ['Orion',[['Betelgeuse','Bellatrix'],['Bellatrix','Mintaka'],['Mintaka','Alnilam'],
            ['Alnilam','Alnitak'],['Alnitak','Betelgeuse'],['Mintaka','Rigel'],['Alnitak','Saiph']]],
  ['Ursa Major',[['Dubhe','Merak'],['Merak','Phecda'],['Phecda','Megrez'],['Megrez','Dubhe'],
            ['Megrez','Alioth'],['Alioth','Mizar'],['Mizar','Alkaid']]],
  ['Cassiopeia',[['Caph','Schedar'],['Schedar','Gamma Cas'],['Gamma Cas','Ruchbah'],['Ruchbah','Segin']]],
  ['Crux',[['Acrux','Gacrux'],['Mimosa','Delta Cru']]],
  ['Cygnus',[['Deneb','Sadr'],['Sadr','Albireo'],['Sadr','Gienah Cyg'],['Sadr','Delta Cyg']]],
  ['Canis Major',[['Sirius','Mirzam'],['Sirius','Wezen'],['Wezen','Adhara'],['Adhara','Mirzam']]],
  ['Scorpius',[['Acrab','Dschubba'],['Dschubba','Antares'],['Antares','Epsilon Sco'],
            ['Epsilon Sco','Sargas'],['Sargas','Shaula']]],
  ['Gemini',[['Castor','Pollux'],['Pollux','Alhena']]],
  ['Leo',[['Regulus','Algieba'],['Algieba','Zosma'],['Zosma','Denebola']]],
  ['Centaurus',[['Rigil Kent.','Hadar'],['Hadar','Menkent']]],
  ['Carina',[['Canopus','Avior'],['Avior','Miaplacidus']]],
  ['Andromeda',[['Alpheratz','Mirach'],['Mirach','Almach']]],
  ['Pegasus',[['Markab','Scheat'],['Scheat','Alpheratz'],['Alpheratz','Algenib'],['Algenib','Markab']]],
  ['Taurus',[['Aldebaran','Elnath']]],
];
