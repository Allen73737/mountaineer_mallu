export const hashPeakName = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

export const defaultPool = [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560&auto=format&fit=crop" // White snow mountain day
];

export const snowyPool = [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560&auto=format&fit=crop" // White snow mountain day
];

export const nightPool = [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2560&auto=format&fit=crop" // Violet starlight milky way mountain
];

export interface PeakData {
    name: string;
    elevation: string;
    location: string;
    lat: number;
    lon: number;
    images?: {
        default: string;
        snowy: string;
        night: string;
    }
}

export const peaksData: PeakData[] = [
    {
        name: "Mont Blanc",
        elevation: "4,809m",
        location: "French/Italian Alps",
        lat: 45.8326,
        lon: 6.8652
    },
    {
        name: "Matterhorn",
        elevation: "4,478m",
        location: "Swiss/Italian Alps",
        lat: 45.9763,
        lon: 7.6586
    },
    {
        name: "Eiger",
        elevation: "3,967m",
        location: "Bernese Alps, CH",
        lat: 46.5775,
        lon: 8.0055
    },
    {
        name: "Zugspitze",
        elevation: "2,962m",
        location: "Bavarian Alps, DE",
        lat: 47.4210,
        lon: 10.9854
    },

    // Germany Expanded
    { name: "Watzmann", elevation: "2,713m", location: "Bavarian Alps, DE", lat: 47.5540, lon: 12.9230 },
    { name: "Hochwanner", elevation: "2,744m", location: "Wetterstein, DE", lat: 47.3941, lon: 11.0201 },
    { name: "Schneefernerkopf", elevation: "2,875m", location: "Wetterstein, DE", lat: 47.4111, lon: 10.9702 },
    { name: "Alpspitze", elevation: "2,628m", location: "Bavarian Alps, DE", lat: 47.4299, lon: 11.0475 },
    { name: "Hochkalter", elevation: "2,607m", location: "Berchtesgaden Alps, DE", lat: 47.5700, lon: 12.8660 },
    { name: "Nebelhorn", elevation: "2,224m", location: "Allgäu Alps, DE", lat: 47.4225, lon: 10.3444 },
    { name: "Feldberg", elevation: "1,493m", location: "Black Forest, DE", lat: 47.8741, lon: 8.0050 },
    { name: "Brocken", elevation: "1,141m", location: "Harz, DE", lat: 51.7990, lon: 10.6150 },
    { name: "Großer Arber", elevation: "1,456m", location: "Bavarian Forest, DE", lat: 49.1126, lon: 13.1360 },
    { name: "Fichtelberg", elevation: "1,215m", location: "Ore Mountains, DE", lat: 50.4287, lon: 12.9542 },
    { name: "Zugspitze Platt", elevation: "2,600m", location: "Bavarian Alps, DE", lat: 47.4128, lon: 10.9796 },
    { name: "Krottenkopf", elevation: "2,086m", location: "Ester Mountains, DE", lat: 47.5450, lon: 11.1925 },
    { name: "Säuling", elevation: "2,042m", location: "Ammergau Alps, DE", lat: 47.5342, lon: 10.7558 },
    { name: "Tegelberg", elevation: "1,881m", location: "Ammergau Alps, DE", lat: 47.5681, lon: 10.7769 },

    // Alps Expanded (CH, IT, FR, AT, SI, LI)
    { name: "Piz Bernina", elevation: "4,049m", location: "Bernina Range, CH/IT", lat: 46.3822, lon: 9.9080 },
    { name: "Lyskamm", elevation: "4,527m", location: "Pennine Alps, CH/IT", lat: 45.9221, lon: 7.8347 },
    { name: "Täschhorn", elevation: "4,491m", location: "Pennine Alps, CH", lat: 46.0850, lon: 7.8622 },
    { name: "Dent Blanche", elevation: "4,357m", location: "Pennine Alps, CH", lat: 46.0333, lon: 7.6144 },
    { name: "Nadelhorn", elevation: "4,327m", location: "Pennine Alps, CH", lat: 46.1130, lon: 7.8622 },
    { name: "Grand Combin", elevation: "4,314m", location: "Pennine Alps, CH", lat: 45.9380, lon: 7.2994 },
    { name: "Finsteraarhorn", elevation: "4,274m", location: "Bernese Alps, CH", lat: 46.5372, lon: 8.1261 },
    { name: "Aletschhorn", elevation: "4,193m", location: "Bernese Alps, CH", lat: 46.4653, lon: 7.9942 },
    { name: "Mönch", elevation: "4,107m", location: "Bernese Alps, CH", lat: 46.5583, lon: 7.9818 },
    { name: "Schreckhorn", elevation: "4,078m", location: "Bernese Alps, CH", lat: 46.5891, lon: 8.1180 },
    { name: "Gross Fiescherhorn", elevation: "4,049m", location: "Bernese Alps, CH", lat: 46.5492, lon: 8.0583 },
    { name: "Dom", elevation: "4,545m", location: "Pennine Alps, CH", lat: 46.0939, lon: 7.8588 },
    { name: "Weisshorn", elevation: "4,506m", location: "Pennine Alps, CH", lat: 46.1017, lon: 7.7125 },
    { name: "Jungfrau", elevation: "4,158m", location: "Bernese Alps, CH", lat: 46.5367, lon: 7.9625 },

    // Austria
    { name: "Grossglockner", elevation: "3,798m", location: "Hohe Tauern, AT", lat: 47.0744, lon: 12.6939 },
    { name: "Wildspitze", elevation: "3,770m", location: "Ötztal Alps, AT", lat: 46.8850, lon: 10.8669 },
    { name: "Grossvenediger", elevation: "3,657m", location: "Hohe Tauern, AT", lat: 47.1089, lon: 12.3364 },
    { name: "Hinterer Brochkogel", elevation: "3,628m", location: "Ötztal Alps, AT", lat: 46.8886, lon: 10.8503 },
    { name: "Hintere Schwärze", elevation: "3,624m", location: "Ötztal Alps, AT", lat: 46.7725, lon: 10.9136 },

    // Italy
    { name: "Monte Rosa (Dufourspitze)", elevation: "4,634m", location: "Pennine Alps, IT/CH", lat: 45.9369, lon: 7.8672 },
    { name: "Ortler", elevation: "3,905m", location: "Ortler Alps, IT", lat: 46.5086, lon: 10.5439 },
    { name: "Marmolada", elevation: "3,343m", location: "Dolomites, IT", lat: 46.4350, lon: 11.8594 },
    { name: "Gran Paradiso", elevation: "4,061m", location: "Graian Alps, IT", lat: 45.5181, lon: 7.2667 },
    { name: "Monte Viso", elevation: "3,841m", location: "Cottian Alps, IT", lat: 44.6675, lon: 7.0911 },
    { name: "Gran Zebrù", elevation: "3,851m", location: "Ortler Alps, IT", lat: 46.4864, lon: 10.5519 },

    // France
    { name: "Barre des Écrins", elevation: "4,102m", location: "Dauphiné Alps, FR", lat: 44.9225, lon: 6.3592 },
    { name: "Aiguille du Midi", elevation: "3,842m", location: "Mont Blanc Massif, FR", lat: 45.8794, lon: 6.8872 },
    { name: "La Meije", elevation: "3,984m", location: "Dauphiné Alps, FR", lat: 45.0042, lon: 6.3131 },
    { name: "Mont Pelvoux", elevation: "3,946m", location: "Dauphiné Alps, FR", lat: 44.8817, lon: 6.3931 },

    // Slovenia & Liechtenstein
    { name: "Triglav", elevation: "2,864m", location: "Julian Alps, SI", lat: 46.3783, lon: 13.8361 },
    { name: "Grauspitz", elevation: "2,599m", location: "Rätikon, LI/CH", lat: 47.0525, lon: 9.5817 }
];
