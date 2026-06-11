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
    { word: "戸惑う", reading: "とまどう", meaning_mm: "စိတ်ရှုပ်ထွေးသည်", meaning_en: "be bewildered" },
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
    { word: "肺がん", reading: "はいがん", meaning_mm: "အဆုတ်کင်ဆာ", meaning_en: "lung cancer" },
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
  "1|丁|チョウ|ひおと|town block, counter for sheets|ကုဒ်သင်္ကေတ၊ အတုံးအခဲ၊ စာရွက်ချပ်ရေတွက်ကိရိယာ|丁寧|ていねい|ယဉ်ကျေးသိမ်မွေ့ခြင်း|2|1",
  "2|両|リョウ|-|both, counter for carriages|နှစ်ဦးနှစ်ဖက်၊ ရထားတွဲရေတွက်ကိရိယာ|両親|りょうしん|မိဘနှစ်ပါး|6|1",
  "3|丸|ガン|まる|round, circle|အဝိုင်း၊ လုံးဝန်းသော|丸い|まるい|ဝိုင်းသော|3|1",
  "4|予|ヨ|-|beforehand, previous|ကြိုတင်၍|予定|よてい|အစီအစဉ်|4|1",
  "5|争|ソウ|あらそ|contend, dispute|ယှဉ်ပြိုင်သည်၊ တိုက်ခိုက်သည်|争う|あらそう|ယှဉ်ပြိုင်သည်|6|1",
  "6|交|コウ|まじ|mix, intersect, exchange|နှီးနှောသည်၊ ကူးလူးဆက်ဆံသည်|交通|こうつう|သွားလာဆက်သွယ်ရေး|6|1",
  "7|他|タ|ほか|other, another|အခြား|他人|たにん|သူစिမ်း|5|1",
  "8|付|フ|つ|attach, adhere|ကပ်ထားသည်၊ အတူတူပါဝင်သည်|受付|うけつけ|ဧည့်ကြိုဌာန|5|1",
  "9|令|レイ|-|command, order|အမိန့်ညွှန်ကြားချက်|命令|めいれい|ကွပ်ကဲအမိန့်ထုတ်ပြန်ခြင်း|5|1",
  "10|仲|チュウ|なか|relationship, go-between|သူငယ်ချင်းဆက်ဆံရေး၊ ကြားခံ|仲間|なかま|အပေါင်းအဖော်|6|1",
  "11|伝|デン|つた|transmit, report|လက်ဆင့်ကမ်းသည်၊ သတင်းပို့|手伝う|てつだう|ကူညီသည်|6|1",
  "12|位|イ|くらい|rank, position, about|အဆင့်အတန်း၊ ခန့်မှန်းခြေ|位置|いち|တည်နေရာ|7|1",
  "13|例|レイ|たと|example|ဥပမာ|例えば|たとえば|ဥပမာအားဖြင့်|8|1",
  "14|係|ケイ|kaka|connection, person in charge|သက်ဆိုင်သူ၊ တာဝန်ခံ|関係|かんけい|ပတ်သက်မှု|9|1",
  "15|信|シン|-|trust, believe|ယုံကြည်သည်|信用|しんよう|ယုံကြည်စိတ်ချမှု|9|1",
  "16|倉|ソウ|くら|warehouse, storehouse|ကုန်လှောင်ရုံ|倉庫|そうこ|ဂိုဒေါင်|10|1",
  "17|倍|バイ|-|double, times|အဆပွားသည်၊ အရေအတွက်ဆ|二倍|にばい|နှစ်ဆ|10|1",
  "18|候|コウ|そうろう|climate, season, candidate|ရာသီဥတု、အလားအလာရှိသူ|気候|きこう|ရာသီဥတု|10|1",
  "19|停|テイ|-|stop, halt|ရပ်တန့်သည်|停留所|ていりゅうじょ|ဘတ်စ်ကားမှတ်တိုင်|11|1",
  "20|健|ケン|すこ|healthy, strong|ကျန်းမာသော၊ သန်စွမ်းသော|健康|けんこう|ကျန်းမာရေး|11|1",

  // --- UNIT 2 (21 - 40) ---
  "21|側|ソク|かわ|side, lean|ဘေးဖက်၊ ခြမ်း|右側|みぎがわ|ညာဘက်ခြမ်း|11|2",
  "22|億|オク|-|hundred million|သန်းတစ်ရာ|一億|いちおく|သန်း၁၀၀|15|2",
  "23|兆|チョウ|きざ|trillion, omen|တစ်ထရီလီယံ၊ နိမိတ်လက္ခဏာ|兆し|きざし|အရိပ်အယောင်နိမိတ်|6|2",
  "24|児|ジ|こ|child, infant|ကလေးသူငယ်|児童|じどう|ကလေးသူငယ်|7|2",
  "25|全|ゼン|すべ|all, whole, complete|အားလုံး၊ ပြည့်စုံသော|全部|ぜんぶ|အားလုံး|6|2",
  "26|公|コウ|おおやけ|public, official|အများပြည်သူဆိုင်ရာ|公園|こうえん|ပန်းခြံ|4|2",
  "27|共|キョウ|とも|together, both|အတူတူ၊ နှစ်ဖက်စလုံး|共同|きょうどう|ဘုံပူးပေါင်းမှု|6|2",
  "28|兵|ヘイ|つわもの|soldier, private|စစ်သား|兵士|へいし|စစ်သား|7|2",
  "29|具|グ|-|tool, ingredient|ကိရိယာတန်ဆာပလာ၊ ပါဝင်ပစ္စည်း|道具|どうぐ|ကိရိယာ|8|2",
  "30|典|テン|-|code, ceremony, classic|အခမ်းအနား၊ ကျမ်းစာ|古典|こてん|ရှေးဟောင်းဂန္တဝင်|8|2",
  "31|内|ナイ|うち|inside, within|အတွင်းဘက်|国内|こくない|ပြည်တွင်း|4|2",
  "32|冷|レイ|つめ|cold (touch)|အေးစက်သော (ထိတွေ့မှု)|冷蔵庫|れいぞうこ|ရေခဲသေတ္တာ|7|2",
  "33|刀|トウ|かたな|sword, knife|ဓား|日本刀|にほんとう|ဂျပန်ဓား|2|2",
  "34|列|レツ|-|row, line, queue|အတန်း၊ တန်းစီခြင်း|列車|レっしゃ|ရထား|6|2",
  "35|初|ショ|はじ|first, beginning|ပထမဆုံး၊ အစဦး|初めて|はじめて|ပထမဆုံးအကြိမ်|7|2",
  "36|利|リ|き|profit, advantage, benefit|အကျိုးအမြတ်|利用|りよう|အသုံးချခြင်း|7|2",
  "37|刷|サツ|す|print, brush|ပုံနှိပ်ခြင်း|印刷|いんさつ|ပုံနှိပ်ခြင်း|8|2",
  "38|副|フク|-|vice-, assistant|ဒုတိယ၊ အရန်|副社長|ふくしゃちょう|ဒုတိယဥက္ကဋ္ဌ|11|2",
  "39|功|コウ|-|merit, success, achievement|အောင်မြင်မှုစွမ်းဆောင်ရည်|成功|せいこう|အောင်မြင်မှု|5|2",
  "40|加|カ|くわ|add, include, join|ထည့်သွင်းသည်|参加|さんか|ပါဝင်လှုပ်ရှားမှု|5|2",

  // --- UNIT 3 (41 - 60) ---
  "41|助|ジョ|たす|help, rescue, assist|ကူညီသည်|助ける|たすける|ကူညီကယ်ဆယ်သည်|7|3",
  "42|努|ド|つと|toil, diligent, make effort|ကြိုးစားအားထုတ်သည်|努力|どりょく|ကြိုးစားအားထုတ်မှု|7|3",
  "43|労|ロウ|-|labor, effort, toil|လုပ်အား၊ အလုပ်လုပ်ကိုင်ခြင်း|労働|ろうどう|လုပ်အားပေးလုပ်ကိုင်ခြင်း|7|3",
  "44|勇|ユウ|いさ|courage, brave|သတ္တိရှိသော|勇敢|ゆうかん|သတ္တိပြောင်မြောက်သော|9|3",
  "45|勝|ショウ|か|win, victory|နိုင်သည်|勝つ|かつ|အနိုင်ရသည်|12|3",
  "46|包|ホウ|つつ|wrap, pack|ထုပ်ပိုးသည်|包む|つつむ|ထုပ်ပိုးသည်|5|3",
  "47|卒|ソツ|-|graduate, soldier|ဘွဲ့ရသည်|卒業|そつぎょう|ကျောင်းပြီးခြင်း|8|3",
  "48|協|キョウ|-|co-operate, agree|ပူးပေါင်းဆောင်ရွက်သည်|協力|きょうりょく|ပူးပေါင်းဆောင်ရွက်ခြင်း|8|3",
  "49|単|タン|-|simple, single, individual|ရိုးရှင်းသော၊ တစ်ခုတည်းသော|簡単|かんたん|ရိုးရှင်းလွယ်ကူသော|9|3",
  "50|博|ハク|-|doctor, exhibition|ပါရဂူ၊ ဗဟုသုတကျယ်ပြန့်သော|博士|はかせ|ပါရဂူဘွဲ့ရ|12|3",
  "51|印|イン|しるし|mark, stamp, seal|အမှတ်အသား၊ တံဆိပ်|印刷|いんさつ|ပုံနှိပ်ခြင်း|6|3",
  "52|原|ゲン|はら|original, meadow, field|မူလအစ၊ ကွင်းပြင်|原因|げんいん|အကြောင်းရင်း|10|3",
  "53|参|サン|まい|participate, visit, three|ပါဝင်လှုပ်ရှားသည်၊ သွားရောက်သည်|参加|さんか|ပါဝင်ခြင်း|8|3",
  "54|反|ハン|そ|oppose, anti-, bend|ဆန့်ကျင်ဘက်|反対|はんたい|ဆန့်ကျင်ကန့်ကွက်ခြင်း|4|3",
  "55|取|シュ|to|take, fetch|ယူသည်|取る|とる|ယူသည်|8|3",
  "56|受|ジュ|う|receive, accept|လက်ခံရရှိသည်|受付|うけつけ|ဧည့်ကြိုဌာန|8|3",
  "57|史|シ|-|history, chronicle|သမိုင်း|歴史|れきし|သမိုင်းကြောင်း|5|3",
  "58|号|ゴウ|-|number, signal|နံပါတ်၊ သင်္ကေတ|番号|ばんごう|နံပါတ်|5|3",
  "59|司|シ|-|director, official|တာဝန်ယူညွှန်ကြားသူ|司会|しかい|အခမ်းအနားမှူး|5|3",
  "60|各|カク|おのおの|each, every|တစ်ခုစီတိုင်း|各自|かくじ|အသီးသီး|6|3",

  // --- UNIT 4 (61 - 80) ---
  "61|向|コウ|む|face, orient, trend|မျက်နှာမူသည်၊ ဦးတည်သည်|向こう|むこう|ဟိုဘက်ခြမ်း|6|4",
  "62|君|クン|きみ|ruler, you|မင်း၊ နင်|君|きみ|မင်း|7|4",
  "63|告|コク|つ|announce, inform|ကြေညာသည်၊ သတင်းပေးသည်|報告|ほうこく|အစီရင်ခံစာတင်ပြခြင်း|7|4",
  "64|周|シュウ|まわ|circuit, wrap around|ပัดပတ်လည်|周囲|しゅうい|ပတ်ဝန်းကျင်|8|4",
  "65|命|メイ|いのち|life, destiny, command|အသက်၊ အသက်ပေးရွေးချယ်မှု|生命|せいめい|သက်ရှိအသက်ဇီဝ|8|4",
  "67|和|ワ|なご|peace, harmony, Japanese|ငြိမ်းချမ်းရေး၊ ဂျပန်စတိုင်|平和|へいわ|ငြิမ်းချမ်းရေး|8|4",
  "68|唱|ショウ|とな|chant, recite, yell|ရွတ်ဆိုသည်၊ အဆိုတင်သွင်း|合唱|がっしょう|သံပြိုင်သီဆိုခြင်း|11|4",
  "69|商|ショウ|あきな|commerce, trade, merchant|ကုန်သွယ်မှုပြုသည်၊ အရောင်းအဝယ်|商品|しょうひん|ကုန်ပစ္စည်း|11|4",
  "70|喜|キ|よろこ|rejoice, pleasure|ဝမ်းမြောက်သည်|喜ぶ|よろこぶ|ဝမ်းသာရွှင်လန်းသည်|12|4",
  "71|器|キ|うつわ|vessel, container, tool|ခွက်ခြောက်၊ ကိရိယာတန်ဆာပလာ|食器|しょっき|အစားအသောက်သုံးပန်းကန်ခွက်ယောက်|15|4",
  "72|囲|イ|かこ|surround, enclose|ဝန်းရံထားသည်|周囲|しゅうい|ပတ်ပတ်လည်|7|4",
  "73|固|コ|かた|hard, solid, firm|မာကျောသော၊ ခိုင်မာသော|固定|こてい|သတ်မှတ်ငြိမ်သက်စေခြင်း|8|4",
  "74|園|エン|その|garden, park|ပန်းခြံဥယျာဉ်|動物園|どうぶつえん|တိရစ္ဆာန်ရုံ|13|4",
  "75|坂|ハン|さか|slope, incline|ကုန်းစောင်းလမ်း|坂道|さかみち|ကုန်းလမ်း|7|4",
  "76|型|ケイ|かた|model, type, format|ပုံစံ၊ ကဏ္ဍ|大型|おおがた|အရွယ်အစားကြီးမားသောပုံစံ|9|4",
  "77|塩|エン|しお|salt|ဆား|塩分|えんぶん|ဆားဓာတ်ပါဝင်မှု|13|4",
  "78|士|シ|-|gentleman, scholar, samurai|ပညာတတ်၊ လူကြီးလူကောင်း|紳士|しんし|လူကြီးလူကောင်း|3|4",
  "79|変|ヘン|か|change, strange|ပြောင်းလဲသည်၊ ထူးဆန်းသော|変化|へんか|အပြောင်းအလဲ|9|4",
  "80|夫|フ|おっと|husband, man|ခင်ပွန်း|夫婦|ふうふ|ဇနီးမောင်နှံ|4|4",

  // --- UNIT 5 (81 - 100) ---
  "81|央|オウ|-|center, middle|အလယ်ဗဟို|中央|ちゅうおう|ဗဟိုရပ်ကွက်|5|5",
  "82|失|シツ|うし|lose, mistake|ဆုံးရှုံးသည်၊ လွဲချော်|失敗|しっぱい|ကျရှုံးခြင်း|5|5",
  "83|委|イ|ゆだ|committee, entrust|ကော်မတီဝင်၊ အပ်နှံသည်|委員会|いいんかい|ကော်မတီဖွဲ့စည်းမှု|8|5",
  "84|季|キ|-|season|ရာသီဥတု|季節|きせつ|ရာသီဥတု|8|5",
  "85|孫|ソン|まご|grandchild|မြေး|子孫|しそん|မျိုးဆက်သစ်|10|5",
  "86|守|シュ|ままもる|protect, obey, guard|ကာကွယ်စောင့်ရှောက်သည်|守る|まもる|ကာကွယ်သည်|6|5",
  "87|完|カン|-|perfect, complete|ပြီးပြည့်စုံသော|完全|かんぜん|ပြည့်စုံကောင်းမွန်သော|7|5",
  "88|官|カン|-|government official, office|အစိုးရအရာရှိ|警官|けいかん|ရဲအရာရှိ|8|5",
  "89|定|テイ|さだ|decide, fix, establish|定ငြိမ်သတ်မှတ်သည်|予定|よてい|အစီအစဉ်|8|5",
  "90|実|ジツ|み|real, truth, fruit|လက်တွေ့၊ အမှန်စင်စစ်|実現|じつげん|လက်တွေ့အကောင်အထည်ဖော်ခြင်း|8|5",
  "91|客|キャク|-|guest, customer|ဧည့်သည်၊ ဝယ်သူ|乗客|じょうきゃく|ခရီးသည်|9|5",
  "92|宮|キュウ|miya|palace, shrine|နန်းတော်၊ ဘုရားကျောင်း|宮殿|きゅうでん|နန်းတော်|10|5",
  "93|害|ガイ|-|harm, damage|ထိခိုက်ပျက်စီးမှု|被害|ひがい|ထိခိုက်ပျက်စီးဆုံးရှုံးမှု|10|5",
  "94|宿|シュク|やど|inn, lodging, dwelling|တည်းခိုခန်း၊ အိမ်စာ|宿題|しゅくだい|အိမ်စာ|11|5",
  "95|察|サツ|-|inspect, guess, police|စစ်ဆေးသည်၊ ရိပ်မိသည်|警察|けいさつ|ရဲတပ်ဖွဲ့|14|5",
  "96|寺|ジ|てら|temple|ဘုန်းကြီးကျောင်း|お寺|おてら|ဘုရားကျောင်း|6|5",
  "97|対|タイ|-|oppose, versus, pair|ဆန့်ကျင်ဘက်၊ နှင့်ပတ်သက်၍|反対|はんたい|ဆန့်ကျင်ခြင်း|7|5",
  "98|局|キョク|-|bureau, office, station|ရုံးဌာန၊ အပိုင်းခန်း|郵便局|ゆうびんきょく|စာတိုက်|7|5",
  "99|岩|ガン|いわ|rock, crag|ကျောက်တောင်ခြောက်|岩石|がんせき|ကျောက်တုံးကျောက်ခဲ|8|5",
  "100|岸|ガン|きし|coast, shore|ကမ်းခြေ|海岸|かいがん|ပင်လယ်ကမ်းခြေ|8|5",

  // --- UNIT 6 (101 - 120) ---
  "101|島|トウ|しま|island|ကျွန်း|半島|はんとう|ကျွန်းဆွယ်|10|6",
  "102|州|シュウ|す|state, province, sandbar|ပြည်နယ်|九州|きゅうしゅう|ကျူရှူးပြည်နယ်|6|6",
  "103|巣|ソウ|す|nest, hive|အသိုက်၊ တွင်း|鳥の巣|とりのす|ငှက်သိုက်|13|6",
  "104|差|サ|sa|difference, distinction|ခြားနားချက်|差別|さべつ|ခွဲခြားဆက်ဆံခြင်း|10|6",
  "105|希|キ|-|hope, rare, desire|မျှော်လင့်ချက်|希望|きぼう|မျှော်လင့်ချက်|7|6",
  "106|席|セキ|-|seat|ထိုင်ခုံ|出席|しゅっせき|တက်ရောက်ခြင်း|10|6",
  "107|帯|タイ|おび|belt, band, zone|ခါးပတ်၊ ကဏ္ဍရပ်ဝန်း|携帯電話|けいたいでんわ|လက်ကိုင်ဖုန်း|10|6",
  "108|帳|チョウ|-|notebook, curtain|မှတ်စုစာအုပ်|手帳|てちょう|လက်ဆောင်မှတ်စုစာအုပ်|11|6",
  "109|平|ヘイ|ひら|flat, peace, calm|ညီညာသော、အေးချမ်းသော|平和|へいわ|ငြိမ်းချမ်းရေး|5|6",
  "110|幸|コウ|しあわせ|happiness, blessing|ကံကောင်းခြင်း၊ ပျော်ရွှင်ခြင်း|幸せ|しあわせ|ပျော်ရွှင်ခြင်း|8|6",
  "111|底|テイ|そこ|bottom, depth|အောက်ခြေ၊ အနက်ဆုံးနေရာ|海底|かいてい|ပင်လယ်ကြမ်းပြင်|8|6",
  "112|府|フ|-|prefecture, urban government|စီရင်စု၊ အစိုးရဌာနချုပ်|政府|せいふ|အစိုးရ|8|6",
  "113|庫|コ|くら|warehouse, storehouse|ကုန်လှောင်ရုံ|金庫|きんこ|ငွေတိုက်သေတ္တာ|10|6",
  "114|庭|テイ|niwa|garden, yard|ပန်းခြံ၊ ခြံဝန်း|庭園|ていえん|ဥယျာဉ်ခြံဝန်း|10|6",
  "115|康|コウ|-|healthy, peace|ကျန်းမာငြိမ်းချမ်းခြင်း|健康|けんこう|ကျန်းမာရေး|11|6",
  "116|式|シキ|-|style, ceremony, formula|အခမ်းအနား၊ ပုံစံနည်းလမ်း|結婚式|けっこんしき|မင်္ဂလာဆောင်အခမ်းအနား|6|6",
  "117|弓|キュウ|ゆみ|bow (archery style)|လေးမြှားလေးကိုင်တံ|弓道|きゅうどう|လေးမြှားပစ်အားကစား|3|6",
  "118|当|トウ|あ|hit, target, right|အမှันတကယ်၊ ထိမှန်သည်|当然|とうぜん|သတ်မှတ်ချက်အရဖြစ်သင့်သော|6|6",
  "119|形|ケイ|かたち|shape, form|ပုံသဏ္ဌာန်|人形|んぎょう|အရုပ်|7|6",
  "120|役|ヤク|-|duty, service, role|တာဝန်၊ အသုံးဝင်မှု|役に立つ|役に立つ|အသုံးဝင်သည်|7|6",

  // --- UNIT 7 (121 - 140) ---
  "121|径|ケイ|-|path, diameter|လမ်းကျဉ်း၊ အချင်းဝက်|直径|ちょっけい|အချင်း|8|7",
  "122|徒|ト|-|disciple, pupil, follower|တပည့်ကျောင်းသား|生徒|せいと|ကျောင်းသား|10|7",
  "123|得|トク|え|gain, acquire, advantage|အကျိုးရှိသည်၊ ရယူသည်|得意|とくい|အားသာချက်စွမ်းရည်|11|7",
  "124|必|ヒツ|かなら|inevitable, surely|သေချာပေါက်|必要|ひつよう|လိုအပ်သော|5|7",
  "125|念|ネン|-|thought, concern, wish|စိတ်ကူးစိတ်သန်း၊ ဆုတောင်း|残念|ざんねん|စိတ်မကောင်းစရာကောင်းသော|8|7",
  "126|息|ソク|いき|breath, respiration|အသက်ရှူနှုန်း|ため息|ためいき|သက်ပြင်းချခြင်း|10|7",
  "127|悲|ヒ|かな|sad, grieve|ဝမ်းနည်းသော|悲しい|かなしい|ဝမ်းနည်းသော|12|7",
  "128|想|ソウ|-|concept, thought, idea|စိတ်ကူးအတွေးအမြင်|想像|そうぞう|စိတ်ကူးပုံဖော်မှု|13|7",
  "129|愛|アイ|-|love, affection|ချစ်ခြင်းမေတ္တာ|愛情|あいじょう|ချစ်ခင်စုံမက်မှု|13|7",
  "130|感|カン|-|feel, sensation, emotion|ခံစားမှု|感謝|かんしゃ|ကျေးဇူးတင်ခြင်း|13|7",
  "131|成|セイ|な|become, achieve, grow|ဖြစ်ထွန်းသည်၊ အောင်မြင်သည်|成功|せいこう|အောင်မြင်မှု|6|7",
  "132|戦|セン|たたか|war, battle, fight|တိုက်ပွဲ|戦争|せんそう|စစ်ပွဲ|13|7",
  "133|戸|コ|と|door, house|တံခါး၊ အိမ်ထောင်စု|一戸建て|いっこだて|လုံးချင်းအိမ်|4|7",
  "134|才|サイ|-|talent, age counter|အရွယ်စွမ်းရည်၊ အသက်ရေတွက်ကိရိယာ|天才|てんさい|ပါရမီရှင်|3|7",
  "135|打|ダ|う|strike, hit|ရိုက်နှက်သည်|打合せ|うちあわせ|ညှိနှိုင်းစည်းဝေးခြင်း|5|7",
  "136|投|トウ|な|throw, launch|ပစ်ပေါက်သည်|投手|とうしゅ|ဘောလုံးပစ်သူ|8|7",
  "137|折|セツ|お|fold, break, bend|ခေါက်ချိုးသည်၊ ကျိုးပြတ်သည်|折り紙|おりがみ|စက္ကူခေါက်ပညာ|7|7",
  "138|拾|シュウ|ひろ|pick up, gather|ကောက်ယူသည်|拾う|ひろう|ပစ္စည်းကောက်ရသည်|9|7",
  "139|指|シ|ゆび|finger, point|လက်ညှိုး၊ ညွှန်ပြသည်|指導|しどう|လမ်းညွှန်ပြသခြင်း|9|7",
  "140|挙|キョ|あ|raise, nominate, action|မြှင့်တင်သည်၊ လက်ညှိုးထောင်ပြသည်|選挙|せんきょ|ရွေးကောက်ပွဲ|10|7",

  // --- UNIT 8 (141 - 160) ---
  "141|改|カイ|あらた|reform, examine, change|ပြုပြင်မွမ်းမံသည်|改善|かいぜん|တိုးတက်ကောင်းမွန်အောင်ပြုလုပ်မှု|7|8",
  "142|放|ホウ|はな|release, emit|လွှတ်ပေးသည်၊ ထုတ်လွှင့်သည်|放送|ほうそう|အသံလွှင့်ထုတ်လုပ်ခြင်း|8|8",
  "143|救|キュウ|すく|rescue, save, help|ကယ်တင်သည်|救急車|きゅうきゅうしゃ|လူနာတင်ယာဉ်|11|8",
  "144|敗|ハイ|やぶ|failure, defeat|ရှုံးနိမ့်ခြင်း|失敗|しっぱい|ကျရှုံးခြင်း|11|8",
  "145|散|サン|ち|scatter, disperse|ပျံ့လွင့်စေသည်|散歩|さんぽ|လမ်းလျှောက်ခြင်း|12|8",
  "146|数|スウ|かず|number, count|အရေအတွက်|数学|すうがく|သင်္ချာဘာသာ|13|8",
  "147|整|セイ|totono|organize, arrange|စနစ်တကျပြင်ဆင်သည်|整理|せいり|စနစ်တကျသိမ်းဆည်းခြင်း|16|8",
  "148|旗|キ|はた|flag, banner|အလံ|国旗|こっき|နိုင်ငံတော်အလံ|14|8",
  "149|昔|セキ|むかし|old times, ancient|ရှေးယခင်ကာလ|昔話|むかしばなし|ရှေးဟောင်းပုံပြင်|8|8",
  "150|星|セイ|ほし|star|ကြယ်|衛星|えいせい|ဂြိုဟ်တု|9|8",
  "151|昨|サク|-|previous, yesterday|မနေ့က၊ လွန်ခဲ့သော|昨日|きのう|မနေ့က|9|8",
  "152|昭|ショウ|-|bright, Showa era|တောက်ပသော၊ ရှောဝါးခေတ်|昭和|しょうわ|ရှောဝါးခေတ်|9|8",
  "153|景|ケイ|-|scene, landscape, view|မြင်ကွင်း၊ ရှုခင်း|風景|ふうけい|သဘာဝရှုခင်း|12|8",
  "154|晴|セイ|は|clear weather, sunny|သာယာသောရာသီဥတု|晴れ|はれ|သာယာသောမိုးလေဝသ|12|8",
  "155|曲|キョク|ま|song, bend, curve|သีချင်း၊ ကွေ့ကောက်ခြင်း|曲線|きょくせん|မျဉ်းကွေး|6|8",
  "156|最|サイ|もっと|most, extreme|အဆိုးဆုံး၊ အမြင့်မားဆုံး|最近|さいきん|လတ်တလော|12|8",
  "157|望|ボウ|のぞみ|hope, desire, view|မျှော်လင့်တောင့်တသည်|希望|きぼう|မျှော်လင့်ချက်|11|8",
  "158|期|キ|-|period, time, term|သတ်မှတ်ကာလ|期間|きかん|အချိန်ကာလအပိုင်းအခြား|12|8",
  "159|未|ミ|-|not yet, un-|အသုံးမပြုရသေးသော၊ မဖြစ်သေးသော|未満|みまん|မပြည့်သေးသော|5|8",
  "160|末|マツ|すえ|end, close|အဆုံးသတ်|週末|しゅうまつ|စနေ၊ တနင်္ဂနွေပိတ်ရက်|5|8",

  // --- UNIT 9 (161 - 180) ---
  "161|札|サツ|ふだ|card, tag, bill|ငွေစက္ကူ၊ တံဆိပ်ကတ်|改札|かいさつ|လက်မှတ်ဖြတ်ဂိတ်|5|9",
  "162|材|ザイ|-|material, ingredient, timber|ကုန်ကြမ်းပစ္စည်း|材料|ざいりょう|ပါဝင်ပစ္စည်းများ|7|9",
  "163|束|ソク|たば|bundle, pack|ထုပ်စီးထားခြင်း|約束|やくそく|ကတိပြုခြင်း|7|9",
  "164|松|ショウ|matsu|pine tree|ထင်းရှူးပင်|松並木|まつなみき|ထင်းရှူးတန်း|8|9",
  "165|板|ハン|いた|board, plate|ပျဉ်ပြား|黒板|こくばん|ကျောက်သင်ပုန်း|8|9",
  "166|果|カ|は|fruit, result, carry out|အသီး၊ ရလဒ်|効果|こうか|ထိရောက်မှုစွမ်းရည်|8|9",
  "167|柱|チュウ|hashira|pillar, post|တိုင်|電柱|でんちゅう|ဓာတ်တိုင်|9|9",
  "168|栄|エイ|さか|prosper, flourish|စည်ပင်ထွန်းကားသည်|栄養|えいよう|အာဟာရဓာတ်|9|9",
  "169|根|コン|ne|root, source|အမြစ်|屋根|やね|အိမ်မိုးခေါင်မိုး|10|9",
  "170|案|アン|-|proposal, plan, draft|အစီအစဉ်အဆိုပြုချက်|提案|ていあん|အဆိုပြုတင်ပြချက်|10|9",
  "171|梅|バイ|うめ|plum|ဇီးသီးပင်|梅雨|つゆ|မိုးရာသီ|10|9",
  "172|械|カイ|-|machine, device|စက်ပစ္စည်းကိရိယာ|機械|きかい|စက်ပစ္စည်း|11|9",
  "173|植|ショク|う|plant, grow|အပင်စိုက်ပျိုးသည်|植物|しょくぶつ|အပင်လောက|12|9",
  "174|極|キョク|きわ|extreme, pole|အလွန်အမင်း၊ ဝင်ရိုးစွန်း|北極|ほっきょく|မြောက်ဝင်ရိုးစွန်း|12|9",
  "175|様|ヨウ|sama|polite suffix, manner|လူကြီးမင်း၊ ပုံစံအနေအထား|様子|ようす|အခြေအနေ|14|9",
  "176|標|ヒョウ|-|signpost, mark|အမှတ်အသားသင်္ကေတ|目標|もくひょう|ရည်မှန်းချက်ပန်းတိုင်|15|9",
  "177|横|オウ|よこ|horizontal, side|ဘေးတိုက်လမ်းညွှန်|横書き|よこがき|ဘေးတိုက်စာရေးခြင်း|15|9",
  "178|橋|キョウ|hashi|bridge|တံတား|歩道橋|ほどうきょう|လူကူးခုံးကျော်တံတား|16|9",
  "179|機|キ|はた|machine, opportunity|လေယာဉ်၊ အခွင့်အရေး|飛行機|ひこうき|လေယာဉ်ပျံ|16|9",
  "180|欠|ケツ|か|lack, defect|လိုအပ်ချက်၊ ပျက်ကွက်သည်|欠席|けっせき|ပျက်ကွက်ခြင်း|4|9",

  // --- UNIT 10 (181 - 200) ---
  "181|次|ジ|つぎ|next, order|နောက်ထပ်|目次|もくじ|မာတိကာ|6|10",
  "182|歯|シ|は|tooth|သွား|歯科|しか|သွားနှင့်ခံတွင်းဆေးကုဌာန|12|10",
  "183|歴|レキ|-|background, path, pass|သမိုင်းအတွေ့အကြုံနောက်ခံ|歴史|れきし|သမိုင်းကြောင်း|14|10",
  "184|残|ザン|のこ|remain, balance|ကျန်ရှိသည်|残念|ざんねん|စိတ်ပျက်ဝမ်းနည်းစရာ|10|10",
  "185|殺|サツ|ころ|kill|သတ်ဖြတ်သည်|殺人|さつじん|လူသတ်မှု|10|10",
  "186|毒|ドク|-|poison, harm|အဆိပ်အတောက်|消毒|しょうどく|ပိုးသတ်ဆေးဖျန်းခြင်း|8|10",
  "187|毛|モウ|け|hair, fur, feather|အမွေးအမျှင်|毛布|もうふ|စောင်|4|10",
  "188|氏|シ|うじ|surname, clan|မိသားစုမျိုးရိုးနာမည်|氏名|しめい|အမည်အပြည့်အစုံ|4|10",
  "189|氷|ヒョウ|こおり|ice|ရေခဲ|氷山|ひょうざん|ရေခဲတောင်|5|10",
  "190|求|キュウ|moto|request, demand, seek|တောင်းဆိုသည်၊ ရှာဖွေသည်|求人|きゅうじん|အလုပ်ခေါ်ယူခြင်း|7|10",
  "191|決|ケツ|き|decide, solve|ဆုံးဖြတ်သည်|決定|けってい|အတည်ပြုဆုံးဖြတ်ချက်|7|10",
  "192|汽|キ|-|steam|ရေနွေးငွေ့|汽車|きしゃ|မီးရထား|7|10",
  "193|油|ユ|あぶら|oil|ဆီ|石油|せきゆ|ရေနံစိမ်း|8|10",
  "194|治|ジ|なお|cure, govern|ကုသသည်၊ အုပ်ချုပ်သည်|政治|せいじ|နိုင်ငံရေး|8|10",
  "195|法|ホウ|-|law, principle, method|ဥပဒေ၊ နည်းလမ်း|法律|ほうりつ|ဥပဒေ|8|10",
  "196|波|ハ|なみ|wave|လှိုင်း|波浪|はろう|လှိုင်းထန်ခြင်း|8|10",
  "197|泣|キュウ|na|cry, weep|ငိုကြွေးသည်|泣く|なく|ငိုသည်|8|10",
  "198|泳|エイ|およ|swim|ရေကူးသည်|水泳|すいえい|ရေကူးအားကစား|8|10",
  "199|活|カツ|-|active, lively, life|တက်ကြွသောလှုပ်ရှားမှု|生活|せいかつ|နေထိုင်မှုဘဝ|9|10",
  "200|流|リュウ|なが|stream, flow, current|စီးဆင်းသည်|流行|りゅうこう|ခေတ်စားရေပန်းစားမှု|10|10",

  // --- UNIT 11 (201 - 220) ---
  "201|浅|セン|あさ|shallow|တိမ်သော|浅草|あさくさ|အာဆာကူဆာအရပ်|9|11",
  "202|浴|ヨク|あ|bathe, shower|ရေချိုးသည်|浴室|よくしつ|ရေချိုးခန်း|10|11",
  "203|消|ショウ|き|erase, extinguish, consume|ဖျက်ဆီးသည်|消防署|しょうぼうしょ|မီးသတ်စခန်း|10|11",
  "204|深|シン|ふか|deep|နက်ရှိုင်းသော|深刻|しんこく|စိုးရိမ်စရာအခြေအနေ|11|11",
  "205|清|セイ|きよ|pure, clean|သန့်စင်ငြိမ်းချမ်းသော|清潔|せいけつ|သန့်ရှင်းစင်ကြယ်ခြင်း|11|11",
  "206|温|オン|あたた|warm, gentle|နွေးထွေးသော|温泉|おんせん|ရေပူစမ်း|12|11",
  "207|港|コウ|みなと|port, harbor|ဆိပ်ကမ်း|空港|くうこう|လေဆိပ်|12|11",
  "208|湖|コ|みずうみ|lake|အိုင်၊ အိုင်ကြီး|琵琶湖|びわこ|ဘီဝါးအိုင်ကြီး|12|11",
  "209|湯|トウ|ゆ|hot water, bathhouse|ရေနွေး|お湯|おゆ|ရေနွေး|12|11",
  "210|満|マン|み|full, satisfy|ပြည့်နှက်သော|満足|まんぞく|စိတ်ကျေနပ်မှုရရှိခြင်း|12|11",
  "211|漁|ギョ|-|fishing|ငါးဖမ်းလုပ်ငန်း|漁師|りょうし|ရေလုပ်သား|14|11",
  "212|灯|トウ|ひ|lamp, light|မီးအိမ်၊ မီးလုံး|電灯|でんとう|လျှပ်စစ်မီးလုံး|6|11",
  "213|炭|タン|すみ|coal, charcoal|မီးသွေး၊ ကာဗွန်|石炭|せきたん|ကျောက်မီးသွေး|9|11",
  "214|点|テン|-|spot, point, mark|အမှတ်၊ ပြသသချက်|重点|じゅうてん|အလေးဂရုပြုရမည့်おချက်|9|11",
  "215|無|ム|な|nothing, nil, non-|မရှိခြင်း၊ ကင်းမဲ့ခြင်း|無料|むりょう|အခမဲ့|12|11",
  "216|然|ゼン|-|nature, suffix for condition|သဘာဝအခြေအနေပြညွှန်ကိရိယာ|自然|しぜん|သဘာဝ|12|11",
  "217|焼|ショウ|や|bake, burn|ဖုတ်သည်၊ လောင်ကျွမ်းစေသည်|焼き肉|やきにく|အသားကင်|12|11",
  "218|照|ショウ|て|shine, illuminate|ထွန်းလင်းတောက်ပစေခြင်း|照れる|てれる|ရှက်ကိုးရှက်ကန်းဖြစ်သည်|13|11",
  "219|熱|ネツ|あつ|heat, fever, passion|အပူ၊ ဖျားခြင်း|熱心|ねっしん|ထက်သန်သောကြိုးပမ်းမှု|15|11",
  "220|牧|ボク|まき|pasture, breed|စားကျက်မြေ၊ မွေးမြူခြင်း|牧場|ぼくじょう|နွားနို့မွေးမြူရေးခြံ|8|11",

  // --- UNIT 12 (221 - 240) ---
  "221|玉|ギョク|たま|ball, gem, sphere|ကျောက်မျက်ရတနာ၊ အဝိုင်းလုံး|赤玉|あかだま|အနီရောင်လုံး|5|12",
  "222|王|オウ|-|king, magnate, rule|ဘုရင်|王国|おうこく|ဘုရင့်နိုင်ငံတော်|4|12",
  "223|球|キュウ|たま|ball, sphere|စက်ဝိုင်းလုံး၊ ဘောလုံး|野球|やきゅう|ဘေ့စ်ဘောအားကစား|11|12",
  "224|由|ユ|よし|reason, source|အခြေခံရင်းမြစ်|理由|りゆう|အကြောင်းပြချက်|5|12",
  "225|申|シン|もう|report, state, sign of monkey|တင်ပြလျှောက်ထားသည်|申し込む|もうしこむ|လျှောက်ထားရယူသည်|5|12",
  "226|畑|-|はたけ|field, plantation|ဥယျာဉ်ခြံမြေ|田畑|たはた|လယ်ယာစိုက်ပျိုးမြေ|9|12",
  "227|番|バン|-|number, turn, watch|အလှည့်၊ စောင့်ကြပ်ကြည့်ရှုခြင်း|番号|ばんごう|နံပါတ်|12|12",
  "228|登|トウ|nobori|climb, register|တက်လှမ်းသည်|登山|とざん|တောင်တက်ခြင်း|12|12",
  "229|的|テキ|まと|target, -like|ပန်းတိုင်|目的|もくてき|ရည်ရွယ်ချက်ပန်းတိုင်|8|12",
  "230|皮|ヒ|かわ|skin, hide, leather|အရေပြား၊ သားရေ|皮膚|ひふ|အရေပြား|5|12",
  "231|皿|ベイ|さら|plate, dish|ပန်းကန်|お皿|おさら|ပန်းကန်ပြား|5|12",
  "232|直|チョク|なお|straight, fix|တိုက်ရိုက်၊ ပြင်ဆင်သည်|直接|ちょくせつ|တိုက်ရိုက်ဆင့်ကမ်းခြင်း|8|12",
  "233|相|ショウ|ai|mutual, phase, aspect|အပြန်အလှန်၊ မျက်နှာချင်းဆိုင်|相談|そうだん|ဆွေးနွေးတိုင်ပင်ခြင်း|9|12",
  "234|省|ショウ|habu|government ministry, omit|ဝန်ကြီးဌာန၊ ချန်လှပ်သည်|省略|しょうりゃく|အတိုချုံ့ခြင်း|9|12",
  "235|矢|シ|ya|arrow|မြှား|矢印|やじるし|မြှားဦးသင်္ကေတ|5|12",
  "236|石|セキ|いし|stone|ကျောက်တုံး|石油|せきゆ|ရေနံစိမ်း|5|12",
  "237|礼|レイ|-|manners, bow, gratitude|ကျေးဇူးတင်ခြင်း၊ ယဉ်ကျေးမှုဦးညွှတ်|失礼|しつれい|မယဉ်ကျေးသောအမူအရာ|5|12",
  "238|祝|シュク|いわ|celebrate, congratulate|ဂုဏ်ပြုသည်၊ အောင်ပွဲခံ|お祝い|おいわい|ဂုဏ်ပြုဆုမွန်ကောင်း|9|12",
  "239|神|シン|kami|god, deity, spirit|နတ်ဘုရား|神社|じんじゃ|ဂျပန်ဘုရားကျောင်း|9|12",
  "240|票|ヒョウ|-|ticket, ballot, vote|မဲလက်မှတ်|投票|とうひょう|မဲပေးခြင်း|11|12",

  // --- UNIT 13 (241 - 260) ---
  "241|祭|サイ|matsu|festival, celebrate|ပွဲတော်|伝統祭り|てんとうまつり|ရိုးရာမဆွတ်ပွဲတော်|11|13",
  "242|福|フク|-|title, blessing, luck|မင်္ဂလာ၊ ကံကောင်းခြင်း|幸福|こうふく|ပျော်ရွှင်ချမ်းမြေ့ခြင်း|13|13",
  "243|科|カ|-|department, course, section|ဌာနခွဲ၊ သိပ္ပံ|科学|かがく|သိပ္ပံပညာရပ်|9|13",
  "244|秒|ビョウ|-|second (time)|စက္ကန့်|一秒|いちびょう|တစ်စက္ကန့်|9|13",
  "245|種|シュ|たね|species, seed, kind|မျိုးစေ့၊ အမျိုးအစား|種類|しゅるい|အမျိုးအစားခွဲခြားထားပုံ|14|13",
  "246|積|セキ|つ|accumulate, pile, volume|စုဆောင်းမိသည်|積極的|せっきょくてき|တက်ကြွစွာပူးပေါင်းခြင်း|16|13",
  "247|章|ショウ|-|chapter, badge|အခန်းကဏ္ဍ၊ တံဆိပ်အမှတ်အသား|第一章|だいいちしょう|ပထမအခန်း|11|13",
  "248|童|ドウ|わらべ|child, juvenile|ကလေးသူငယ်|童話|どうわ|ပုံပြင်ပုံရိပ်များ|12|13",
  "249|競|キョウ|きそ|compete, race|ပြိုင်ဆိုင်သည်|競争|きょうそう|ယှဉ်ပြိုင်တိုက်ခိုက်ခြင်း|20|13",
  "250|竹|チク|take|bamboo|ဝါးပင်|竹林|ちくりん|ဝါးတောခြံ|6|13",
  "251|笑|ショウ|わら|laugh, smile|ရယ်မောပြုံးရွှင်သည်|笑顔|えがお|ပြုံးရွှင်သောမျက်နှာ|10|13",
  "252|笛|テキ|ふえ|flute, whistle|ပလွေ|口笛|くちぶえ|လေချွန်သံ|11|13",
  "253|第|ダイ|-|ordinal indicator, No.|အစဉ်အတန်း、နံပါတ်ပြကိရိယာ|第一|だいいち|ပထမဦးဆုံး|11|13",
  "254|筆|ヒツ|fude|writing brush, write|စုတ်တံ|筆記試験|ひっきしけん|ရေးဖြေစာမေးပွဲ|12|13",
  "255|等|トウ|ひと|class, grade, equal|အဆင့်အတန်း၊ စသည်ဖြင့်|平等|びょうどう|တန်းတူညီမျှမှု|12|13",
  "256|算|サン|-|calculate, estimate|တွက်ချက်သည်|予算|よさん|ဘတ်ဂျက်ကုန်ကျစရိတ်ခန့်မှန်းချက်|14|13",
  "257|管|カン|くだ|pipe, tube, control|ပိုက်လိုင်း၊ ထိန်းသိမ်းသည်|管理|かんり|စီမံခန့်ခွဲမှု|14|13",
  "258|箱|コウ|hako|box, case|သေတ္တာဘူး|ゴミ箱|ごみばこ|အမှိုက်ပုံး|15|13",
  "259|節|セツ|ふし|node, joint, season|အဆစ်အဆက်၊ ပွဲတော်|節約|せつやく|ခြွေတာစုဆောင်းမှု|13|13",
  "260|米|ベイ|kome|rice, America|ဆန်စပါး၊ အမေရိကันပြည်ထောင်စု|お米|おこめ|ဆန်|6|13",

  // --- UNIT 14 (261 - 280) ---
  "261|粉|フン|こな|flour, powder|မှုန့်၊ အမှုန့်ပြုလုပ်ခြင်း|小麦粉|こむぎこ|ဂျုံမှုန့်|10|14",
  "262|糸|シ|いと|thread, yarn|အပ်ချည်ကြိုး|毛糸|けいと|သိုးမွှေးကြိုး|6|14",
  "263|紀|キ|-|strong, era|ခေတ်သက္ကရာဇ်|世紀|せいき|ရာစုနှစ်|9|14",
  "254|約|ヤク|-|promise, approximately|ခန့်မှန်းခြေ၊ ကတိ|約束|やくそく|ကတိပြုသတ်မှတ်ချက်|9|14",
  "265|級|キュウ|-|grade, class, rank|အဆင့်တန်းခွဲခြားမှု|高級|こうきゅう|အဆင့်မြင့်စံနှုန်း|9|14",
  "266|細|サイ|ほそ|thin, slender, detailed|သေးငယ်သော၊ အသေးစိတ်|細かい|こまかい|ညှပ်စိပ်သေးငယ်သော|11|14",
  "267|組|ソ|くみ|group, set, assemble|အဖွဲ့ခွဲ၊ ပူးပေါင်းစုစည်း|組織|そしき|အဖွဲ့အစည်း|11|14",
  "268|結|ケツ|むす|tie, connect, conclude|ချည်နှောင်သည်၊ ဆုံးဖြတ်ခြင်း|結局|けっきょく|နောက်ဆုံးတွင်|12|14",
  "269|給|キュウ|-|salary, supply, gift|လစာ၊ ပေးအပ်အကျိုးပြုသည်|給料|きゅうりょう|လစာငွေ|12|14",
  "270|絵|カイ|え|picture, drawing|ပန်းချီကား၊ ပုံကြမ်း|絵画|かいがい|ပန်းချီလက်ရာ|12|14",
  "271|続|ゾク|つ|continue, series|ဆက်လက်လှုပ်ရှားမှုဆွဲဆောင်သည်|継続|けいぞく|အဆက်မပြတ်လုပ်ဆောင်ခြင်း|13|14",
  "272|緑|リョク|midori|green|အစိမ်းရောင်|緑色|みどりいろ|အစိမ်းရောင်အဆင်း|14|14",
  "273|線|セン|-|line, wire, track|မျဉ်းကြောင်း|路線|ろせん|လမ်းကြောင်းရထားလမ်း|15|14",
  "274|練|レン|ね|practice, drill, polish|လေ့ကျင့်သည်|練習|れんしゅう|လေ့ကျင့်ခန်း|14|14",
  "275|置|チ|お|place, put|ထားရှိသည်|設置|せっち|တပ်ဆင်ထားရှိခြင်း|13|14",
  "276|羊|ヨウ|hitsuji|sheep|သိုး|羊毛|ようもう|သိုးမွှေး|6|14",
  "277|美|ビ|うつく|beauty, beautiful|လှပသော|美人|びじん|အလှပပြင်ဆင်သူအမျိုးသမီး|9|14",
  "278|羽|ウ|はね|feather, wing, counter for birds|အမွေးအတောင်၊ ငှက်ရေတွက်ကိရိယာ|一羽|いちわ|ငှက်တစ်ကောင်|6|14",
  "279|老|ロウ|お|old, aged|သက်ကြီးပိုင်း|老人|ろうじん|သက်ကြီးရွယ်အို|6|14",
  "280|育|イク|そだ|educate, bring up, rear|ပြုစုပျိုးထောင်ခြင်း|教育|きょういく|ပညာရေး|8|14",

  // --- UNIT 15 (281 - 300) ---
  "281|胃|イ|-|stomach|အစာအိမ်|胃癌|いがん|အစာအိမ်ကင်ဆာ|9|15",
  "282|脈|ミャク|-|pulse, vein, thread|သွေးခုန်နှုန်း|文脈|ぶんみゃく|စာသားနောက်ခံအဓိပ္ပါယ်|10|15",
  "283|腸|チョウ|-|intestines, guts|အူလမ်းကြောင်း|胃腸|いちょう|အစာအိမ်နှင့် အူလမ်းကြောင်း|13|15",
  "284|臣|シン|-|retainer, minister, vassal|ဝန်ကြီးအဖွဲ့ဝင်|総理大臣|そうりだいじん|ဝန်ကြီးချုပ်|7|15",
  "285|航|コウ|-|navigate, sail, fly|ရေကြောင်း သို့မဟုတ် လေကြောင်း|航空|こうくう|လေကြောင်းပို့ဆောင်ရေး|10|15",
  "286|船|セン|fune|ship, boat|သင်္ဘော|船便|ふなびん|ရေကြောင်းပို့ဆောင်ခရီး|11|15",
  "287|良|リョウ|よ|good, fine|ကောင်းမွန်သော|善良|ぜんりょう|ရိုးသားဖြောင့်မတ်သော|7|15",
  "288|芸|ゲイ|-|art, craft, performance|ဂီတအနုပညာ၊ စွမ်းရည်|芸術|げいじゅつ|အနုပညာ|7|15",
  "289|芽|ガ|me|bud, sprout|အညှောက်|芽生え|めばえ|အညှောက်ပေါက်ခြင်း|8|15",
  "290|苦|ク|くる|suffering, bitter, trial|ခါးသီးသော၊ နာကျင်ရုန်းကန်ရသော|苦労|くろう|ပင်ပန်းဆင်းရဲမှု|8|15",
  "291|草|ソウ|kusa|grass, weed, herb|မြက်ပင်|雑草|ざっそう|ပေါင်းမြက်|9|15",
  "292|荷|カ|に|load, baggage|အထုပ်အပိုး၊ ကုန်ပစ္စည်း|荷物|にもつ|ဝန်စည်စလယ်|10|15",
  "293|落|ラク|お|fall, drop, shed|ပြုတ်ကျသည်|落ち着く|おちつく|တည်ငြိမ်အေးဆေးသွားသည်|12|15",
  "294|葉|ヨウ|は|leaf|သစ်ရွက်|言葉|ことば|ဘာသာစကားစကားလုံး|12|15",
  "295|虫|チュウ|mushi|insect, bug, worm|ပိုးမွှားအင်းဆက်|害虫|がいちゅう|ဖျက်ဆီးတတ်သောပိုးမွှား|6|15",
  "296|血|ケツ|ち|blood|သွေး|出血|しゅっけつ|သွေးထွက်ခြင်း|6|15",
  "297|街|ガイ|machi|street, town|လမ်းမကြီးစုဝေးရာ|商店街|しょうてんがい|ဈေးတန်းဆိုင်စုဝေးရပ်|12|15",
  "298|衣|イ|ころも|clothing, garment|အဝတ်အစား|衣服|いふく|အဝတ်အထည်စုံ|6|15",
  "299|表|ヒョウ|おもて|express, table, surface|ဖော်ပြချက်|発表|はっぴょう|ထုတ်ဖော်ကြေငြာချက်|8|15",
  "300|要|ヨウ|い|need, main point|လိုအပ်ချက်တွန်းအားပေးမှု|必要|ひつよう|မရှိမဖြစ်လိုအပ်သော|9|15",

  // --- UNIT 16 (301 - 320) ---
  "301|覚|カク|おぼ|memorize, wake up, sense|မှတ်မိသည်|覚える|おぼえる|အလွတ်ကျက်သည်|12|16",
  "302|観|カン|み|observe, view, sight|လေ့လာကြည့်ရှုမှု|観光|かんこう|ခရီးသွားလုပ်ငန်းလေ့လာမှု|18|16",
  "303|角|カク|かど|corner, angle, horn|ထောင့်စောင်း|角度|かくど|ထောင့်ဒီဂရီ|7|16",
  "304|訓|クン|-|instruction, reading|လေ့ကျင့်လမ်းညွှန်မှု|訓練|くんれん|လေ့ကျင့်ပျိုးထောင်ခြင်း|10|16",
  "305|記|キ|しる|scribe, write down, document|မှတ်တမ်းတင်သည်|日記|にっき|နေ့စဉ်မှတ်တမ်းဂျာနယ်|10|16",
  "306|詩|シ|-|poem, poetry|ကဗျာ|詩人|しじん|ကဗျာဆရာ|13|16",
  "307|課|カ|-|section, division, lesson|သင်ခန်းစာ၊ ဌာနခွဲ|課題|かだい|ခေါင်းစဉ်သင်ခန်းစာလုပ်ဆောင်မှု|15|16",
  "308|調|チョウ|しら|investigate, tone|စစ်ဆေးရှာဖွေသည်|調べる|しらべる|ရှာဖွေစုံစမ်းသည်|15|16",
  "309|談|ダン|-|discuss, talk|ဆွေးနွေးမှုပြုသည်|相談|そうだん|ဆွေးနွေးတိုင်ပင်ညှိနှိုင်းခြင်း|15|16",
  "310|議|ギ|-|deliberation, debate|ဆွေးနွေးတိုင်ပင်|会議|かいぎ|အစည်းအဝေး|20|16",
  "311|谷|コク|tani|valley|ချိုင့်ဝှမ်း|谷間|たにま|တောင်ကြားချိုင့်|7|16",
  "312|豆|トウ|mame|bean, pea|ပဲစေ့|豆腐|とうふ|ပဲပြား|7|16",
  "313|象|ショウ|-|elephant, phenomenon|ဆင်၊ သဘာဝဖြစ်စဉ်|象徴|しょうちょう|ပြယုဂ်သင်္ကေတ|12|16",
  "314|貝|バイ|kai|shellfish|ခရုကမာခွံ|貝殻|かいがら|ခရုခွံ|7|16",
  "315|負|フ|ま|defeat, lose, negative|ရှုံးနိမ့်သည်၊ ဝန်ထုပ်တာဝန်|負ける|まける|ရှုံးသည်|9|16",
  "316|貨|カ|-|freight, goods, currency|သယ်ယူကုန်စည်၊ ငွေကြေး|通貨|つうか|သုံးစွဲငွေကြေး|11|16",
  "317|貯|チョ|た|store, save, deposit|စုဆောင်းသိမ်းဆည်း|貯金|ちょきん|စုဆောင်းငွေ|12|16",
  "318|費|ヒ|つい|expense, spend|စရိတ်စက|費用|ひよう|ကုန်ကျစရိတ်|12|16",
  "319|賞|ショウ|-|prize, award|ဆုလာဘ်|賞品|しょうひん|ဂုဏ်ပြုဆုပစ္စည်း|15|16",
  "320|路|ロ|じ|path, road|လမ်းခရီး|道路|どうろ|လမ်းမကြီး|13|16",

  // --- UNIT 17 (321 - 340) ---
  "321|身|シン|mi|body, person, status|ခန္ဓာကိုယ်၊ ကိုယ်ပိုင်အဆင့်|身体|しんたい|ခန္ဓာကိုယ်ဖွဲ့စည်းမှု|7|17",
  "322|軍|グン|-|army, military|စစ်တပ်|軍隊|ぐんたい|စစ်တပ်အင်အား|9|17",
  "323|輪|リン|わ|wheel, ring, counter for flowers|ဘီးလုံး၊ အဝိုင်း|指輪|ゆびわ|လက်စွပ်|15|17",
  "324|辞|ジ|ya|word, resign|စကားလုံး၊ နှုတ်ထွက်သည်|辞書|じしょ|အဘိဓာန်|13|17",
  "325|農|ノウ|-|agriculture, farming|စိုက်ပျိုးရေး|農業|のうぎょう|စိုက်ပျိုးရေးလုပ်ငန်း|13|17",
  "326|辺|ヘン|あたり|area, border|အနီးအနားဝန်းကျင်|この辺|このあたり|ဒီအနီးတစ်ဝိုက်|5|17",
  "327|返|ヘン|か|return, repay|ပြန်လည်ပေးအပ်သည်|返事|へんじ|တုံ့ပြန်အဖြေစကား|7|17",
  "328|追|ツイ|o|chase, follow|နောက်ကလိုက်သည်|追試験|ついしけん|နောက်ဆက်တွဲပြန်လည်ဖြေဆိုရသောစာမေးပွဲ|9|17",
  "329|速|ソク|haya|fast, speed|မြန်ဆန်သော|速度|そくど|အမြန်နှုန်း|10|17",
  "330|連|レン|つ|join, connect, gather|ချိတ်ဆက်သည်|連絡|れんらく|ဆက်သွယ်မှုပြုလုပ်ခြင်း|10|17",
  "331|遊|ユウ|あそ|play, enjoy|ကစားသည်|遊ぶ|あそぶ|လည်ပတ်လှုပ်ရှားကစားသည်|12|17",
  "332|達|タツ|-|plural suffix, reach|အများကိန်း၊ ရောက်ရှိသည်|友達|ともだち|သူငယ်ချင်း|12|17",
  "333|選|セン|era|choose, select|ရွေးချယ်သည်|選ぶ|えらぶ|ရွေးကောက်သည်|15|17",
  "334|郡|グン|-|county, district|ခရိုင်စုစည်းမှု|郡部|ぐんぶ|ကျေးလက်ဒေသများစုဝေးရာ|10|17",
  "335|部|ブ|-|section, part, department|ကဏ္ဍခွဲ၊ ဌာနခွဲ|部屋|へや|အခန်း|11|17",
  "336|配|ハイ|くば|distribute, match|ဝေမျှသည်|心配|しんぱい|စိုးရိမ်ခြင်း|10|17",
  "337|酒|シュ|sake|sake, alcohol|အရက်သေစာ|お酒|おさけ|အရက်၊ ဝိုင်|10|17",
  "338|里|リ|sato|village, parent's home, league|ကျေးရွာ၊ သာယာသောခရီးမိုင်|ふる里|ふるさと|မွေးရပ်မြေ|7|17",
  "339|量|リョウ|haka|quantity, measure|ပမာဏခုန်နှုန်း|大量|たいりょう|အမြောက်အမြား|12|17",
  "340|鉄|テツ|-|iron|သံသတ္တု|鉄道|てつどう|ရထားသံလမ်းစနစ်|13|17",

  // --- UNIT 18 (341 - 361) ---
  "341|録|ロク|-|record, document|မှတ်ตမ်း|記録|きろく|မှတ်တမ်းမှတ်ရာ|16|18",
  "342|鏡|キョウ|kagami|mirror|မှန်|鏡|かがみ|မှန်|19|18",
  "343|関|カン|seki|barrier, gate, connection|သက်ဆိုင်ရာဂိတ်တံခါး၊ ပတ်သက်|関係|かんけい|ပတ်သက်မှုအဆင့်ဆင့်|14|18",
  "344|陸|リク|-|land, shore|ကုန်းမြေ|大陸|たいりく|တိုက်ကြီးများ|11|18",
  "345|陽|ヨウ|-|sun, positive|နေမင်းပူနွေးသောအလင်း|太陽|たいよう|နေမင်းကြီး|12|18",
  "346|隊|タイ|-|regiment, party, squad|တပ်ဖွဲ့ငယ်စုစည်းခြင်း|軍隊|ぐんたい|စစ်တပ်တပ်ဖွဲ့|12|18",
  "347|階|カイ|-|floor, stair, rank|အထပ်တစ်ဆင့်၊ လှေကားထစ်|階段|かいだん|လှေကား|12|18",
  "348|雪|セツ|yuki|snow|ဆီးနှင်း|降雪|こうせつ|နှင်းကျခြင်း|11|18",
  "349|雲|ウン|kumo|cloud|တိမ်တိုက်|雨雲|あまぐも|မိုးတိမ်|12|18",
  "350|静|セイ|shizu|quiet, peaceful|တိတ်ဆိတ်အေးချမ်းသော|静か|しずか|တိတ်ဆိတ်ငြိမ်သက်သော|14|18",
  "351|面|メン|おも|face, mask, surface|မျက်နှာပြင်၊ ကဏ္ဍမျက်နှာ|画面|がめん|မျက်နှာပြင်စကရင်|9|18",
  "352|順|ジュン|-|order, sequence|အစီအစဉ်တစ်ကျ|順番|じゅんばん|အလှည့်ကျကျနပုံ|12|18",
  "353|願|ガン|nega|request, wish|မေတ္တာရပ်ခံတောင်းဆိုချက်|お願い|おねがい|ကူညီရန်မေတ္တာရပ်ခံချက်|19|18",
  "354|類|ルイ|たぐい|class, kind|အမျိုးအစားခွဲခြားထားပုံ|分類|ぶんるい|အုပ်စုခွဲခြားသတ်မှတ်ခြင်း|18|18",
  "355|飛|ヒ|と|fly, skip|ပျံသန်းသည်|飛行機|ひこうき|လေယာဉ်ပျံ|9|18",
  "356|養|ヨウ|やしな|nourish, foster|ပြုစုစောင့်ရှောက်ပျိုးထောင်|栄養|えいよう|အာဟာရဓာတ်|15|18",
  "357|馬|バ|うま|horse|မြင်း|竹馬|たけうま|ဝါးခြေတောက်လျှောက်ကစားစရာ|10|18",
  "358|鳴|メイ|な|chirp, bark, ring|မြည်သံပြုသည်|鳴く|なく|အသံမြည်သည်|14|18",
  "359|麦|バク|むぎ|wheat, barley|ဂျုံပင်|小麦|こむぎ|ဂျုံစပါးပင်|7|18",
  "360|黄|コウ|き|yellow|အဝါရောင်|黄色|きいろ|အဝါရောင်အဆင်း|11|18",
  "361|鼻|ビ|はな|nose|နှာခေါင်း|鼻水|はなみず|နှာရည်|14|18"
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
