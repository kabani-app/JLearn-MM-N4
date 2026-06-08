export interface KanjiEntry {
  id: number;
  kanji: string;
  onyomi: string;      // On reading
  kunyomi: string;     // Kun reading
  meaning_en: string;  // English meaning
  meaning_mm: string;  // Myanmar/Burmese meaning
  example_word: string;    // Example Japanese word
  example_reading: string; // Example word reading
  example_meaning: string; // Example word Myanmar meaning
  strokes: number;
  unit: number;
}

export const kanjiData: KanjiEntry[] = [
  {
    id: 1,
    kanji: "悪",
    onyomi: "アク",
    kunyomi: "わる",
    meaning_en: "bad, evil",
    meaning_mm: "ဆိုးညံ့သော",
    example_word: "悪い",
    example_reading: "わるい",
    example_meaning: "ဆိုးသော",
    strokes: 11,
    unit: 1
  },
  {
    id: 2,
    kanji: "安",
    onyomi: "アン",
    kunyomi: "やす",
    meaning_en: "cheap, peace, safe",
    meaning_mm: "သက်သာသော၊ အေးချမ်းသော",
    example_word: "安心",
    example_reading: "あんしん",
    example_meaning: "စိတ်အေးချမ်းသာမှု",
    strokes: 6,
    unit: 1
  },
  {
    id: 3,
    kanji: "暗",
    onyomi: "アン",
    kunyomi: "くら",
    meaning_en: "dark",
    meaning_mm: "မှောင်မိုက်သော",
    example_word: "暗い",
    example_reading: "くらい",
    example_meaning: "မှောင်သော",
    strokes: 13,
    unit: 1
  },
  {
    id: 4,
    kanji: "医",
    onyomi: "イ",
    kunyomi: "-",
    meaning_en: "doctor, medicine",
    meaning_mm: "ဆရာဝန်၊ ဆေးကုသမှု",
    example_word: "医者",
    example_reading: "いしゃ",
    example_meaning: "ဆရာဝန်",
    strokes: 7,
    unit: 1
  },
  {
    id: 5,
    kanji: "意",
    onyomi: "イ",
    kunyomi: "-",
    meaning_en: "mind, meaning, intention",
    meaning_mm: "စိတ်ကူး၊ ရည်ရွယ်ချက်",
    example_word: "意見",
    example_reading: "いけん",
    example_meaning: "သဘောထားအမြင်",
    strokes: 13,
    unit: 1
  },
  {
    id: 6,
    kanji: "育",
    onyomi: "イク",
    kunyomi: "そだ",
    meaning_en: "raise, grow up",
    meaning_mm: "ကြီးပြင်းစေသည်၊ မွေးမြူသည်",
    example_word: "育てる",
    example_reading: "そだてる",
    example_meaning: "ပျိုးထောင်သည်",
    strokes: 8,
    unit: 1
  },
  {
    id: 7,
    kanji: "員",
    onyomi: "イン",
    kunyomi: "-",
    meaning_en: "member",
    meaning_mm: "အဖွဲ့ဝင်၊ ဝန်ထမ်း",
    example_word: "社員",
    example_reading: "しゃいん",
    example_meaning: "ကုမ္ပဏီဝန်ထမ်း",
    strokes: 10,
    unit: 1
  },
  {
    id: 8,
    kanji: "引",
    onyomi: "イン",
    kunyomi: "ひ",
    meaning_en: "pull",
    meaning_mm: "ဆွဲသည်",
    example_word: "引き出し",
    example_reading: "ひきだし",
    example_meaning: "အံဆွဲ",
    strokes: 4,
    unit: 1
  },
  {
    id: 9,
    kanji: "院",
    onyomi: "イン",
    kunyomi: "-",
    meaning_en: "institution, temple",
    meaning_mm: "ကျောင်း၊ ဌာန၊ အဖွဲ့အစည်း",
    example_word: "病院",
    example_reading: "びょういん",
    example_meaning: "ဆေးရုံ",
    strokes: 10,
    unit: 2
  },
  {
    id: 10,
    kanji: "運",
    onyomi: "ウン",
    kunyomi: "はこ",
    meaning_en: "carry, luck, transport",
    meaning_mm: "သယ်ဆောင်သည်၊ ကံတရား",
    example_word: "運転",
    example_reading: "うんてん",
    example_meaning: "မောင်းနှင်ခြင်း",
    strokes: 12,
    unit: 2
  },
  {
    id: 11,
    kanji: "栄",
    onyomi: "エイ",
    kunyomi: "さか",
    meaning_en: "flourish, prosperity",
    meaning_mm: "စည်ပင်ဝပြောခြင်း",
    example_word: "栄養",
    example_reading: "えいよう",
    example_meaning: "အာဟာရ",
    strokes: 9,
    unit: 2
  },
  {
    id: 12,
    kanji: "駅",
    onyomi: "エキ",
    kunyomi: "-",
    meaning_en: "station",
    meaning_mm: "ရထားဘူတာ",
    example_word: "駅員",
    example_reading: "えきいん",
    example_meaning: "ဘူတာရုံဝန်ထမ်း",
    strokes: 14,
    unit: 2
  },
  {
    id: 13,
    kanji: "円",
    onyomi: "エン",
    kunyomi: "まる",
    meaning_en: "circle, yen",
    meaning_mm: "ဝိုင်းစက်သော၊ ယန်းငွေ",
    example_word: "円い",
    example_reading: "まるい",
    example_meaning: "ဝိုင်းသော",
    strokes: 4,
    unit: 2
  },
  {
    id: 14,
    kanji: "園",
    onyomi: "エン",
    kunyomi: "その",
    meaning_en: "garden, park",
    meaning_mm: "ဥယျာဉ်၊ ပန်းခြံ",
    example_word: "公園",
    example_reading: "こうえん",
    example_meaning: "ပန်းခြံ",
    strokes: 13,
    unit: 2
  },
  {
    id: 15,
    kanji: "遠",
    onyomi: "エン",
    kunyomi: "とお",
    meaning_en: "far, distant",
    meaning_mm: "ဝေးလံသော",
    example_word: "遠い",
    example_reading: "とおい",
    example_meaning: "ဝေးသော",
    strokes: 13,
    unit: 2
  },
  {
    id: 16,
    kanji: "横",
    onyomi: "オウ",
    kunyomi: "よこ",
    meaning_en: "side, horizontal",
    meaning_mm: "ဘေးတိုက်၊ ဘေးဖက်",
    example_word: "横断",
    example_reading: "おうだん",
    example_meaning: "လမ်းဖြတ်ကူးခြင်း",
    strokes: 15,
    unit: 3
  },
  {
    id: 17,
    kanji: "屋",
    onyomi: "オク",
    kunyomi: "や",
    meaning_en: "house, shop",
    meaning_mm: "အိမ်၊ ဆိုင်ခန်း",
    example_word: "屋上",
    example_reading: "おくじょう",
    example_meaning: "အမိုးပေါ်ထပ်",
    strokes: 9,
    unit: 3
  },
  {
    id: 18,
    kanji: "温",
    onyomi: "オン",
    kunyomi: "あたた",
    meaning_en: "warm",
    meaning_mm: "နွေးထွေးသော",
    example_word: "温度",
    example_reading: "おんど",
    example_meaning: "အပူချိန်",
    strokes: 12,
    unit: 3
  },
  {
    id: 19,
    kanji: "音",
    onyomi: "オン",
    kunyomi: "おと",
    meaning_en: "sound",
    meaning_mm: "အသံ",
    example_word: "音楽",
    example_reading: "おんがく",
    example_meaning: "ဂီတသီချင်း",
    strokes: 9,
    unit: 3
  },
  {
    id: 20,
    kanji: "科",
    onyomi: "カ",
    kunyomi: "-",
    meaning_en: "department, course, science",
    meaning_mm: "ဌာန၊ ဘာသာရပ်ခွဲ",
    example_word: "科学",
    example_reading: "かがく",
    example_meaning: "သိပ္ပံနည်းကျ",
    strokes: 9,
    unit: 3
  }
];
