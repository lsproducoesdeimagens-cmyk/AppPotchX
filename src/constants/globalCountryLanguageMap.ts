export interface CountryLanguage {
  code: string; // ISO 3166-1 alpha-2
  names: string[]; // nomes do país em múltiplos idiomas
  language: string; // idioma principal (ISO 639-1)
}

export const GLOBAL_COUNTRY_LANGUAGE_MAP: CountryLanguage[] = [
  {
    code: "AF",
    names: ["afghanistan", "afeganistao", "afganistan"],
    language: "fa",
  },
  { code: "AL", names: ["albania", "albania", "albania"], language: "sq" },
  {
    code: "DZ",
    names: ["algeria", "algerie", "argelia", "argelia"],
    language: "ar",
  },
  { code: "AD", names: ["andorra", "andorra", "andorra"], language: "ca" },
  { code: "AO", names: ["angola", "angola", "angola"], language: "pt" },
  {
    code: "AR",
    names: ["argentina", "argentina", "argentina"],
    language: "es",
  },
  {
    code: "AM",
    names: ["armenia", "hayastan", "armenia", "armenia"],
    language: "ru",
  },
  {
    code: "AU",
    names: ["australia", "australia", "australia"],
    language: "en",
  },
  {
    code: "AT",
    names: ["austria", "osterreich", "austria", "austria"],
    language: "de",
  },
  {
    code: "AZ",
    names: ["azerbaijan", "azerbaycan", "azerbaija", "azerbaiyan"],
    language: "ru",
  },
  { code: "BS", names: ["bahamas", "bahamas", "bahamas"], language: "en" },
  {
    code: "BH",
    names: ["bahrain", "al-bahrayn", "bahrein", "bahrein"],
    language: "ar",
  },
  {
    code: "BD",
    names: ["bangladesh", "bangladesh", "bangladesh"],
    language: "bn",
  },
  { code: "BB", names: ["barbados", "barbados", "barbados"], language: "en" },
  {
    code: "BY",
    names: ["belarus", "byelarus", "bielorrussia", "bielorrusia"],
    language: "be",
  },
  {
    code: "BE",
    names: ["belgium", "belgie", "belgique", "belgica", "belgica"],
    language: "nl",
  },
  { code: "BZ", names: ["belize", "belize", "belize"], language: "en" },
  { code: "BJ", names: ["benin", "benim", "benin"], language: "fr" },
  {
    code: "BT",
    names: ["bhutan", "druk yul", "butao", "butan"],
    language: "dz",
  },
  { code: "BO", names: ["bolivia", "bolivia", "bolivia"], language: "es" },
  {
    code: "BA",
    names: [
      "bosnia and herzegovina",
      "bosnia e herzegovina",
      "bosnia y herzegovina",
    ],
    language: "hr",
  },
  { code: "BW", names: ["botswana", "botsuana", "botsuana"], language: "en" },
  {
    code: "BR",
    names: ["brazil", "brasil", "brasil", "brasil"],
    language: "pt",
  },
  { code: "BN", names: ["brunei", "brunei", "brunei"], language: "ms" },
  { code: "BG", names: ["bulgaria", "bulgaria", "bulgaria"], language: "bg" },
  {
    code: "BF",
    names: ["burkina faso", "burquina faso", "burquina faso"],
    language: "fr",
  },
  { code: "BI", names: ["burundi", "burundi", "burundi"], language: "fr" },
  {
    code: "KH",
    names: ["cambodia", "kampuchea", "camboja", "camboya"],
    language: "km",
  },
  {
    code: "CM",
    names: ["cameroon", "cameroun", "camaroes", "camerun"],
    language: "fr",
  },
  { code: "CA", names: ["canada", "canada", "canada"], language: "en" },
  {
    code: "CV",
    names: ["cape verde", "cabo verde", "cabo verde"],
    language: "pt",
  },
  {
    code: "CF",
    names: [
      "central african republic",
      "republica centro-africana",
      "republica centroafricana",
    ],
    language: "fr",
  },
  { code: "TD", names: ["chad", "tchad", "chade", "chad"], language: "fr" },
  { code: "CL", names: ["chile", "chile", "chile"], language: "es" },
  {
    code: "CN",
    names: ["china", "zhongguo", "china", "china"],
    language: "zh",
  },
  { code: "CO", names: ["colombia", "colombia", "colombia"], language: "es" },
  { code: "KM", names: ["comoros", "comores", "comores"], language: "ar" },
  { code: "CG", names: ["congo", "congo", "congo"], language: "fr" },
  {
    code: "CR",
    names: ["costa rica", "costa rica", "costa rica"],
    language: "es",
  },
  {
    code: "HR",
    names: ["croatia", "hrvatska", "croacia", "croacia"],
    language: "hr",
  },
  { code: "CU", names: ["cuba", "cuba", "cuba"], language: "es" },
  {
    code: "CY",
    names: ["cyprus", "kypros", "chipre", "chipre"],
    language: "el",
  },
  {
    code: "CZ",
    names: ["czech republic", "cesko", "republica tcheca", "republica checa"],
    language: "cs",
  },
  {
    code: "DK",
    names: ["denmark", "danmark", "dinamarca", "dinamarca"],
    language: "da",
  },
  { code: "DJ", names: ["djibouti", "djibuti", "yibuti"], language: "ar" },
  { code: "DM", names: ["dominica", "dominica", "dominica"], language: "en" },
  {
    code: "DO",
    names: [
      "dominican republic",
      "republica dominicana",
      "republica dominicana",
    ],
    language: "es",
  },
  { code: "EC", names: ["ecuador", "equador", "ecuador"], language: "es" },
  { code: "EG", names: ["egypt", "misr", "egito", "egipto"], language: "ar" },
  {
    code: "SV",
    names: ["el salvador", "el salvador", "el salvador"],
    language: "es",
  },
  {
    code: "GQ",
    names: ["equatorial guinea", "guine equatorial", "guinea ecuatorial"],
    language: "es",
  },
  { code: "ER", names: ["eritrea", "eritrea", "eritrea"], language: "ti" },
  {
    code: "EE",
    names: ["estonia", "eesti", "estonia", "estonia"],
    language: "et",
  },
  {
    code: "ET",
    names: ["ethiopia", "itvopya", "etiopia", "etiopia"],
    language: "am",
  },
  { code: "FJ", names: ["fiji", "fiji", "fiyi"], language: "en" },
  {
    code: "FI",
    names: ["finland", "suomi", "finlandia", "finlandia"],
    language: "fi",
  },
  {
    code: "FR",
    names: ["france", "france", "franca", "francia"],
    language: "fr",
  },
  { code: "GA", names: ["gabon", "gabao", "gabon"], language: "fr" },
  { code: "GM", names: ["gambia", "gambia", "gambia"], language: "en" },
  {
    code: "GE",
    names: ["georgia", "sakartvelo", "georgia", "georgia"],
    language: "ru",
  },
  {
    code: "DE",
    names: ["germany", "deutschland", "alemanha", "alemania"],
    language: "de",
  },
  { code: "GH", names: ["ghana", "gana", "ghana"], language: "en" },
  {
    code: "GR",
    names: ["greece", "hellas", "grecia", "grecia"],
    language: "el",
  },
  { code: "GD", names: ["grenada", "granada", "granada"], language: "en" },
  {
    code: "GT",
    names: ["guatemala", "guatemala", "guatemala"],
    language: "es",
  },
  {
    code: "GN",
    names: ["guinea", "guinee", "guine", "guinea"],
    language: "fr",
  },
  {
    code: "GW",
    names: ["guinea-bissau", "guine-bissau", "guinea-bisau"],
    language: "pt",
  },
  { code: "GY", names: ["guyana", "guiana", "guyana"], language: "en" },
  { code: "HT", names: ["haiti", "haiti", "haiti"], language: "fr" },
  { code: "HN", names: ["honduras", "honduras", "honduras"], language: "es" },
  {
    code: "HK",
    names: ["hong kong", "hong kong", "hong kong"],
    language: "zh",
  },
  {
    code: "HU",
    names: ["hungary", "magyarorszag", "hungria", "hungria"],
    language: "hu",
  },
  {
    code: "IS",
    names: ["iceland", "island", "islandia", "islandia"],
    language: "is",
  },
  { code: "IN", names: ["india", "bharat", "india", "india"], language: "hi" },
  {
    code: "ID",
    names: ["indonesia", "indonesia", "indonesia"],
    language: "id",
  },
  { code: "IR", names: ["iran", "iran", "ira", "iran"], language: "fa" },
  { code: "IQ", names: ["iraq", "al-iraq", "iraque", "irak"], language: "ar" },
  {
    code: "IE",
    names: ["ireland", "eire", "irlanda", "irlanda"],
    language: "en",
  },
  {
    code: "IL",
    names: ["israel", "yisrael", "israel", "israel"],
    language: "he",
  },
  {
    code: "IT",
    names: ["italy", "italia", "italia", "italia"],
    language: "it",
  },
  { code: "JM", names: ["jamaica", "jamaica", "jamaica"], language: "en" },
  { code: "JP", names: ["japan", "nihon", "japao", "japon"], language: "ja" },
  {
    code: "JO",
    names: ["jordan", "al-urdun", "jordania", "jordania"],
    language: "ar",
  },
  {
    code: "KZ",
    names: ["kazakhstan", "qazaqstan", "cazaquistao", "kazajistan"],
    language: "ru",
  },
  { code: "KE", names: ["kenya", "kenya", "quenia", "kenia"], language: "sw" },
  { code: "KI", names: ["kiribati", "kiribati", "kiribati"], language: "en" },
  {
    code: "KP",
    names: ["north korea", "choson", "coreia do norte", "corea del norte"],
    language: "ko",
  },
  {
    code: "KR",
    names: ["south korea", "hanguk", "coreia do sul", "corea del sur"],
    language: "ko",
  },
  {
    code: "KW",
    names: ["kuwait", "al-kuwayt", "kuwait", "kuwait"],
    language: "ar",
  },
  {
    code: "KG",
    names: ["kyrgyzstan", "kyrgyzstan", "quirguistao", "kirguistan"],
    language: "ky",
  },
  { code: "LA", names: ["laos", "lao", "laos", "laos"], language: "lo" },
  {
    code: "LV",
    names: ["latvia", "latvija", "letonia", "letonia"],
    language: "lv",
  },
  {
    code: "LB",
    names: ["lebanon", "lubnan", "libano", "libano"],
    language: "ar",
  },
  { code: "LS", names: ["lesotho", "lesoto", "lesoto"], language: "en" },
  { code: "LR", names: ["liberia", "liberia", "liberia"], language: "en" },
  { code: "LY", names: ["libya", "libiya", "libia", "libia"], language: "ar" },
  {
    code: "LI",
    names: ["liechtenstein", "liechtenstein", "liechtenstein"],
    language: "de",
  },
  {
    code: "LT",
    names: ["lithuania", "lietuva", "lituania", "lituania"],
    language: "lt",
  },
  {
    code: "LU",
    names: ["luxembourg", "letzebuerg", "luxemburgo", "luxemburgo"],
    language: "lb",
  },
  {
    code: "MG",
    names: ["madagascar", "madagasikara", "madagascar", "madagascar"],
    language: "mg",
  },
  { code: "MW", names: ["malawi", "malaui", "malaui"], language: "en" },
  {
    code: "MY",
    names: ["malaysia", "malaysia", "malasia", "malasia"],
    language: "ms",
  },
  {
    code: "MV",
    names: ["maldives", "dhivehi raajje", "maldivas", "maldivas"],
    language: "dv",
  },
  { code: "ML", names: ["mali", "mali", "mali"], language: "fr" },
  { code: "MT", names: ["malta", "malta", "malta"], language: "mt" },
  {
    code: "MH",
    names: ["marshall islands", "ilhas marshall", "islas marshall"],
    language: "en",
  },
  {
    code: "MR",
    names: ["mauritania", "muritaniya", "mauritania", "mauritania"],
    language: "ar",
  },
  {
    code: "MU",
    names: ["mauritius", "maurice", "mauricio", "mauricio"],
    language: "en",
  },
  {
    code: "MX",
    names: ["mexico", "mexico", "mexico", "mexico"],
    language: "es",
  },
  {
    code: "FM",
    names: ["micronesia", "micronesia", "micronesia"],
    language: "en",
  },
  {
    code: "MD",
    names: ["moldova", "moldova", "moldavia", "moldavia"],
    language: "ro",
  },
  { code: "MC", names: ["monaco", "monaco", "monaco"], language: "fr" },
  {
    code: "MN",
    names: ["mongolia", "mongol uls", "mongolia", "mongolia"],
    language: "mn",
  },
  {
    code: "ME",
    names: ["montenegro", "crna gora", "montenegro", "montenegro"],
    language: "sr",
  },
  {
    code: "MA",
    names: ["morocco", "al-maghrib", "marrocos", "marruecos"],
    language: "ar",
  },
  {
    code: "MZ",
    names: ["mozambique", "mocambique", "mocambique", "mozambique"],
    language: "pt",
  },
  {
    code: "MM",
    names: ["myanmar", "myanmar", "mianmar", "birmania"],
    language: "my",
  },
  { code: "NA", names: ["namibia", "namibia", "namibia"], language: "en" },
  { code: "NR", names: ["nauru", "nauru", "nauru"], language: "en" },
  { code: "NP", names: ["nepal", "nepal", "nepal"], language: "hi" },
  {
    code: "NL",
    names: [
      "netherlands",
      "nederland",
      "holanda",
      "paises baixos",
      "paises bajos",
    ],
    language: "nl",
  },
  {
    code: "NZ",
    names: ["new zealand", "aotearoa", "nova zelandia", "nueva zelanda"],
    language: "en",
  },
  {
    code: "NI",
    names: ["nicaragua", "nicaragua", "nicaragua"],
    language: "es",
  },
  { code: "NE", names: ["niger", "niger", "niger"], language: "fr" },
  { code: "NG", names: ["nigeria", "nigeria", "nigeria"], language: "en" },
  {
    code: "MK",
    names: [
      "north macedonia",
      "severna makedonija",
      "macedonia do norte",
      "macedonia del norte",
    ],
    language: "mk",
  },
  {
    code: "NO",
    names: ["norway", "norge", "noruega", "noruega"],
    language: "no",
  },
  { code: "OM", names: ["oman", "uman", "oma", "oman"], language: "ar" },
  {
    code: "PK",
    names: ["pakistan", "pakistan", "paquistao", "pakistan"],
    language: "ur",
  },
  { code: "PW", names: ["palau", "palau", "palaos"], language: "en" },
  { code: "PA", names: ["panama", "panama", "panama"], language: "es" },
  {
    code: "PG",
    names: ["papua new guinea", "papua nova guine", "papua nueva guinea"],
    language: "en",
  },
  { code: "PY", names: ["paraguay", "paraguai", "paraguay"], language: "es" },
  { code: "PE", names: ["peru", "peru", "peru"], language: "es" },
  {
    code: "PH",
    names: ["philippines", "pilipinas", "filipinas", "filipinas"],
    language: "tl",
  },
  {
    code: "PL",
    names: ["poland", "polska", "polonia", "polonia"],
    language: "pl",
  },
  { code: "PT", names: ["portugal", "portugal", "portugal"], language: "pt" },
  { code: "QA", names: ["qatar", "qatar", "catar", "catar"], language: "ar" },
  {
    code: "RO",
    names: ["romania", "romania", "romenia", "rumania"],
    language: "ro",
  },
  {
    code: "RU",
    names: ["russia", "rossiya", "russia", "rusia"],
    language: "ru",
  },
  {
    code: "RW",
    names: ["rwanda", "rwanda", "ruanda", "ruanda"],
    language: "rw",
  },
  {
    code: "KN",
    names: [
      "saint kitts and nevis",
      "sao cristovao e nevis",
      "san cristobal y nieves",
    ],
    language: "en",
  },
  {
    code: "LC",
    names: ["saint lucia", "santa lucia", "santa lucia"],
    language: "en",
  },
  {
    code: "VC",
    names: [
      "saint vincent and the grenadines",
      "sao vicente e granadinas",
      "san vicente y las granadinas",
    ],
    language: "en",
  },
  { code: "WS", names: ["samoa", "samoa", "samoa"], language: "sm" },
  {
    code: "SM",
    names: ["san marino", "san marino", "san marino"],
    language: "it",
  },
  {
    code: "ST",
    names: [
      "sao tome and principe",
      "sao tome e principe",
      "santo tome y principe",
    ],
    language: "pt",
  },
  {
    code: "SA",
    names: [
      "saudi arabia",
      "al-arabiyyah as-saudiyyah",
      "arabia saudita",
      "arabia saudi",
    ],
    language: "ar",
  },
  { code: "SN", names: ["senegal", "senegal", "senegal"], language: "fr" },
  {
    code: "RS",
    names: ["serbia", "srbija", "servia", "serbia"],
    language: "sr",
  },
  {
    code: "SC",
    names: ["seychelles", "seychelles", "seicheles", "seychelles"],
    language: "en",
  },
  {
    code: "SL",
    names: ["sierra leone", "serra leoa", "sierra leona"],
    language: "en",
  },
  {
    code: "SG",
    names: ["singapore", "singapura", "singapura", "singapur"],
    language: "en",
  },
  {
    code: "SK",
    names: ["slovakia", "slovensko", "eslovaquia", "eslovaquia"],
    language: "sk",
  },
  {
    code: "SI",
    names: ["slovenia", "slovenija", "eslovenia", "eslovenia"],
    language: "sl",
  },
  {
    code: "SB",
    names: ["solomon islands", "ilhas salomao", "islas salomon"],
    language: "en",
  },
  {
    code: "SO",
    names: ["somalia", "soomaaliya", "somalia", "somalia"],
    language: "ar",
  },
  {
    code: "ZA",
    names: ["south africa", "suid-afrika", "africa do sul", "sudafrica"],
    language: "en",
  },
  {
    code: "SS",
    names: ["south sudan", "sudao do sul", "sudan del sur"],
    language: "en",
  },
  {
    code: "ES",
    names: ["spain", "espana", "espanha", "espana"],
    language: "es",
  },
  {
    code: "LK",
    names: ["sri lanka", "sri lanka", "sri lanka"],
    language: "hi",
  },
  {
    code: "SD",
    names: ["sudan", "as-sudan", "sudao", "sudan"],
    language: "ar",
  },
  { code: "SR", names: ["suriname", "suriname", "surinam"], language: "nl" },
  {
    code: "SZ",
    names: ["eswatini", "swaziland", "esuatini", "suazilandia"],
    language: "en",
  },
  {
    code: "SE",
    names: ["sweden", "sverige", "suecia", "suecia"],
    language: "sv",
  },
  {
    code: "CH",
    names: ["switzerland", "schweiz", "suica", "suiza"],
    language: "de",
  },
  { code: "SY", names: ["syria", "suriyah", "siria", "siria"], language: "ar" },
  { code: "TW", names: ["taiwan", "taiwan", "taiwan"], language: "zh" },
  {
    code: "TJ",
    names: ["tajikistan", "tojikiston", "tadjiquistao", "tayikistan"],
    language: "tg",
  },
  { code: "TZ", names: ["tanzania", "tanzania", "tanzania"], language: "sw" },
  {
    code: "TH",
    names: ["thailand", "prathet thai", "tailandia", "tailandia"],
    language: "th",
  },
  { code: "TG", names: ["togo", "togo", "togo"], language: "fr" },
  { code: "TO", names: ["tonga", "tonga", "tonga"], language: "en" },
  {
    code: "TT",
    names: ["trinidad and tobago", "trinidad e tobago", "trinidad y tobago"],
    language: "en",
  },
  {
    code: "TN",
    names: ["tunisia", "tunis", "tunisia", "tunez"],
    language: "ar",
  },
  {
    code: "TR",
    names: ["turkey", "turkiye", "turquia", "turquia"],
    language: "tr",
  },
  {
    code: "TM",
    names: ["turkmenistan", "turkmenistan", "turcomenistao", "turkmenistan"],
    language: "tk",
  },
  { code: "TV", names: ["tuvalu", "tuvalu", "tuvalu"], language: "en" },
  { code: "UG", names: ["uganda", "uganda", "uganda"], language: "en" },
  {
    code: "UA",
    names: ["ukraine", "ukrayina", "ucrania", "ucrania"],
    language: "ru",
  },
  {
    code: "AE",
    names: [
      "united arab emirates",
      "emirados arabes unidos",
      "emiratos arabes unidos",
    ],
    language: "ar",
  },
  {
    code: "GB",
    names: ["united kingdom", "uk", "reino unido", "reino unido"],
    language: "en",
  },
  {
    code: "US",
    names: ["united states", "usa", "estados unidos", "estados unidos"],
    language: "en",
  },
  { code: "UY", names: ["uruguay", "uruguai", "uruguay"], language: "es" },
  {
    code: "UZ",
    names: ["uzbekistan", "o'zbekiston", "uzbequistao", "uzbekistan"],
    language: "ru",
  },
  { code: "VU", names: ["vanuatu", "vanuatu", "vanuatu"], language: "bi" },
  {
    code: "VA",
    names: ["vatican city", "vaticano", "vaticano"],
    language: "it",
  },
  {
    code: "VE",
    names: ["venezuela", "venezuela", "venezuela"],
    language: "es",
  },
  {
    code: "VN",
    names: ["vietnam", "viet nam", "vietna", "vietnam"],
    language: "vi",
  },
  {
    code: "YE",
    names: ["yemen", "al-yaman", "iemen", "yemen"],
    language: "ar",
  },
  { code: "ZM", names: ["zambia", "zambia", "zambia"], language: "en" },
  { code: "ZW", names: ["zimbabwe", "zimbabue", "zimbabue"], language: "en" },
  {
    code: "IL",
    names: ["israel", "yisrael", "israel", "israel"],
    language: "he",
  },
  {
    code: "SA",
    names: [
      "saudi arabia",
      "al-arabiyyah as-saudiyyah",
      "arabia saudita",
      "arabia saudi",
    ],
    language: "ar",
  },
  {
    code: "AE",
    names: [
      "united arab emirates",
      "emirados arabes unidos",
      "emiratos arabes unidos",
    ],
    language: "ar",
  },
  {
    code: "TR",
    names: ["turkey", "turkiye", "turquia", "turquia"],
    language: "tr",
  },
  {
    code: "RU",
    names: ["russia", "rossiya", "russia", "rusia"],
    language: "ru",
  },
  {
    code: "CN",
    names: ["china", "zhongguo", "china", "china"],
    language: "zh",
  },
  { code: "JP", names: ["japan", "nihon", "japao", "japon"], language: "ja" },
  {
    code: "KR",
    names: ["south korea", "hanguk", "coreia do sul", "corea del sur"],
    language: "ko",
  },
  { code: "IN", names: ["india", "bharat", "india", "india"], language: "hi" },
  {
    code: "TH",
    names: ["thailand", "prathet thai", "tailandia", "tailandia"],
    language: "th",
  },
  {
    code: "VN",
    names: ["vietnam", "viet nam", "vietna", "vietnam"],
    language: "vi",
  },
  {
    code: "ID",
    names: ["indonesia", "indonesia", "indonesia"],
    language: "id",
  },
  {
    code: "MY",
    names: ["malaysia", "malaysia", "malasia", "malasia"],
    language: "ms",
  },
  {
    code: "SG",
    names: ["singapore", "singapura", "singapura", "singapur"],
    language: "en",
  },
  {
    code: "PH",
    names: ["philippines", "pilipinas", "filipinas", "filipinas"],
    language: "tl",
  },
  { code: "EG", names: ["egypt", "misr", "egito", "egipto"], language: "ar" },
  {
    code: "MA",
    names: ["morocco", "al-maghrib", "marrocos", "marruecos"],
    language: "ar",
  },
  {
    code: "ZA",
    names: ["south africa", "suid-afrika", "africa do sul", "sudafrica"],
    language: "en",
  },
  { code: "NG", names: ["nigeria", "nigeria", "nigeria"], language: "en" },
  { code: "KE", names: ["kenya", "kenya", "quenia", "kenia"], language: "sw" },
];

