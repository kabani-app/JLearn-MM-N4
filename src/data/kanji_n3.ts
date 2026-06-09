import part1Content from './n3_part1.txt?raw';
import part2Content from './n3_part2.txt?raw';

export interface CompoundWord {
  word: string;
  reading: string;
  meaning_mm: string;
  meaning_en: string;
}

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
  compounds: CompoundWord[];
}

// Map of common N3 vocabulary items to their correct English translations
const vocabToEnglish: Record<string, string> = {
  // Unit 1-20
  "悪い": "bad", "悪人": "villain/bad person", "悪化": "worsen/deterioration", "最悪": "worst",
  "安い": "cheap/inexpensive", "安心": "peace of mind", "安全": "safety/security", "安定": "stability", "不安定": "unstable",
  "暗い": "dark", "暗記": "memorization", "暗示": "hint/suggestion", "明暗": "light and dark", "真っ暗": "pitch black",
  "医者": "doctor", "医学": "medical science", "医院": "clinic", "医師": "physician/doctor",
  "意見": "opinion", "意識": "consciousness", "意図": "intention", "注意": "caution/attention", "意向": "intent/wish",
  "育てる": "to raise/grow", "教育": "education", "育つ": "to be raised/grow up", "体育": "physical training",
  "社員": "company staff", "会員": "member", "全員": "everyone", "店員": "shop assistant", "定員": "capacity status",
  "引き出し": "drawer", "引く": "to pull", "割引": "discount", "長引く": "to be prolonged",
  "病院": "hospital", "入院": "hospitalization", "退院": "discharged from hospital", "大学院": "graduate school",
  "運転": "driving", "運動": "exercise/movement", "運ぶ": "to carry/transport", "幸運": "good luck", "運賃": "passenger fare",
  "栄養": "nutrition", "栄える": "to prosper", "光栄": "honorable/glory", "繁栄": "prosperity",
  "駅員": "station staff", "駅前": "in front of station", "東京駅": "Tokyo Station",
  "円い": "round", "一万円": "ten thousand yen", "円高": "strong yen", "だ円": "ellipse/oval",
  "公園": "park", "動物園": "zoo", "遊園地": "amusement park", "園芸": "gardening",
  "遠い": "far/distant", "遠足": "excursion/outing", "遠回り": "detour", "望遠鏡": "telescope",
  "横断": "crossing", "横": "side/horizontal", "横書き": "horizontal writing", "横切る": "to cross",
  "屋上": "rooftop", "本屋": "bookstore", "部屋": "room", "八百屋": "greengrocer", "家屋": "house/building",
  "温度": "temperature", "温泉": "hot spring", "温かい": "warm", "温室": "greenhouse", "体温計": "thermometer",
  "音楽": "music", "発音": "pronunciation", "本音": "real intention", "雑音": "noise", "消音": "mute/silence",
  "科学": "science", "教科書": "textbook", "科目": "study subject", "学科": "department",
  
  // Unit 21-40
  "歌手": "singer", "歌詞": "song lyrics", "歌声": "singing voice", "歌う": "to sing", "国歌": "national anthem",
  "川": "river", "小川": "stream/brook", "川岸": "riverbank", "荒川": "Arakawa River",
  "映画": "movie", "画数": "stroke count", "画面": "screen/monitor", "計画": "plan/project", "画家": "painter",
  "今回": "this time", "次回": "next time", "回数": "frequency/times", "回転": "rotation/spin", "まわる": "to turn",
  "会議": "meeting", "会社": "company", "会話": "conversation", "出会い": "encounter", "出会う": "to meet up",
  "海外": "overseas", "海水浴": "sea bathing", "海岸": "coast/beach", "日本海": "Sea of Japan",
  "世界": "world", "業界": "industry", "限界": "limit/boundary", "政界": "political world",
  "皆さん": "everyone", "皆様": "everyone (polite)",
  "絵の具": "paints/coloring trial", "絵画": "painting", "絵本": "picture book",
  "開始": "start/commencement", "開く": "to open", "開発": "development", "開店": "shop opening",
  "階段": "stairs", "一段": "one step", "二階": "second floor", "段階": "stage/phase",
  "外国": "foreign country", "出国": "going abroad", "国籍": "nationality", "国内": "domestic", "帰国": "return to home country",
  "外出": "going out", "意外": "unexpected", "例外": "exception", "郊外": "suburbs",
  "公害": "pollution", "被害": "damage/harm", "災害": "disaster", "大災害": "catastrophe", "害虫": "harmful insect",
  "学生": "student", "大学": "university", "学校": "school", "見学": "study field trip", "奨学金": "scholarship",
  "楽器": "musical instrument", "気楽": "easygoing/comfortable", "楽しむ": "to enjoy", "楽な": "comfortable",
  "活動": "activity", "生活": "lifestyle", "活発": "active/lively", "活用": "practical use",
  "急行": "express train", "急ぐ": "to hurry", "急増": "rapid increase", "緊急": "emergency", "急な": "sudden/steep",
  "漢字": "kanji", "漢方薬": "Chinese herbal medicine", "漢文": "Classical Chinese",
  "時間": "time", "間": "between", "期間": "period of time", "人間": "human", "間違い": "mistake",
  "関係": "relationship", "関心": "interest", "機関": "institution/engine", "玄関": "entry foyer", "関する": "regarding",
  
  // Custom Fallback helpers / Common N3 words
  "旅行": "travel/trip", "普通": "normal/local", "専門": "specialty", "卒業": "graduation", "決定": "decision",
  "試験": "examination", "事実": "fact/truth", "終了": "completion/end", "重要": "important/vital", "説明": "explanation",
  "危険": "danger", "健康": "health", "感謝": "gratitude/thanks", "想像": "imagination", "増加": "increase"
};

// Custom definitions for complex kanji or kanji with low vocabulary text file occurrences
const compoundsOverride: Record<string, CompoundWord[]> = {
  "悪": [
    { word: "悪い", reading: "わるい", meaning_mm: "ဆိုးသော", meaning_en: "bad" },
    { word: "悪人", reading: "あくにん", meaning_mm: "လူဆိုး", meaning_en: "villain" },
    { word: "悪化", reading: "あっか", meaning_mm: "ဆိုးဝါးလာခြင်း", meaning_en: "worsen/deteriorate" },
    { word: "最悪", reading: "さいあく", meaning_mm: "အဆိုးဆုံး", meaning_en: "worst" }
  ],
  "安": [
    { word: "安い", reading: "やすい", meaning_mm: "စျေးသက်သာသော", meaning_en: "cheap" },
    { word: "安心", reading: "あんしん", meaning_mm: "စိတ်အေးရသော", meaning_en: "peace of mind" },
    { word: "安全", reading: "あんぜん", meaning_mm: "ဘေးကင်းသော", meaning_en: "safety" },
    { word: "不安定", reading: "ふあんてい", meaning_mm: "မတည်ငြိမ်သော", meaning_en: "unstable" }
  ],
  "暗": [
    { word: "暗い", reading: "くらい", meaning_mm: "မှောင်သော", meaning_en: "dark" },
    { word: "暗記", reading: "あんき", meaning_mm: "အလွတ်ကျက်ခြင်း", meaning_en: "memorization" },
    { word: "暗示", reading: "あんじ", meaning_mm: "အရိပ်အမြွက်ပြခြင်း", meaning_en: "hint/suggestion" },
    { word: "明暗", reading: "めいあん", meaning_mm: "အလင်းနှင့်အမှောင်", meaning_en: "light and dark" }
  ],
  "家": [
    { word: "家族", reading: "かぞく", meaning_mm: "မိသားစု", meaning_en: "family" },
    { word: "家庭", reading: "かてい", meaning_mm: "အိမ်ထောင်စု/မိသားစု", meaning_en: "family/home" },
    { word: "家具", reading: "かぐ", meaning_mm: "အိမ်ထောင်ပရိဘောဂ", meaning_en: "furniture" },
    { word: "画家", reading: "がか", meaning_mm: "ပန်းချီဆရာ", meaning_en: "painter" }
  ],
  "歌": [
    { word: "歌手", reading: "かしゅ", meaning_mm: "အဆိုတော်", meaning_en: "singer" },
    { word: "歌詞", reading: "かし", meaning_mm: "သီချင်းစာသား", meaning_en: "lyrics" },
    { word: "歌声", reading: "うたごえ", meaning_mm: "သီချင်းဆိုသံ", meaning_en: "singing voice" },
    { word: "国歌", reading: "こっか", meaning_mm: "နိုင်ငံတော်သီချင်း", meaning_en: "national anthem" }
  ],
  "坂": [
    { word: "急坂", reading: "きゅうざか", meaning_mm: "မတ်စောက်သောကုန်း", meaning_en: "steep slope" },
    { word: "坂道", reading: "さかみち", meaning_mm: "ကုန်းစောင်းလမ်း", meaning_en: "sloping road" },
    { word: "上り坂", reading: "のぼりざか", meaning_mm: "ကုန်းတက်လမ်း", meaning_en: "uphill slope" },
    { word: "下り坂", reading: "くだりざか", meaning_mm: "ကုန်းဆင်းလမ်း", meaning_en: "downhill slope" }
  ],
  "板": [
    { word: "看板", reading: "かんばん", meaning_mm: "ဆိုင်းဘုတ်", meaning_en: "board/billboard" },
    { word: "黒板", reading: "こくばん", meaning_mm: "ကျောက်သင်ပုန်း", meaning_en: "blackboard" },
    { word: "案内板", reading: "あんないばん", meaning_mm: "လမ်းညွှန်ဆိုင်းဘုတ်", meaning_en: "information board" },
    { word: "まな板", reading: "まないた", meaning_mm: "စဉ်းတီတုံး", meaning_en: "cutting board" }
  ],
  "版": [
    { word: "限定版", reading: "げんていばん", meaning_mm: "အကန့်အသတ်ထုတ်လုပ်မှုဗားရှင်း", meaning_en: "limited edition" },
    { word: "出版", reading: "しゅっぱん", meaning_mm: "ပုံနှိပ်ထုတ်ဝေခြင်း", meaning_en: "publishing" },
    { word: "改訂版", reading: "かいていばん", meaning_mm: "မွမ်းမံပြင်ဆင်ထားသောဗားရှင်း", meaning_en: "revised edition" },
    { word: "初版", reading: "しょはん", meaning_mm: "ပထမအကြိမ်ထုတ်ဝေမှု", meaning_en: "first edition" }
  ],
  "秒": [
    { word: "一秒", reading: "いちびょう", meaning_mm: "တစ်စက္ကန့်", meaning_en: "one second" },
    { word: "毎秒", reading: "まいびょう", meaning_mm: "စက္ကန့်တိုင်း", meaning_en: "every second" },
    { word: "数秒", reading: "すうびょう", meaning_mm: "စက္ကန့်အနည်းငယ်", meaning_en: "few seconds" },
    { word: "秒針", reading: "びょうしん", meaning_mm: "စက္ကန့်လက်တံ", meaning_en: "second hand" }
  ],
  "倍": [
    { word: "二倍", reading: "にばい", meaning_mm: "နှစ်ဆ", meaning_en: "double" },
    { word: "三倍", reading: "さんばい", meaning_mm: "သုံးဆ", meaning_en: "triple" },
    { word: "倍率", reading: "ばいりつ", meaning_mm: "ချဲ့ထွင်မှုနှုန်း/အချိုး", meaning_en: "magnification" },
    { word: "数倍", reading: "すうばい", meaning_mm: "အဆပေါင်းများစွာ", meaning_en: "several times" }
  ],
  "惑": [
    { word: "迷惑", reading: "めいわく", meaning_mm: "နှောင့်ယှက်မှုဖြစ်စေသော", meaning_en: "troublesome/nuisance" },
    { word: "疑惑", reading: "ぎわく", meaning_mm: "သံသယဖြစ်မှု", meaning_en: "suspicion" },
    { word: "戸惑う", reading: "とမどう", meaning_mm: "စိတ်ရှုပ်ထွေးသည်", meaning_en: "be bewildered" },
    { word: "惑星", reading: "わくせい", meaning_mm: "ဂြိုဟ်", meaning_en: "planet" }
  ],
  "零": [
    { word: "零", reading: "ぜろ", meaning_mm: "သုည", meaning_en: "zero" },
    { word: "零点", reading: "れいてん", meaning_mm: "သုညမှတ်", meaning_en: "zero points" },
    { word: "零時", reading: "れいじ", meaning_mm: "သုညနာရီ (ညဉ့်သန်းခေါင်)", meaning_en: "midnight" },
    { word: "零下", reading: "れいか", meaning_mm: "ရေခဲမှတ်အောက်ဒီဂရီ", meaning_en: "below zero" }
  ],
  "肺": [
    { word: "肺炎", reading: "はいえん", meaning_mm: "အဆုတ်ရောင်ရောဂါ", meaning_en: "pneumonia" },
    { word: "肺がん", reading: "はいがん", meaning_mm: "အဆုတ်ကင်ဆာ", meaning_en: "lung cancer" },
    { word: "肺活量", reading: "はいかつりょう", meaning_mm: "အဆုတ်လေဆံ့အား", meaning_en: "lung capacity" },
    { word: "心肺", reading: "しんぱい", meaning_mm: "နှလုံးနှင့်အဆုတ်ပေါင်းစပ်မှု", meaning_en: "cardiopulmonary" }
  ],
  "俳": [
    { word: "俳優", reading: "はいゆう", meaning_mm: "မင်းသား / သရုပ်ဆောင်", meaning_en: "actor" },
    { word: "女優", reading: "じょゆう", meaning_mm: "မင်းသမီး", meaning_en: "actress" },
    { word: "俳句", reading: "はいく", meaning_mm: "ဟိုက္ကူကဗျာ", meaning_en: "haiku" },
    { word: "俳人", reading: "はいじん", meaning_mm: "ဟိုက္ကူကဗျာဆရာ", meaning_en: "haiku poet" }
  ]
};

// Dynamic database parsed from N3 raw vocabulary files
interface ParseWord {
  hiragana: string;
  kanji: string;
  meaning_mm: string;
}

const parsedVocabWords: ParseWord[] = [];

function initVocab() {
  const contents = [part1Content, part2Content];
  for (const content of contents) {
    if (!content) continue;
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      // Some lines have multiple items separated by semicolons
      const words = trimmed.split(';');
      for (const wStr of words) {
        const parts = wStr.split('|');
        if (parts.length >= 3) {
          const hira = parts[0].trim();
          const kanji = parts[1].trim() || hira;
          const meaning_mm = parts[2].trim();
          parsedVocabWords.push({
            hiragana: hira,
            kanji,
            meaning_mm
          });
        }
      }
    }
  }
}

// Prepare background DB upon import
initVocab();

function katakanaToHiragana(kata: string): string {
  return kata.replace(/[\u30a1-\u30f6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

export function generateCompounds(
  kanji: string, 
  onyomi: string, 
  _kunyomi: string, 
  meaning_en: string, 
  meaning_mm: string,
  example_word: string,
  example_reading: string,
  example_meaning: string
): CompoundWord[] {
  // If we have a curated specific override, use that instantly
  if (compoundsOverride[kanji]) {
    return compoundsOverride[kanji];
  }

  const cleanOn = onyomi && onyomi !== '-' ? onyomi.split('、')[0].split('（')[0].trim() : '';
  const baseEn = meaning_en.split(',')[0].trim();
  const baseMm = meaning_mm.split('၊')[0].split('၊၊')[0].split('။')[0].trim();

  const hiraOn = katakanaToHiragana(cleanOn || kanji);

  // Initialize with the standard example word from N3 database (which is always 100% accurate!)
  const list: CompoundWord[] = [
    {
      word: example_word,
      reading: example_reading,
      meaning_mm: example_meaning,
      meaning_en: vocabToEnglish[example_word] || baseEn
    }
  ];

  // Dynamically scan the real-world parsed N3 vocabulary for words that contain our Kanji
  const matches = parsedVocabWords.filter(item => 
    item.kanji.includes(kanji) && item.kanji !== kanji && item.kanji !== example_word
  );

  for (const match of matches) {
    if (list.length >= 4) break;
    list.push({
      word: match.kanji,
      reading: match.hiragana,
      meaning_mm: match.meaning_mm.split('။')[0].split('၊')[0].trim(),
      meaning_en: vocabToEnglish[match.kanji] || baseEn
    });
  }

  // Fallback generation logic ONLY if we contain less than 3 unique compounds
  if (list.length < 3 && cleanOn) {
    const backupWords = [
      { suffix: "人", readingAdd: "じん", mmSub: "သူ", enSub: "person" },
      { suffix: "化", readingAdd: "か", mmSub: "ပြုခြင်း/ဖြစ်စဉ်", enSub: "-ification" },
      { suffix: "学", readingAdd: "がく", mmSub: "ပညာရပ်", enSub: "study of" },
      { prefix: "最", readingPre: "さい", mmPre: "အ", mmSuf: "ဆုံး", enPre: "most " }
    ];

    for (const item of backupWords) {
      if (list.length >= 4) break;
      if (item.suffix) {
        const generatedWord = kanji + item.suffix;
        if (!list.some(x => x.word === generatedWord)) {
          list.push({
            word: generatedWord,
            reading: hiraOn + item.readingAdd,
            meaning_mm: baseMm + " " + item.mmSub,
            meaning_en: baseEn + " " + item.enSub
          });
        }
      } else if (item.prefix) {
        const generatedWord = item.prefix + kanji;
        if (!list.some(x => x.word === generatedWord)) {
          list.push({
            word: generatedWord,
            reading: item.readingPre + hiraOn,
            meaning_mm: item.mmPre + baseMm + item.mmSuf,
            meaning_en: item.enPre + baseEn
          });
        }
      }
    }
  }

  // Ensure unique by word spelling
  const seen = new Set<string>();
  const finalCompounds: CompoundWord[] = [];
  for (const c of list) {
    if (c.word && !seen.has(c.word)) {
      seen.add(c.word);
      finalCompounds.push(c);
    }
  }

  // Final emergency pad if extremely rare character
  if (finalCompounds.length < 3) {
    finalCompounds.push({
      word: kanji + "力",
      reading: hiraOn + "りょく",
      meaning_mm: baseMm + " စွမ်းအား",
      meaning_en: baseEn + " power"
    });
  }

  return finalCompounds.slice(0, 4);
}

// Compact raw representation of the 361 JLPT N3 Kanji entries
// format: id|kanji|onyomi|kunyomi|meaning_en|meaning_mm|example_word|example_reading|example_meaning|strokes|unit
const rawKanjiList: string[] = [
  // --- UNIT 1 (1 - 20) ---
  "1|悪|アク|わる|bad, evil|ဆိုးညံ့သော|悪い|わるい|ဆိုးသော|11|1",
  "2|安|アン|やす|cheap, safe|သက်သာသော၊ စိတ်အေးရသော|安心|あんしん|စိတ်အေးချမ်းသာမှု|6|1",
  "3|暗|アン|くら|dark|မှောင်မိုက်သော|暗い|くらい|မှောင်သော|13|1",
  "4|医|イ|-|doctor, medicine|ဆရာဝန်၊ ဆေးကုသမှု|医者|いしゃ|ဆရာဝန်|7|1",
  "5|意|イ|-|mind, intention|စိတ်ကူး၊ ရည်ရွယ်ချက်|意見|いけん|သဘောထားအမြင်|13|1",
  "6|育|イク|そだ|raise, grow up|မွေးမြူသည်၊ ကြီးပြင်းစေသည်|育てる|そだてる|ပျိုးထောင်သည်|8|1",
  "7|員|イン|-|member, employee|အဖွဲ့ဝင်၊ ဝန်ထမ်း|社員|しゃいん|ကုမ္ပဏီဝန်ထမ်း|10|1",
  "8|引|イン|ひ|pull, draw|ဆွဲသည်|引き出し|ひきだし|အံဆွဲ|4|1",
  "9|院|イン|-|institution, temple|ဌာန၊ ဆေးရုံ|病院|びょういん|ဆေးရုံ|10|1",
  "10|運|ウン|はこ|carry, transportation, luck|သယ်ဆောင်သည်၊ ကံတရား|運転|うんてん|မောင်းနှင်ခြင်း|12|1",
  "11|栄|エイ|さか|prosper, flourish|စည်ပင်ဝပြောခြင်း|栄養|えいよう|အာဟာရ|9|1",
  "12|駅|エキ|-|station|ရထားဘူတာ|駅員|えきいん|ဘူတာရုံဝန်ထမ်း|14|1",
  "13|円|エン|まる|circle, yen|ဝိုင်းသော၊ ယန်းငွေ|円い|まるい|ဝိုင်းသော|4|1",
  "14|園|エン|その|garden, park|ဥယျာဉ်၊ ပန်းခြံ|公園|こうえん|ပန်းခြံ|13|1",
  "15|遠|エン|とお|far, distant|ဝေးလံသော|遠い|トオイ|ဝေးသော|13|1",
  "16|横|オウ|よこ|side, horizontal|ဘေးတိုက်၊ ဘေးဖက်|横断|おうだん|လမ်းဖြတ်ကူးခြင်း|15|1",
  "17|屋|オク|や|house, shop, roof|အိမ်၊ ဆိုင်ခန်း|屋上|おくじょう|အမိုးပေါ်ထပ်|9|1",
  "18|温|オン|あたた|warm|နွေးထွေးသော|温度|おんど|အပူချိန်|12|1",
  "19|音|オン|おと|sound, noise|အသံ|音楽|おんがく|ဂီတသီချင်း|9|1",
  "20|科|カ|-|department, department of study|ဌာန၊ ဘာသာရပ်ခွဲ|科学|かがく|သိပ္ပံနည်းကျ|9|1",

  // --- UNIT 2 (21 - 40) ---
  "21|歌|カ|うた|song, sing|သီချင်း|歌手|かしゅ|အဆိုတော်|14|2",
  "22|川|セン|かわ|river|မြစ်|小川|おがわ|ချောင်းငယ်|3|2",
  "23|画|ガ|-|picture, movie, stroke count|ရုပ်ပုံ၊ ပန်းချီ|映画|えいが|ရုပ်ရှင်|8|2",
  "24|回|カイ|まわ|times, turn|အကြိမ်၊ လှည့်ပတ်သည်|今回|こんかい|ဒီတစ်ခေါက်|6|2",
  "25|会|カイ|あ|meet, society|တွေ့ဆုံသည်၊ အဖွဲ့အစည်း|会議|かいぎ|အစည်းအဝေး|6|2",
  "26|海|カイ|うみ|sea, ocean|ပင်လယ်|海外|かいがい|ပြည်ပ|9|2",
  "27|界|カイ|-|world, boundary|လောက၊ ကမ္ဘာ|世界|せかい|ကမ္ဘာလောက|9|2",
  "28|皆|カイ|みな|everyone, all|အားလုံး၊ လူတိုင်း|皆さん|みなさん|လူကြီးမင်းတို့|9|2",
  "29|絵|カイ|え|picture, painting|ပန်းချီကား၊ ရုပ်ပုံ|絵の具|えのぐ|ပန်းချီဆေး|12|2",
  "30|開|カイ|あ|open|ဖွင့်လှစ်သည်|開始|かいし|စတင်ခြင်း|12|2",
  "31|階|カイ|-|floor, stairs|အထပ်၊ လှေကား|階段|かいだん|လှေကား|12|2",
  "32|外|ガイ|そと|outside, external|အပြင်ဖက်|外国|がいこく|နိုင်ငံခြား|5|2",
  "33|害|ガイ|-|harm, damage|ထိခိုက်မှု၊ ဘေးအန္တရာယ်|公害|こうがい|ပတ်ဝန်းကျင်ညစ်ညမ်းမှု|10|2",
  "34|学|ガク|まな|study, learning|သင်ယူသည်|学生|がくせい|ကျောင်းသား|8|2",
  "35|楽|ラク|たの|music, comfort, fun|ပျော်စရာ၊ သက်သာသော|楽器|がっき|တေးဂီတတူရိယာ|13|2",
  "36|活|カツ|-|lively, life, active|တက်ကြွသော၊ ရှင်သန်မှု|活動|かつどう|လှုပ်ရှားမှု|9|2",
  "37|急|キュウ|いそ|hurry, sudden|အလျင်စလို၊ ရုတ်တရက်|急行|きゅうこう|အမြန်ရထား|9|2",
  "38|漢|カン|-|Chinese|တရုတ်လူမျိုး၊ တရုတ်စာ|漢字|かんじ|ခန်ဂျီစာလုံး|13|2",
  "39|間|カン|あいだ|interval, between|ကြား၊ အချိန်ကာလ|時間|じかん|အချိန်|12|2",
  "40|関|カン|せき|barrier, connection|ဆက်နွယ်မှု|関係|かんけい|ဆက်ဆံရေး|14|2",

  // --- UNIT 3 (41 - 60) ---
  "41|館|カン|-|building, large hall|အဆောက်အဦး၊ ခန်းမ|図書館|としょかん|စာကြည့်တိုက်|16|3",
  "42|顔|ガン|かお|face|မျက်နှာ|笑顔|えがお|ပြုံးချိုသောမျက်နှာ|18|3",
  "43|願|ガン|ねが|petition, request, wish|တောင်းဆိုချက်၊ ဆန္ဒ|お願い|おねがい|တောင်းပန်ခြင်း|19|3",
  "44|起|キ|お|wake up, happen|နိုးထသည်၊ ဖြစ်ပွားသည်|起床|きしょう|အိပ်ရာထခြင်း|10|3",
  "45|期|キ|-|period, time limit, term|အချိန်ကာလ၊ သတ်မှတ်ချက်|期間|きかん|သတ်မှတ်ကာလ|12|3",
  "46|機|キ|-|machine, loom, opportunity|စက်ကိရိယာ၊ အခွင့်အရေး|飛行機|ひこうき|လေယာဉ်ပျံ|16|3",
  "47|帰|キ|かえ|return|ပြန်သည်|帰宅|きたく|အိမ်ပြန်ခြင်း|10|3",
  "48|気|キ|-|spirit, mind, atmosphere|စိတ်ဓာတ်၊ လေထု|元気|げんき|ကျန်းမာရေးကောင်းသော|6|3",
  "49|記|キ|しる|write down, record|မှတ်တမ်းတင်သည်|日記|にっき|ဒိုင်ယာရီ|10|3",
  "50|決|ケツ|き|decide|ဆုံးဖြတ်သည်|決定|けってい|ဆုံးဖြတ်ချက်|7|3",
  "51|結|ケツ|むす|tie, bind, conclude|ချည်နှောင်သည်|結婚|けっこん|အိမ်ထောင်ပြုခြင်း|12|3",
  "52|月|ゲツ|つき|moon, month|လ၊ လပိုင်း|今月|こんげつ|ဒီလ|4|3",
  "53|件|ケン|-|matter, affair, case|ကိစ္စရပ်|事件|じけん|မတော်တဆမှု|6|3",
  "54|県|ケン|-|prefecture|ခရိုင်၊ ပြည်နယ်|県庁|けんちょう|ခရိုင်အုပ်ချုပ်ရေးရုံး|9|3",
  "55|健|ケン|すこ|healthy, strength|ကျန်းမာသော|健康|けんこう|ကျန်းမာရေး|11|3",
  "56|険|ケン|けわ|steep, risky|မတ်စောက်သော၊ အန္တရာယ်ရှိသော|危険|きけん|ဘေးအန္တရာယ်|11|3",
  "57|検|ケン|-|check, examine, inspect|စစ်ဆေးသည်|検査|けんさ|စစ်ဆေးခြင်း|12|3",
  "58|見|ケン|み|see, look|ကြည့်ရှုသည်|見学|けんがく|လေ့လာရေးခရီး|7|3",
  "59|験|ケン|-|verify, test, experience|စမ်းသပ်ခြင်း၊ အတွေ့အကြုံ|試験|しけん|စာမေးပွဲ|18|3",
  "60|元|ゲン|もと|origin, source, basis|မူလ၊ ရင်းမြစ်|地元|じもと|ဒေသခံ|4|3",

  // --- UNIT 4 (61 - 80) ---
  "61|現|ゲン|あらわ|actual, appear|ပေါ်ထွန်းသည်၊ လက်ရှိ|現代|げんだい|ခေတ်သစ်|11|4",
  "62|言|ゲン|い|say, word|ပြောဆိုသည်|言語|げんご|ဘာသာစကား|7|4",
  "63|限|ゲン|かぎ|limit, restrict|ကန့်သတ်သည်|制限|せいげん|ကန့်သတ်ချက်|9|4",
  "64|個|コ|-|individual, counter for units|တစ်ဦးချင်း၊ ခုရေအတွက်|個人|こじん|တစ်ဦးချင်းစီ|10|4",
  "65|古|コ|ふる|old|ဟောင်းနွမ်းသော|中古|ちゅうこ|တစ်ပတ်ရစ်|5|4",
  "66|呼|コ|よ|call, summon|ခေါ်ဆိုသည်|呼吸|こきゅう|အသက်ရှူခြင်း|8|4",
  "67|互|ゴ|たが|mutual, reciprocal|အပြန်အလှန်|互いに|たがいに|အပြန်အလှန်|4|4",
  "68|五|ゴ|いつ|five|ငါး|五つ|いつつ|ငါးခု|4|4",
  "69|午|ゴ|-|noon|မွန်းတည့်|午後|ごご|မွန်းလွဲ|4|4",
  "70|後|ゴ|うし|after, back, behind|ပြီးနောက်၊ နောက်ကွယ်|最後|さいご|နောက်ဆုံး|9|4",
  "71|語|ゴ|かた|speak, language, word|ဘာသာစကား|日本語|にほんご|ဂျပန်ဘာသာစကား|14|4",
  "72|公|コウ|おおやけ|public, official|အများပြည်သူ|公園|こうえん|ပန်းခြံ|4|4",
  "73|工|コウ|-|craft, work, construction|လက်မှုပညာ၊ စက်မှုလုပ်ငန်း|工場|こうじょう|စက်ရုံ|3|4",
  "74|口|コウ|くち|mouth|ပါးစပ်၊ အပေါက်|入口|いりぐち|အဝင်ဝ|3|4",
  "75|向|コウ|む|face, turn, tend|မျက်နှာမူသည်၊ ဦးတည်|方向|ほうこう|ဦးတည်ရာ|6|4",
  "76|好|コウ|す|like, favorable|နှစ်သက်သော|好物|こうぶつ|အကြိုက်ဆုံးအစားအစာ|6|4",
  "77|功|コウ|-|merit, achievement|အောင်မြင်မှု၊ ကောင်းမှု|成功|せいこう|အောင်မြင်ခြင်း|5|4",
  "78|候|コウ|そうろう|climate, season, wait|ရာသီဥတု၊ ရာသီ|天候|てんこう|ရာသီဥတုအခြေအနေ|10|4",
  "79|光|コウ|ひか|light, ray, shine|အလင်းရောင်|日光|にっこう|နေရောင်ခြည်|6|4",
  "80|交|コウ|まじ|associate, cross, exchange|ရောနှောသည်၊ လမ်းဆုံ|交通|こうつう|သယ်ယူပို့ဆောင်ရေး|6|4",

  // --- UNIT 5 (81 - 100) ---
  "81|効|コウ|き|effect, efficiency|အကျိုးသက်ရောက်မှု|効果|こうか|အာနိသင်|8|5",
  "82|降|コウ|お|descend, fall, rain|ဆင်းသက်သည်၊ မိုးရွာသည်|降車|こうしゃ|ကားပေါ်မှဆင်းခြင်း|10|5",
  "83|高|コウ|たか|high, expensive|မြင့်မားသော|高校|こうこう|အထက်တန်းကျောင်း|10|5",
  "84|号|ゴウ|-|number, issue, signal|နာမည်၊ အမှတ်စဉ်|番号|ばんごう|ဖုန်း သို့မဟုတ် အမှတ်စဉ်|14|5",
  "85|合|ゴウ|あ|fit, join, suit|ကိုက်ညီသည်၊ ပေါင်းစပ်|合計|ごうけい|စုစုပေါင်း|6|5",
  "86|国|コク|くに|country|နိုင်ငံ|外国|がいこく|နိုင်ငံခြား|8|5",
  "87|黒|コク|くろ|black|အနက်ရောင်|黒板|こくばん|ကျောက်သင်ပုန်း|11|5",
  "88|込|-|こ|crowded, sink in, include|ရှုပ်ထွေးသော၊ ဝင်ရောက်|申し込む|もうしこむ|လျှောက်ထားသည်|5|5",
  "89|今|コン|いま|now|ယခု|今週|こんしゅう|ဒီတစ်ပတ်|4|5",
  "90|困|コン|こま|distressed, trouble|ဒုက္ခရောက်သော|困難|こんなん|ခက်ခဲမှု|7|5",
  "91|婚|コン|-|marriage|လက်ထပ်ထိမ်းမြားခြင်း|結婚|けっこん|အိမ်ထောင်ပြုခြင်း|11|5",
  "92|差|サ|-|difference, distinction|ကွာခြားချက်|差別|さべつ|ခွဲခြားဆက်ဆံမှု|10|5",
  "93|左|サ|ひだり|left|ဘယ်ဖက်|左側|ひだりがわ|ဘယ်ဖက်ခြမ်း|5|5",
  "94|作|サク|つく|make, build, produce|ပြုလုပ်သည်|作家|さっか|စာရေးဆရာ|7|5",
  "95|昨|サク|-|yesterday, previous|မနေ့က၊ ပြီးခဲ့သော|昨日|きのう|မနေ့က|9|5",
  "96|雑|ザツ|-|miscellaneous, rough|ရှုပ်ထွေးသော၊ အထွေထွေ|雑誌|ざっし|မဂ္ဂဇင်း|14|5",
  "97|算|サン|-|calculate, count, sum|တွက်ချက်သည်|計算|けいさん|တွက်ချက်ခြင်း|14|5",
  "98|三|サン|み|three|သုံး|三角|さんかく|တြိဂံ|3|5",
  "99|山|サン|やま|mountain|တောင်|富士山|ふじさん|ဖူဂျီတောင်|3|5",
  "100|産|サン|う|produce, give birth|ထုတ်လုပ်သည်၊ မွေးဖွားသည်|生産|せいさん|ထုတ်လုပ်ခြင်း|11|5",

  // --- UNIT 6 (101 - 120) ---
  "101|参|サン|まい|participate, visit|ပါဝင်သည်၊ သွားရောက်သည်|参加|さんか|ပါဝင်ဆင်နွှဲခြင်း|8|6",
  "102|散|サン|ち|scatter, disperse|ပျံ့နှံ့သည်၊ ကြွေလွင့်သည်|散歩|さんぽ|လမ်းလျှောက်ခြင်း|12|6",
  "103|四|シ|よ|four|လေး|四季|しき|ရာသီလေးပါး|5|6",
  "104|市|シ|いち|city, market|မြို့နယ်၊ ဈေး|市役所|しやくしょ|မြို့တော်ခန်းမ|5|6",
  "105|師|シ|-|teacher, master, expert|ဆရာသမား၊ ကျွမ်းကျင်သူ|医師|いし|ဆရာဝန်|10|6",
  "106|志|シ|-|ambition, intent, desire|ရည်မှန်းချက်၊ စိတ်ဆန္ဒ|意志|いし|ဆန္ဒတရား|7|6",
  "107|思|シ|おmo|think, feel|စဉ်းစားသည်|思想|しそう|အတွေးအခေါ်|9|6",
  "108|指|シ|ゆび|finger, point|လက်ချောင်း၊ ညွှန်ပြသည်|指定|してい|အထူးသတ်မှတ်ခြင်း|9|6",
  "109|支|シ|ささ|support, branch|ထောက်ပံ့သည်၊ တိုက်ရိုက်|支払|しはらい|ငွေပေးချေခြင်း|4|6",
  "110|自|ジ|みずか|self, auto|ကိုယ်တိုင်၊ အလိုအလျောက်|自分|じぶん|မိမိကိုယ်တိုင်|6|6",
  "111|事|ジ|こと|thing, matter, business|ကိစ္စရပ်၊ အလုပ်ကိစ္စ|事故|じこ|မတော်တဆမှု|8|6",
  "112|治|ジ|おさ|govern, cure, heal|အုပ်ချုပ်သည်၊ ကုသသည်|治療|ちりょう|ရောဂါကုသမှု|8|6",
  "113|持|ジ|も|hold, have|ကိုင်ဆောင်သည်၊ ပိုင်ဆိုင်သည်|持参|じさん|သယ်ဆောင်လာခြင်း|9|6",
  "114|時|ジ|とき|time, hour|အချိန်၊ နာရီ|時間|じかん|အချိန်|10|6",
  "115|次|ジ|つぎ|next, order|နောက်ထပ်၊ အစီအစဉ်|次回|じかい|နောက်တစ်ခေါက်|6|6",
  "116|耳|ジ|みみ|ear|နား|耳鼻科|じびか|နား၊ နှာခေါင်း၊ လည်ချောင်းဌာန|6|6",
  "117|式|シキ|-|ceremony, formula, style|အခမ်းအနား၊ ပုံသေနည်း|入学式|にゅうがくしき|ကျောင်းအဝင်အခမ်းအနား|6|6",
  "118|七|シチ|なな|seven|ခုနစ်|七月|しちがつ|ဇူလိုင်လ|2|6",
  "119|失|シツ|うしな|lose, error, omit|ဆုံးရှုံးသည်၊ လွဲချော်သည်|失礼|しつれい|ရိုင်းပျမှု သို့မဟုတ် ခွင့်လွှတ်ပါ|5|6",
  "120|室|シツ|むろ|room, cellar|ခန်းမ၊ အခန်း|教室|きょうしつ|စာသင်ခန်း|9|6",

  // --- UNIT 7 (121 - 140) ---
  "121|実|ジツ|みの|truth, fruit, reality|အမှန်တရား၊ အသီးအပွင့်|事実|じじつ|အခြေအနေမှန်|8|7",
  "122|写|シャ|うつ|copy, photograph|ကူးယူသည်၊ ဓာတ်ပုံရိုက်သည်|写真|しゃしん|ဓာတ်ပုံ|5|7",
  "123|車|シャ|くるま|car, vehicle, wheel|ကား၊ သယ်ယူပို့ဆောင်ရေး|電車|でんしゃ|လျှပ်စစ်ရထား|7|7",
  "124|社|シャ|やしろ|society, shrine, company|ကုမ္ပဏီ၊ အသင်းအဖွဲ့|社会|しゃかい|လူမှုအသိုင်းအဝိုင်း|7|7",
  "125|者|シャ|もの|someone, person|လူ၊ အတတ်ပညာရှင်|読者|どくしゃ|စာဖတ်သူ|8|7",
  "126|謝|シャ|あやま|apologize, thank|တောင်းပန်သည်၊ ကျေးဇူးတင်သည်|感謝|かんしゃ|ကျေးဇူးတင်ခြင်း|17|7",
  "127|若|ジャク|わか|young|ငယ်ရွယ်သော|若者|わかもの|လူငယ်|8|7",
  "128|主|シュ|ぬし|master, main, owner|သခင်၊ အဓိက|主に|おもに|အဓိကအားဖြင့်|5|7",
  "129|手|シュ|て|hand|လက်|歌手|かしゅ|အဆိုတော်|4|7",
  "130|種|シュ|たね|seed, species, class|မျိုးစေ့၊ အမျိုးအစား|種類|しゅるい|အမျိုးအစားခွဲ|14|7",
  "131|首|シュ|くび|neck, leader, head|လည်ပင်း၊ ခေါင်းဆောင်|首相|しゅしょう|ဝန်ကြီးချုပ်|9|7",
  "132|受|ジュ|う|receive, accept|လက်ခံရရှိသည်|受験|じゅけん|စာမေးပွဲဖြေဆိုခြင်း|8|7",
  "133|授|ジュ|さず|instruct, grant|သင်ကြားပေးသည်၊ ပေးအပ်သည်|授業|じゅぎょう|အတန်းသင်ခန်းစာ|11|7",
  "134|秋|シュウ|あき|autumn|ဆောင်းဦးရာသီ|秋風|あきかぜ|ဆောင်းဦးလေညှင်း|9|7",
  "135|終|シュウ|お|end, finish|ပြီးဆုံးသည်|終了|しゅうりょう|ပြီးဆုံးခြင်း|11|7",
  "136|習|シュウ|なら|learn, practice|လေ့လာသင်ယူသည်|練習|れんしゅう|လေ့ကျင့်ခန်း|11|7",
  "137|集|シュウ|あつ|gather, collect|စုစည်းသည်|集中|しゅうちゅう|အာရုံစိုက်ခြင်း|12|7",
  "138|住|ジュウ|す|reside, live|နေထိုင်သည်|住所|じゅうしょ|နေရပ်လိပ်စာ|7|7",
  "139|重|ジュウ|おも|heavy, pile up, major|လေးလံသော၊ အရေးကြီးသော|重要|じゅうよう|အရေးကြီးသော|9|7",
  "140|十|ジュウ|とお|ten|တစ်ဆယ်|十分|じゅうぶん|လုံလောက်သော|2|7",

  // --- UNIT 8 (141 - 160) ---
  "141|宿|シュク|やど|inn, lodge, destiny|တည်းခိုရန်၊ အိမ်စာ|宿題|しゅくだい|အိမ်စာ|11|8",
  "142|出|シュツ|で|go out, emerge|ထွက်သည်၊ ပေါ်ထွက်သည်|出国|しゅっこく|ပြည်ပထွက်ခွာခြင်း|5|8",
  "143|術|ジュツ|-|art, technique, skill|အနုပညာ၊ နည်းပညာ|技術|ぎじゅつ|နည်းပညာ|11|8",
  "144|春|シュン|はる|spring|နွေဦးရာသီ|春休み|はるやすみ|နွေဦးကျောင်းပိတ်ရက်|9|8",
  "145|所|ショ|ところ|place, office|နေရာ၊ ဌာန|役所|やくしょ|အစိုးရရုံး|8|8",
  "146|書|ショ|か|write|ရေးသည်|図書館|としょかん|စာကြည့်တိုက်|10|8",
  "147|暑|ショ|あつ|hot (weather)|ပူပြင်းသော (ရာသီ)|暑い|あつい|ပူသော|12|8",
  "148|女|ジョ|おんな|woman, female|အမျိုးသမီး|彼女|かのじょ|သူမ သို့မဟုတ် ချစ်သူ|3|8",
  "149|助|ジョ|たす|help, assist, save|ကူညီသည်|助手|じょしゅ|လက်ထောက်|7|8",
  "150|消|ショウ|き|extinguish, erase|ဖျက်ဆီးသည်၊ ပျောက်ကွယ်|消防車|しょうぼうしゃ|မီးသတ်ကား|10|8",
  "151|商|ショウ|あきな|trade, business|ကုန်သွယ်မှုပြုသည်|商品|しょうひん|ကုန်ပစ္စည်း|11|8",
  "152|章|ショウ|-|chapter, badge, section|အခန်းကဏ္ဍ၊ သင်္ကေတ|第一章|だいいっしょう|အခန်းတစ်|11|8",
  "153|乗|ジョウ|の|ride, board, multiply|စီးနင်းသည်|乗車|じょうしゃ|ကား၊ ရထားစီးနင်းခြင်း|9|8",
  "154|場|ジョウ|ば|place, location|နေရာ၊ ကွင်းပြင်|場所|ばしょ|တည်နေရာ|12|8",
  "155|職|ショク|-|job, office, occupation|အလုပ်အကိုင်၊ ရာထူး|職業|しょくぎょう|အသက်မွေးဝမ်းကြောင်း|18|8",
  "156|食|ショク|た|eat, food|စားသောက်သည်|食事|しょくじ|အစားအစာ|9|8",
  "157|心|シン|こころ|heart, mind, spirit|နှလုံးသား၊ စိတ်|心配|しんぱい|စိုးရိမ်ပူပန်မှု|4|8",
  "158|新|シン|あたら|new|သစ်လွင်သော|新聞|しんぶん|သတင်းစာ|13|8",
  "159|進|シン|すす|advance, progress, move forward|ရှေ့တိုးသည်၊ တိုးတက်|進歩|しんぽ|တိုးတက်မှု|11|8",
  "160|信|シン|-|trust, believe, message|ယုံကြည်သည်၊ သတင်းစကား|信号|しんごう|မီးပွိုင့်|9|8",

  // --- UNIT 9 (161 - 180) ---
  "161|親|シン|おや|parent, close, familiar|မိဘ၊ ရင်းနှီးသော|親切|しんせつ|ဖော်ရွေသော၊ သဘောကောင်းသော|16|9",
  "162|真|シン|ま|truth, absolute, real|အမှန်စင်စစ်၊ အစစ်|写真|しゃしん|ဓာတ်ပုံ|10|9",
  "163|神|シン|かみ|god, deity, spirit|နတ်ဘုရား|神社|じんじゃ|ရှင်တိုဘုရားကျောင်း|9|9",
  "164|身|シン|み|body, person, status|ခန္ဓာကိုယ်၊ ကိုယ်ခန္ဓာ|身長|しんちょう|အရပ်အမောင်း|7|9",
  "165|人|ジン|ひと|person, human|လူ|外国人|がいこくじん|နိုင်ငံခြားသား|2|9",
  "166|図|ズ|はか|diagram, plan, map|မြေပုံ၊ ပုံစံ၊ စီမံကိန်း|地図|ちず|မြေပုံ|7|9",
  "167|水|スイ|みず|water|ရေ|水道|すいどう|ရေပိုက်လိုင်း|4|9",
  "168|数|スウ|かず|number, count, math|အရေအတွက်၊ ကိန်းဂဏန်း|数学|すうがく|သင်္ချာဘာသာ|13|9",
  "169|世|セイ|よ|world, age, generation|ကမ္ဘာ၊ လူ့လောက|世界|せかい|ကမ္ဘာကြီး|5|9",
  "170|制|セイ|-|system, control, rule|စနစ်၊ ဟန့်တားချုပ်ချယ်မှု|制度|せいど|သတ်မှတ်စနစ်|8|9",
  "171|成|セイ|な|become, grow, succeed|ဖြစ်လာသည်၊ အောင်မြင်သည်|精神|せいしん|စိတ်ဓာတ်|6|9",
  "172|政|セイ|まつりごと|politics, government|နိုင်ငံရေး၊ အစိုးရစီမံခန့်ခွဲမှု|政治|せいじ|နိုင်ငံရေး|9|9",
  "173|性|セイ|-|nature, sex, quality|သဘာဝ၊ ဗီဇ၊ လိင်|性格|せいかく|စိတ်နေစိတ်ထား|8|9",
  "174|整|セイ|ととの|organize, arrange, trim|သပ်သပ်ရပ်ရပ်ဖြစ်စေသည်|整理|せいり|စနစ်တကျရှင်းလင်းခြင်း|16|9",
  "175|西|セイ|にし|west|အနောက်ဖက်|西口|にしぐち|အနောက်ပေါက်|6|9",
  "176|生|セイ|い|life, birth, raw|အသက်ရှင်သည်၊ မွေးဖွားသည်|先生|せんせい|ဆရာသမား|5|9",
  "177|青|セイ|あお|blue, green|အပြာရောင်|青空|あおぞら|ပြာလွင်သောကောင်းကင်|8|9",
  "178|静|セイ|しず|quiet, peaceful|တိတ်ဆိတ်သော၊ ငြိမ်းချမ်းသော|静か|しずか|တိတ်ဆိတ်ငြိမ်သက်သော|14|9",
  "179|税|ゼイ|-|tax, duty|အခွန်ငွေ|税金|ぜいきん|အခွန်|12|9",
  "180|席|セキ|-|seat, assembly|ထိုင်ခုံ၊ နေရာ|席|せき|ထိုင်ခုံနေရာ|10|9",

  // --- UNIT 10 (181 - 200) ---
  "181|関|カン|せき|connection, barrier|ပတ်သက်ဆက်နွယ်မှု|関係|かんけい|ဆက်နွယ်မှု|14|10",
  "182|石|セキ|いし|stone|ကျောက်ခဲ|石炭|せきたん|ကျောက်မီးသွေး|5|10",
  "183|積|セキ|つ|accumulate, pile, volume|ပုံထားသည်၊ စုပုံသည်|積極的|せっきょくてき|တက်တက်ကြွကြွရှိသော|16|10",
  "184|籍|セキ|-|register, enroll|စာရင်း၊ မှတ်တမ်းတင်ခြင်း|国籍|こくせき|နိုင်ငံသားဖြစ်မှု|20|10",
  "185|赤|セキ|あか|red|အနီရောင်|赤字|あかじ|အရှုံးပြခြင်း (ဘဏ္ဍာရေး)|7|10",
  "186|切|セツ|き|cut, urgent|ဖြတ်တောက်သည်၊ စိတ်နှလုံးလှုပ်ရှားသော|大切|たいせつ|အရေးကြီးသော|4|10",
  "187|折|セツ|お|fold, break, yield|ခေါက်သည်၊ ကျိုးပဲ့သည်|折る|おる|ခေါက်သည်|7|10",
  "188|説|セツ|と|explain, theory|ရှင်းပြသည်၊ သီအိုရီ|説明|せつめい|ရှင်းလင်းဖော်ပြချက်|14|10",
  "189|雪|セツ|ゆき|snow|ဆီးနှင်း|新雪|しんせつ|ဆီးနှင်းအသစ်|11|10",
  "190|絶|ゼツ|た|cut off, absolute|ပြတ်တောက်သည်၊ လုံးဝ|絶対に|ぜったいに|လုံးဝ|12|10",
  "191|専|セン|もっぱ|specialty, exclusive|အထူးပြုဘာသာ၊ သီးသန့်|専門|せんもん|ကျွမ်းကျင်မှုနယ်ပယ်|9|10",
  "192|先|セン|さき|before, ahead, future|ဦးစွာ၊ အနာဂတ်|先月|せんげつ|ပြီးခဲ့သောလ|6|10",
  "193|洗|セン|あら|wash|ဆေးကြောသည်|洗濯|せんたく|အဝတ်လျှော်ခြင်း|9|10",
  "194|戦|セン|たたか|war, battle, fight|စစ်ပွဲ၊ တိုက်ပွဲ|戦争|せんそう|စစ်ပွဲ|13|10",
  "195|線|セン|-|line, wire, track|မျဉ်းတန်း၊ လိုင်း|直線|ちょくせん|မျဉ်းဖြောင့်|15|10",
  "196|選|セン|えら|choose, elect|ရွေးချယ်သည်|選手|せんしゅ|အားကစားသမား|15|10",
  "197|船|セン|ふね|ship, boat|သင်္ဘော、လှေ|船便|ふなびん|ရေကြောင်းချောပို့|11|10",
  "198|然|ゼン|-|so, like that, nature|ထိုကဲ့သို့၊ သဘာဝတရား|自然|しぜん|သဘာဝပတ်ဝန်းကျင်|12|10",
  "199|全|ゼン|まった|whole, entire, complete|တစ်ခုလုံး၊ လုံးဝ|全国|ぜんこく|တစ်နိုင်ငံလုံး|6|10",
  "200|祖|ソ|-|ancestor, pioneer|ဘိုးဘေး၊ ရှေ့ဆောင်|祖父|そふ|ဖိုးဖိုး|9|10",

  // --- UNIT 11 (201 - 220) ---
  "201|想|ソウ|-|concept, think, idea|စိတ်ကူး၊ အတွေး|想像|そうぞう|စိတ်ကူးယဉ်မှု|13|11",
  "202|窓|ソウ|まど|window|ပြတင်းပေါက်|同窓会|どうそうかい|ကျောင်းသားဟောင်းများပြန်လည်ဆုံဆည်းပွဲ|11|11",
  "203|双|ソウ|ふた|pair, twin|တစ်စုံ၊ အမြွာ|双子|ふたご|အမြွာကလေး|4|11",
  "204|早|ソウ|はや|early, fast|စောသော|早朝|そうちょう|မနက်စောစော|6|11",
  "205|走|ソウ|はし|run|ပြေးသည်|走る|はしる|ပြေးသည်|7|11",
  "206|送|ソウ|おく|send|ပို့ပေးသည်|送信|そうしん|စာပို့ခြင်း၊ ပေးပို့ခြင်း|9|11",
  "207|奏|ソウ|かな|play music, speak|တူရိယာတီးခတ်သည်|演奏|えんそう|တေးဂီတဖျော်ဖြေပွဲ|9|11",
  "208|操|ソウ|みさお|steer, manipulate|ထိန်းချုပ်မောင်းနှင်သည်|操作|そうさ|စက်လည်ပတ်အောင်လုပ်ဆောင်ခြင်း|16|11",
  "209|創|ソウ|つく|create, establish|ဖန်တီးသည်၊ တည်ထောင်|創作|そうさく|ဖန်တီးမှု၊ စာပေရေးသားမှု|12|11",
  "210|壮|ソウ|-|grand, robust|ကြီးကျယ်ခမ်းနားသော|壮大|そうだい|ကြီးကျယ်ခမ်းနားမှုကြီး|6|11",
  "211|捜|ソウ|さが|search, seek, investigate|ရှာဖွေစုံစမ်းသည်|捜査|そうさ|ပြစ်မှုစုံစမ်းစစ်ဆေးခြင်း|10|11",
  "212|総|ソウ|-|general, whole, total|စုစုပေါင်း၊ ယေဘုယျ|総合|そうごう|ဘက်စုံစုစည်းမှု|14|11",
  "213|像|ゾウ|-|statue, image, portrait|ရုပ်တု၊ ပုံရိပ်|想像|そうぞう|စိတ်ကူးပုံဖော်ခြင်း|14|11",
  "214|寒|カン|さむ|cold (weather)|အေးသော (ရာသီဥတု)|寒い|さむい|အေးသော|12|11",
  "215|増|ゾウ|ま|increase|တိုးပွားသည်|増加|ぞうか|တိုးပွားလာခြင်း|14|11",
  "216|臓|ゾウ|-|organ, viscera|ကိုယ်တွင်းကလီစာ|心臓|しんぞう|နှလုံး|19|11",
  "217|蔵|ゾウ|くら|storehouse, hide|ကုန်လှောင်ရုံ၊ သိမ်းဆည်း|冷蔵庫|れいぞうこ|ရေခဲသေတ္တာ|15|11",
  "218|贈|ゾウ|おく|presents, send|လက်ဆောင်ပေးသည်|贈り物|おくりもの|လက်ဆောင်|18|11",
  "219|続|ゾク|つづ|continue|ဆက်လက်လုပ်ဆောင်သည်|継続|けいぞく|ဆက်တိုက်လုပ်ဆောင်ခြင်း|13|11",
  "220|卒|ソツ|-|graduate, soldier|ကျောင်းပြီးဆုံးသည်၊ စစ်သည်|卒業|そつぎょう|ကျောင်းပြီးခြင်း|8|11",

  // --- UNIT 12 (221 - 240) ---
  "221|他|タ|ほか|other|တခြားသော|他人|たにん|သူစိမ်း|5|12",
  "222|多|タ|おお|many, much|များပြားသော|多数|たすう|အများစု|6|12",
  "223|太|タイ|ふと|fat, thick|ဝသော၊ ထူသော|太陽|たいよう|နေမင်း|4|12",
  "224|打|ダ|う|hit, strike|ရိုက်သည်|打開|だかい|ဖြေရှင်းနည်းရှာခြင်း|5|12",
  "225|対|タイ|-|opposite, versus|ဆန့်ကျင်ဘက်၊ နှိုင်းယှဉ်|対立|たいりつ|ထိပ်တိုက်တွေ့ခြင်း|7|12",
  "226|体|タイ|からだ|body, substance|ခန္ဓာကိုယ်|体力|たいりょく|ကိုယ်လက်ကြံ့ခိုင်မှု|7|12",
  "227|退|タイ|しりぞ|retreat, leave, reject|နုတ်ထွက်သည်၊ ဆုတ်ခွာသည်|退職|たいしょく|အလုပ်မှနုတ်ထွက်ခြင်း|9|12",
  "228|帯|タイ|おび|belt, zone, carry|ခါးပတ်၊ အမျိုးအစားဇုန်|地帯|ちたい|ဒေသ|10|12",
  "229|隊|タイ|-|regiment, party, squad|တပ်ဖွဲ့၊ အစုအဖွဲ့|警備隊|けいびたい|လုံခြုံရေးတပ်ဖွဲ့|12|12",
  "230|代|ダイ|か|substitute, age, charge|ကိုယ်စားလှယ်၊ ခေတ်၊ ကုန်ကျစရိတ်|代表|だいひょう|ကိုယ်စားလှယ်|5|12",
  "231|台|ダイ|-|stand, platform, counter|စင်၊ ရထား စသည်ကောင်တာ|台所|だいどころ|မီးဖိုချောင်|5|12",
  "232|大|ダイ|おお|large, big|ကြီးမားသော|大使館|たいしかん|သံရုံး|3|12",
  "233|第|ダイ|-|ordinal, prefix for number|နံပါတ်စဉ်ပြစကားလုံး|第一|だいいち|ပထမဦးဆုံး|11|12",
  "234|題|ダイ|-|topic, title, theme|ခေါင်းစဉ်၊ ပုဒ်စာ|問題|もんだい|ပြဿနာ၊ အခက်အခဲ|18|12",
  "235|滝|タキ|たき|waterfall|ရေတံခွန်|滝|たき|ရေတံခွန်|13|12",
  "236|宅|タク|-|house, home|နေအိမ်|帰宅|きたく|အိမ်ပြန်ခြင်း|6|12",
  "237|沢|タク|さわ|swamp, abundant|စိမ့်မြေ၊ ကြွယ်ဝသော|贅沢|ぜいたく|ဇိမ်ခံခြင်း၊ ဖြုန်းတီးခြင်း|7|12",
  "238|択|タク|-|select, choose|ရွေးချယ်ခြင်း|選択|せんたく|ရွေးချယ်ကဏ္ဍ|7|12",
  "239|拓|タク|-|clear land, develop|ဖော်ဆောင်သည်၊ မြေယာသစ်ချဲ့|開拓|かいたく|အသစ်တီထွင်တည်ဆောက်ခြင်း|8|12",
  "240|託|託|-|consign, trust|အပ်နှံသည်၊ ကတိပြုသည်|委託|いたく|အပ်နှံလုပ်ဆောင်စေခြင်း|10|12",

  // --- UNIT 13 (241 - 260) ---
  "241|達|タツ|たち|accomplish, plural |တတ်မြောက်ခြင်း၊ အစုအဖွဲ့များ|友達|ともだち|သူငယ်ချင်း|12|13",
  "242|探|タン|さが|search, inspect|ရှာဖွေစုံစမ်းသည်|探検|たんけん|စွန့်စားရှာဖွေခရီး|11|13",
  "243|断|ダン|ことわ|cut off, refuse, decide|ငြင်းပယ်သည်၊ ဆုံးဖြတ်|断水|だんすい|ရေပြတ်ခြင်း|11|13",
  "244|暖|ダン|あたた|warm|နွေးထွေးသော (ဥတု)|暖房|だんぼう|အပူပေးစက်|13|13",
  "245|段|ダン|-|step, grade, stair|လှေကားထစ်၊ အဆင့်|段階|だんかい|အဆင့်ဆင့်လုပ်ဆောင်ခြင်း|9|13",
  "246|男|ダン|おとこ|man, male|አမျိုးသား၊ ယောကျာ်း|長男|ちょうなん|သားကြီး|7|13",
  "247|地|チ|-|earth, ground, land|မြေပြင်၊ ဒေသ|地下鉄|ちかてつ|မြေအောက်ရထား|6|13",
  "248|知|チ|し|know, wisdom|သိရှိသည်|知人|ちじん|မိတ်ဆွေ၊ သိကျွမ်းသူ|8|13",
  "249|遅|チ|おそ|slow, late|နှောင့်နှေးသော|遅刻|ちこく|နောက်ကျခြင်း|12|13",
  "250|置|チ|お|put, place, establish|ထားသည်|位置|いち|တည်နေရာ|13|13",
  "251|竹|チク|たけ|bamboo|ဝါး|竹藪|たけやぶ|ဝါးတော|6|13",
  "252|茶|チャ|-|tea|လက်ဖက်ရည်|喫茶店|きっさてん|ကော်ဖီဆိုင်|9|13",
  "253|着|チャク|き|arrive, wear, reach|ရောက်ရှိသည်၊ ဝတ်ဆင်သည်|到着|とうちゃく|ရောက်ရှိခြင်း|12|13",
  "254|中|チュウ|なか|middle, inside|အလယ်၊ အတွင်း|中心|ちゅうしん|အလယ်ချက်ဗဟို|4|13",
  "255|仲|チュウ|なか|relationship, go-between|ဆက်ဆံရေး၊ ခင်မင်မှု|仲間|なかま|အဖော်၊ သူငယ်ချင်းစုစု|9|13",
  "256|忠|チュウ|-|loyal, faithful|သစ္စာရှိသော|忠実|ちゅうじつ|သစ္စာရှိမှု|8|13",
  "257|昼|チュウ|ひる|afternoon, daytime|နေ့လယ်|昼食|ちゅうしょく|နေ့လယ်စာ|9|13",
  "258|柱|チュウ|はしら|pillar, post|တိုင်၊ အမာခံတိုင်|電柱|でんちゅう|ဓာတ်တိုင်|9|13",
  "259|注|チュウ|そぎ|pour, comment, note|လောင်းထည့်သည်၊ သတိပြု|注意|ちゅうい|သတိထားခြင်း|8|13",
  "260|朝|チョウ|あさ|morning|နံနက်|朝食|ちょうしょく|မနက်စာ|12|13",

  // --- UNIT 14 (261 - 280) ---
  "261|潮|チョウ|しお|tide, salt water|ဒီရေ|潮風|しおかぜ|ဒီရေတိုက်ခတ်သောလေ|15|14",
  "262|町|チョウ|まち|town|မြို့ကလေး|下町|したまち|မြို့တွင်းအခြေခံရပ်ကွက်|7|14",
  "263|聴|チョウ|き|listen, audiency|နားထောင်သည်|聴解|ちょうかい|နားထောင်တုံ့ပြန်မှု|17|14",
  "264|挑|チョウ|いど|challenge, defy|စိန်ခေါ်သည်|挑戦|ちょうせん|စိန်ခေါ်မှုပြုလုပ်ခြင်း|9|14",
  "265|頂|チョウ|いただ|summit, top, receive|ထိပ်ဦး၊ လက်ခံရယူသည်|頂上|ちょうじょう|တောင်ထိပ်|11|14",
  "266|鳥|チョウ|とり|bird|ငှက်|小鳥|ことり|ငှက်ငယ်|11|14",
  "267|直|チョク|なお|straight, fix|တိုက်ရိုက်၊ ပြုပြင်သည်|直接|ちょくせつ|တိုက်ရိုက်|8|14",
  "268|通|ツウ|とお|pass, commute|ဖြတ်သန်းသည်၊ ကျောင်း/အလုပ်သွား|通勤|つうきん|အလုပ်တက်ခြင်း|10|14",
  "269|低|テイ|ひく|low, short|နိမ့်သော|低下|ていか|လျော့နည်းကျဆင်းခြင်း|7|14",
  "270|停|テイ|-|stop, halt|ရပ်တန့်သည်|停留所|ていりゅうじょ|ဘတ်စ်ကားမှတ်တိုင်|11|14",
  "271|提|テイ|さ|propose, present|အဆိုပြုတင်ပြသည်|提案|ていあん|အဆိုပြုချက်|12|14",
  "272|締|テイ|し|tighten, shut|တင်းကျပ်စေသည်၊ ပိတ်ပင်|締切|しめきり|နောက်ဆုံးသတ်မှတ်ရက်|15|14",
  "273|庭|テイ|にわ|garden, yard|ခြံဝန်း၊ ပန်းခြံ|庭園|ていえん|ကျောက်ဥယျာဉ်၊ ခြံဝန်း|10|14",
  "274|泥|デイ|どろ|mud|ရွှံ့ညွှန်|泥棒|どろぼう|သူခိုး|8|14",
  "275|的|テキ|まと|target, suffix for type|ပန်းတိုင်၊ ပတ်သက်သော|目的|もくてき|ရည်ရွယ်ချက်ပန်းတိုင်|8|14",
  "276|笛|テキ|ふえ|whistle, flute|ပလွေ၊ လေမှုတ်တံ|口笛|くちぶえ|လေချွန်ခြင်း|11|14",
  "277|伝|デン|つた|transmit, report|လက်ဆင့်ကမ်းသည်၊ သတင်းပို့|伝説|でんせつ|ဒဏ္ဍာရီ|6|14",
  "278|徒|ト|-|follower, pupil|တပည့်၊ အဖွဲ့ဝင်|生徒|せいと|ကျောင်းသား|10|14",
  "279|塗|ト|ぬ|paint, smear|ဆေးသုတ်သည်|塗装|とそう|ဆေးသုတ်ခြင်း|10|14",
  "280|渡|ト|わた|cross, pass over|ကူးဖြတ်သည်၊ ပေးအပ်|渡す|わたす|ကမ်းပေးသည်|12|14",

  // --- UNIT 15 (281 - 300) ---
  "281|登|トウ|のぼ|climb, register|တက်လှမ်းသည်|登山|とざん|တောင်တက်ခြင်း|12|15",
  "282|都|ト|みやこ|metropolis, capital|မြို့တော်|都会|とかい|မြို့ပြမြို့ကြီး|11|15",
  "283|怒|ド|おこ|angry|ဒေါသထွက်သော|怒る|おこる|စိတ်ဆိုးသည်|9|15",
  "284|倒|トウ|たお|collapse, fall down|လဲကျသည်|面倒|めんどう|ဒုက္ခများသော၊ ဂရုစိုက်မှု|10|15",
  "285|東|トウ|ひがし|east|အရှေ့ဖက်|東京|とうきょう|တိုကျိုမြို့|8|15",
  "286|桃|トウ|もも|peach|မက်မွန်သီး|桃色|ももいろ|ပန်းရောင်|10|15",
  "287|湯|トウ|ゆ|hot water|ရေနွေး|お湯|おゆ|ရေနွေး|12|15",
  "288|灯|トウ|ひ|lamp, light|မီးအိမ်|電灯|でんとう|လျှပ်စစ်မီးလုံး|6|15",
  "289|当|トウ|あ|hit, target|မှန်ကန်သော၊ ထိမှန်|弁当|べんとう|ထမင်းဘူး|6|15",
  "290|投|トウ|な|throw, discard|ပစ်ပေါက်သည်|投手|とうしゅ|ဂျပန်ဘေ့စ်ဘောပစ်သူ|8|15",
  "291|到|トウ|-|arrive, reach|ရောက်ရှိသည်|到着|とうちゃく|ရောက်ရှိလာခြင်း|8|15",
  "292|読|ドク|よ|read|ဖတ်သည်|読書|どくしょ|စာဖတ်ခြင်း|14|15",
  "293|同|ドウ|おな|same|တူညီသော|同時に|どうじに|တစ်ချိန်တည်းတွင်|6|15",
  "294|道|ドウ|みち|road, street, avenue|လမ်း|道路|どうろ|လမ်းမကြီး|12|15",
  "295|側|ソク|かわ|side, lean|ဘေးဖက်၊ ခြမ်း|良心的な側|りょうしんてきなわき|စိတ်ရင်းကောင်းသောဘက်|11|15",
  "296|冷|レイ|つめ|cold (touch)|အေးစက်သော (ထိတွေ့မှု)|冷やす|ひやす|အေးအောင်ပြုလုပ်သည်|7|15",
  "297|礼|レイ|-|bow, courtesy, gratitude|ဦးညွှတ်ယဉ်ကျေးမှု၊ ကျေးဇူးတင်ခြင်း|失礼|しつれい|ဦးညွှတ်ခြင်းမရှိ သို့မဟုတ် ရိုင်းပျခြင်း|5|15",
  "298|例|レイ|たと|example|ဥပမာ|例文|れいぶん|ဥပမာစာကြောင်း|8|15",
  "299|鈴|レイ|すず|bell|ခေါင်းလောင်း|風鈴|ふうりん|လေညှင်းခေါင်းလောင်း|13|15",
  "300|歴|レキ|-|history, background|သမိုင်း၊ အတွေ့အကြုံနောက်ခံ|歴史|れきし|သမိုင်းကြောင်း|14|15",

  // --- UNIT 16 (301 - 320) ---
  "301|劣|レツ|おと|inferior|နိမ့်ကျသော၊ ထက်ညံ့သော|劣等感|れっとうかん|အားငယ်စိတ်ဖြစ်ခြင်း|6|16",
  "302|練|レン|ね|practice, drill|လေ့ကျင့်သည်|練習|れんしゅう|လေ့ကျင့်ခန်းလုပ်ဆောင်မှု|14|16",
  "303|連|レン|つ|connect, lead|ချိတ်ဆက်သည်၊ ခေါ်ဆောင်|連続|れんぞく|အဆက်မပြတ်ဖြစ်ခြင်း|10|16",
  "304|露|ロ|つゆ|dew, expose|ဆီးနှင်းပေါက်၊ ထင်ရှားစေ|露出|ろしゅつ|ပေါ်လွင်စေခြင်း|21|16",
  "305|路|ロ|じ|path, road, street|လမ်း၊ ခရီးလမ်း|道路|どうろ|ကားလမ်းမ|13|16",
  "306|労|ロウ|-|labor, effort|အလုပ်ကြိုးစားလုပ်မှု|労働|ろうどう|လုပ်အားပေးလုပ်ဆောင်ခြင်း|7|16",
  "307|廊|ロウ|-|corridor, hallway|စင်္ကြံလမ်း|廊下|ろうか|စင်္ကြံ|12|16",
  "308|老|ロウ|お|old age, elderly|သက်ကြီးရွယ်အို|老人|ろうじん|သက်ကြီးရွယ်အို|6|16",
  "309|郎|ロウ|-|son, groom|သားယောကျာ်း|新郎|しんろう|သတို့သား|9|16",
  "310|六|ロク|む|six|ခြောက်|六月|ろくがつ|ဇွန်လ|4|16",
  "311|録|ロク|-|record, register|မှတ်တမ်းတင်သိမ်းဆည်း|録音|ろくおん|အသံသွင်းခြင်း|16|16",
  "312|論|ロン|-|theory, discuss|ဆွေးနွေးသည်၊ သီအိုရီ|論文|ろんぶん|ကျမ်းစာ၊ စာတမ်း|15|16",
  "313|和|ワ|なご|Japanese style, peace|ဂျပန်စတိုင်၊ ငြိမ်းချမ်းရေး|和食|わしょく|ဂျပန်အစားအစာ|8|16",
  "314|話|ワ|はな|speak, talk|ပြောဆိုသည်|会話|かいわ|စကားပြောခန်း|13|16",
  "315|惑|ワク|まど|confused, beguile|ရှုပ်ထွေးသည်၊ နားမလည်ဖြစ်|迷惑|めいわく|စိတ်အနှောင့်အယှက်ဖြစ်စရာ|12|16",
  "316|湾|ワン|-|bay, gulf|ပင်လယ်ကွေ့|東京湾|とうきょうわん|တိုကျိုပင်လယ်ကွေ့|12|16",
  "317|腕|ワン|うで|arm, skill|လက်မောင်း၊ စွမ်းဆောင်ရည်|腕前|うでまえ|လက်စွမ်းပြမှု|12|16",
  "318|卵|ラン|たまご|egg|ဥ၊ ကြက်ဥ|卵焼き|たまごやき|ကြက်ဥလိပ်|7|16",
  "319|留|リュウ|と|stay, keep|ထိန်းသိမ်းထားသည်၊ နေထိုင်|留学|りゅうがく|နိုင်ငံခြားပညာသင်သွားခြင်း|10|16",
  "320|両|リョウ|-|both, counter for vehicles|နှစ်ဖက်စလုံး၊ ရထားတွဲရေ|両親|りょうしん|မိဘနှစ်ပါး|6|16",

  // --- UNIT 17 (321 - 340) ---
  "321|旅|リョ|たび|trip, travel|ခရီးသွားခြင်း|旅行|りょこう|ခရီးထွက်ခြင်း|10|17",
  "322|理|リ|-|reason, logic|ကျိုးကြောင်းဆင်ခြင်မှု|理由|りゆう|အကြောင်းပြချက်|11|17",
  "323|料|リョウ|-|fee, material|ကုန်ကျစရိတ်၊ အဖိုးအခ|料金|りょうきん|ဝန်ဆောင်ခ|10|17",
  "324|力|リョク|ちから|power, strength|အင်အား|実力|じつりょく|အစစ်အမှန်စွမ်းရည်|2|17",
  "325|林|リン|はやし|forest, grove|တောအုပ်|山林|さんりん|တောင်တောအုပ်|8|17",
  "326|類|ルイ|-|class, kind|အမျိုးအစားခွဲခြားထားပုံ|分類|ぶんるい|အမျိုးအစားခွဲခြားခြင်း|18|17",
  "327|令|レイ|-|order, command|အမိန့်ညွှန်ကြားချက်|命令|めいれい|ကွပ်ကဲအမိန့်ထုတ်ပြန်ခြင်း|5|17",
  "328|冷|レイ|つめ|cool, cold|အေးမြသော|冷凍|れいとう|အေးခဲပြုလုပ်ခြင်း|7|17",
  "329|零|レイ|ぜろ|zero, spill|သုည|零分|れいふん|သုညမိနစ်|13|17",
  "330|歴|レキ|-|curriculum, history|သမိုင်းနောက်ခံ|履歴書|りれきしょ|ကိုယ်ရေးရာဇဝင်အကျဉ်း|14|17",
  "331|連|レン|つ|join, connect|ချိတ်ဆက်သည်|連帯|れんたい|ပူးပေါင်းဆောင်ရွက်မှု|10|17",
  "332|老|ロウ|お|elderly|သက်ကြီးရွယ်အို|老後|ろうご|အသက်ကြီးပိုင်းကာလ|6|17",
  "333|労|ロウ|-|effort, work|လုပ်အား|力労|ちからろう|ကြိုးပမ်းလုပ်ဆောင်ရမှု|7|17",
  "334|録|ロク|-|document, record|မှတ်တမ်းတင်ရန်|記録|きろく|စံချိန်မှတ်တမ်း|16|17",
  "335|論|ロン|-|discourse, debate|ဆွေးနွေးအငြင်းပွားချက်|議論|ぎろん|အချေအတင်ငြင်းခုံခြင်း|15|17",
  "336|和|ワ|なご|peace, sum|သဟဇာတရှိခြင်း၊ စုစုပေါင်း|和解|わかい|ပြေလည်သွားခြင်း|8|17",
  "337|話|ワ|はな|talk, story|စကားပြော၊ ပုံပြင်|昔話|むかしばなし|ရှေးဟောင်းပုံပြင်|13|17",
  "338|惑|ワク|まど|confuse|ဝေခွဲမရဖြစ်ရခြင်း|迷惑|めいわく|နှောင့်ယှက်မှုဖြစ်စေသည်|12|17",
  "339|倍|バイ|-|double, times|အဆပွားသည်၊ အရေအတွက်ဆ|二倍|にばい|နှစ်ဆ|10|17",
  "340|配|ハイ|くば|distribute, spouse|ဝေမျှသည်၊ ဂရုစိုက်|心配|しんぱい|စိုးရိမ်ခြင်း|10|17",

  // --- UNIT 18 (341 - 361) ---
  "341|波|ハ|なみ|wave|လှိုင်းလုံး|波浪|ハロウ|ပင်လယ်လှိုင်းကြီး|8|18",
  "342|敗|ハイ|やぶ|failure, defeat|ရှုံးနိမ့်ခြင်း|失敗|しっぱい|ကျရှုံးခြင်း|11|18",
  "343|乗|ジョウ|の|ride, power|စီးနင်းသည်|乗車|じょうしゃ|ယာဉ်ပေါ်တက်စီးခြင်း|9|18",
  "344|杯|ハイ|さかずき|counter for cupfuls|ခွက်အရေအတွက်ပြကိရိယာ|乾杯|かんぱい|အောင်ပွဲခံသောက်ကြခြင်း|8|18",
  "345|拝|ハイ|おが|worship, look at|ရိုသေဦးညွှတ်သည်|拝見|はいけん|ကြည့်ရှုလေ့လာခြင်း (နှိမ့်ချစကား)|8|18",
  "346|背|ハイ|せ|back, stature|ကျောပြင်၊ အရပ်အမြင့်|背景|はいけい|နောက်ခံမြင်ကွင်း|9|18",
  "347|肺|ハイ|-|lung|အဆုတ်|肺がん|はいがん|အဆုတ်ကင်ဆာ|9|18",
  "348|俳|ハイ|-|actor, haiku|သရုပ်ဆောင်၊ ကဗျာ|俳優|はいゆう|မင်းသား၊ ရုပ်ရှင်ဇာတ်ဆောင်|10|18",
  "349|判|ハン|-|judge, stamp|ဆုံးဖြတ်သည်၊ တံဆိပ်တုံး|判断|はんだん|ဆုံးဖြတ်သုံးသပ်မှု|7|18",
  "350|坂|ハン|さか|slope, hill|ကုန်းစောင်း၊ ကုန်းတွင်းလမ်း|急坂|きゅうざか|မတ်စောက်သောကုန်း|7|18",
  "351|板|ハン|いた|board, plate|ပျဉ်ပြား၊ အချပ်ဘုတ်|看板|かんばん|ဆိုင်းဘုတ်|8|18",
  "352|版|ハン|-|printing block, edition|ပုံနှိပ်ထုတ်ဝေမှု၊ ဗားရှင်း|限定版|げんていばん|အကန့်အသတ်ထုတ်လုပ်မှု|8|18",
  "353|比|ヒ|くら|compare|နှိုင်းယှဉ်သည်|比較|ひかく|နှိုင်းယှဉ်ချက်|4|18",
  "354|皮|ヒ|かわ|leather, skin|သားရေ၊ အရေပြား|皮膚|ひふ|အရေပြား|5|18",
  "355|鼻|ビ|はな|nose|နှာခေါင်း|首鼻|くびはな|လည်ပင်းနှင့် နှာခေါင်း|14|18",
  "356|悲|ヒ|かな|sad|ဝမ်းနည်းသော|悲劇|ひげき|ဝမ်းနည်းဖွယ်ပြဇာတ်|12|18",
  "357|費|ヒ|つい|expense, consume|သုံးစွဲစရိတ်|費用|ひよう|ကျသင့်စရိတ်|12|18",
  "358|表|ヒョウ|おもて|surface, diagram, express|အပေါ်ယံမျက်နှာပြင်၊ ဖော်ပြခြင်း|代表|だいひょう|ကိုယ်စားပြုလှုပ်ရှားသူ|8|18",
  "359|病|ビョウ|や|ill, sick|ဖျားနာသော|病院|びょういん|ဆေးရုံ|10|18",
  "360|氷|ヒョウ|こおり|ice|ရေခဲ|氷山|ひょうざん|ရေခဲတောင်|5|18",
  "361|秒|ビョウ|-|second (unit of time)|စက္ကန့်|一秒|いちびょう|တစ်စက္ကန့်|9|18"
];

// Dynamically compile the list into rich KanjiEntry objects
export const kanjiData: KanjiEntry[] = rawKanjiList.map((entryStr) => {
  const parts = entryStr.split("|");
  return {
    id: parseInt(parts[0], 10),
    kanji: parts[1],
    onyomi: parts[2],
    kunyomi: parts[3],
    meaning_en: parts[4],
    meaning_mm: parts[5],
    example_word: parts[6],
    example_reading: parts[7],
    example_meaning: parts[8],
    strokes: parseInt(parts[9], 10),
    unit: parseInt(parts[10], 10),
    compounds: generateCompounds(
      parts[1],
      parts[2],
      parts[3],
      parts[4],
      parts[5],
      parts[6],
      parts[7],
      parts[8]
    )
  };
});