export function detectLanguageFromCountry(input: string): string {
  if (!input) return "en";

  const normalized = input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, ""); // Remove caracteres especiais

  const supportedLanguages = [
    "pt",
    "en",
    "es",
    "fr",
    "it",
    "de",
    "ru",
    "ar",
    "zh",
    "hi",
    "fa",
    "ja",
    "ko",
    "th",
    "vi",
    "pl",
    "nl",
  ];

  for (const country of GLOBAL_COUNTRY_LANGUAGE_MAP) {
    if (country.names.includes(normalized)) {
      // Se o idioma do país for suportado, retorna ele. Caso contrário, retorna 'en' (padrão internacional)
      return supportedLanguages.includes(country.language)
        ? country.language
        : "en";
    }
  }

  // Fallback para mapeamento manual se não encontrar no array names (ex: "eua")
  const manualMap: Record<string, string> = {
    eua: "en",
    usa: "en",
    "reino unido": "en",
    uk: "en",
    australia: "en",
    "nova zelandia": "en",
    canada: "en",
    holanda: "nl",
    "paises baixos": "nl",
    japao: "en",
    china: "en",
    tailandia: "en",
    india: "en",
    egito: "en",
    marrocos: "en",
    "africa do sul": "en",
    brasil: "pt",
    portugal: "pt",
    angola: "pt",
    mocambique: "pt",
    "cabo verde": "pt",
    "guine-bissau": "pt",
    "sao tome e principe": "pt",
    "timor-leste": "pt",
    argentina: "es",
    chile: "es",
    mexico: "es",
    colombia: "es",
    peru: "es",
    espanha: "es",
    franca: "fr",
    italia: "it",
    alemanha: "de",
    suica: "de",
  };

  const manualLang = manualMap[normalized];
  if (manualLang) return manualLang;

  return "en";
}
