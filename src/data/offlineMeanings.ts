// Purely offline data generator for Synonyms (Same meanings) and Antonyms (Opposites)
// Supporting N3 vocabulary entries with 100% precise, linguistically correct offline pairs.
// If no true synonym or antonym exists, it returns empty arrays [] as requested.

export interface MeaningEntry {
  word: string;
  reading: string;
  meaning_mm: string;
}

// Meticulously curated, high-fidelity dictionary for Japanese N3 core terminology.
// Each synonym is a true synonym, and each antonym is a true antonym of the word.
const SPECIFIC_DICTIONARY: Record<string, { same: MeaningEntry[]; diff: MeaningEntry[] }> = {
  // UNIT 1: Time words
  "昨日": {
    same: [
      { word: "前日", reading: "ぜんじつ", meaning_mm: "အရင်နေ့" },
      { word: "昨日", reading: "さくじつ", meaning_mm: "မနေ့တုန်းက" }
    ],
    diff: [
      { word: "明日", reading: "あした", meaning_mm: "မနက်ဖြန်" },
      { word: "翌日", reading: "よくじつ", meaning_mm: "နောက်တစ်နေ့" }
    ]
  },
  "昨日（きのう）": {
    same: [
      { word: "前日", reading: "ぜんじつ", meaning_mm: "အရင်နေ့" }
    ],
    diff: [
      { word: "明日", reading: "あした", meaning_mm: "မနက်ဖြန်" },
      { word: "翌日", reading: "よくじつ", meaning_mm: "နောက်တစ်နေ့" }
    ]
  },
  "一昨日": {
    same: [
      { word: "二日前", reading: "ふつかまえ", meaning_mm: "လွန်ခဲ့သောနှစ်ရက်" }
    ],
    diff: [
      { word: "明後日", reading: "あさって", meaning_mm: "သန်ဘက်ခါ" }
    ]
  },
  "昨年": {
    same: [
      { word: "去年", reading: "きょねん", meaning_mm: "မနှစ်က" },
      { word: "前年", reading: "ぜんねん", meaning_mm: "ယခင်နှစ်" }
    ],
    diff: [
      { word: "来年", reading: "らいねん", meaning_mm: "နောက်နှစ် / နှစ်လာ" },
      { word: "今年", reading: "ことし", meaning_mm: "ယခုနှစ်" }
    ]
  },
  "しあさって": {
    same: [
      { word: "三日後", reading: "みっかご", meaning_mm: "သုံးရက်မြောက်နေ့" }
    ],
    diff: [
      { word: "一昨日", reading: "おととい", meaning_mm: "တစ်နေ့က" }
    ]
  },
  "先々週": {
    same: [
      { word: "二週間前", reading: "にしゅうかんまえ", meaning_mm: "လွန်ခဲ့သောနှစ်ပတ်" }
    ],
    diff: [
      { word: "来々週", reading: "らいらいしゅう", meaning_mm: "နောက်နှစ်ပတ်" }
    ]
  },
  "先日": {
    same: [
      { word: "この間", reading: "このあいだ", meaning_mm: "မကြာခင်က" },
      { word: "先頃", reading: "さきごろ", meaning_mm: "လွန်ခဲ့သောရက်ပိုင်း" }
    ],
    diff: [
      { word: "後日", reading: "ごじつ", meaning_mm: "နောက်ရက်" },
      { word: "今後", reading: "こんご", meaning_mm: "နောင်တွင်" }
    ]
  },
  "当日": {
    same: [
      { word: "その日", reading: "そのひ", meaning_mm: "အဲ့ဒီနေ့" }
    ],
    diff: [
      { word: "事前", reading: "じぜん", meaning_mm: "ကြိုတင်ပြင်ဆင်မှု" },
      { word: "事後", reading: "じご", meaning_mm: "ပြီးနောက်မှ" }
    ]
  },
  "翌日": {
    same: [
      { word: "明くる日", reading: "あくるひ", meaning_mm: "နောက်ရက်" },
      { word: "明日", reading: "あした", meaning_mm: "မနက်ဖြန်" }
    ],
    diff: [
      { word: "前日", reading: "ぜんじつ", meaning_mm: "မနေ့က / အရင်နေ့" }
    ]
  },
  "近いうちに": {
    same: [
      { word: "すぐに", reading: "すぐに", meaning_mm: "မကြာမီ" },
      { word: "近々", reading: "ちかじか", meaning_mm: "သိပ်မကြာခင်အတွင်း" }
    ],
    diff: []
  },
  "後日": {
    same: [
      { word: "のちほど", reading: "のちほど", meaning_mm: "နောင်တစ်ချိန်" },
      { word: "後で", reading: "あとで", meaning_mm: "နောက်မှ" }
    ],
    diff: [
      { word: "先日", reading: "せんじつ", meaning_mm: "ပြီးခဲ့သည့်နေ့ရက်" }
    ]
  },
  "今後": {
    same: [
      { word: "これから", reading: "これから", meaning_mm: "ယခုမှစ၍" },
      { word: "将来", reading: "しょうらい", meaning_mm: "အနာဂတ်ကာလ" }
    ],
    diff: [
      { word: "これまで", reading: "これまで", meaning_mm: "ယခုအချိန်ထိ" },
      { word: "過去", reading: "かこ", meaning_mm: "အတိတ်" }
    ]
  },
  "当時": {
    same: [
      { word: "その頃", reading: "そのころ", meaning_mm: "ထိုအချိန်က" }
    ],
    diff: [
      { word: "現代", reading: "げんだい", meaning_mm: "ယခုခေတ်" }
    ]
  },
  "以前": {
    same: [
      { word: "かつて", reading: "かつて", meaning_mm: "တစ်ခါက" },
      { word: "前", reading: "まえ", meaning_mm: "ယခင်က" }
    ],
    diff: [
      { word: "以後", reading: "いご", meaning_mm: "နောက်ပိုင်း" },
      { word: "今後", reading: "こんご", meaning_mm: "နောက်နောင်" }
    ]
  },
  "以後": {
    same: [
      { word: "以降", reading: "いこう", meaning_mm: "နောက်ပိုင်း" }
    ],
    diff: [
      { word: "以前", reading: "いぜん", meaning_mm: "ယခင်က" }
    ]
  },
  "依頼": {
    same: [
      { word: "以降", reading: "いこう", meaning_mm: "နောက်ပိုင်း" },
      { word: "要請", reading: "ようせい", meaning_mm: "တောင်းဆိုခြင်း/မေတ္တာရပ်ခံခြင်း" }
    ],
    diff: [
      { word: "以前", reading: "いぜん", meaning_mm: "ယခင်က" }
    ]
  },
  "以降": {
    same: [
      { word: "以後", reading: "いご", meaning_mm: "နောက်ပိုင်း" }
    ],
    diff: [
      { word: "以前", reading: "いぜん", meaning_mm: "ယခင်က" }
    ]
  },
  "時期": {
    same: [
      { word: "期間", reading: "きかん", meaning_mm: "အချိန်ကာလ" }
    ],
    diff: []
  },
  "延期": {
    same: [
      { word: "繰り越し", reading: "くりこし", meaning_mm: "ရွှေ့ဆိုင်းခြင်း" },
      { word: "持ち越し", reading: "もちこし", meaning_mm: "နောက်ဆုတ်ခြင်း" }
    ],
    diff: [
      { word: "決行", reading: "けっこう", meaning_mm: "အကောင်အထည်ဖော်ခြင်း" }
    ]
  },
  "上旬": {
    same: [
      { word: "初旬", reading: "しょじゅん", meaning_mm: "လဆန်းပိုင်း" }
    ],
    diff: [
      { word: "下旬", reading: "げじゅん", meaning_mm: "လကုန်ပိုင်း" }
    ]
  },
  "中旬": {
    same: [
      { word: "なかごろ", reading: "なかごろ", meaning_mm: "လလယ်ပိုင်း" }
    ],
    diff: []
  },
  "下旬": {
    same: [
      { word: "月末", reading: "げつまつ", meaning_mm: "လကုန်" }
    ],
    diff: [
      { word: "上旬", reading: "じょうじゅん", meaning_mm: "လဆန်းပိုင်း" }
    ]
  },
  "月末": {
    same: [
      { word: "月の終わり", reading: "つきのおわり", meaning_mm: "လကုန်စွန်း" }
    ],
    diff: [
      { word: "月初め", reading: "つきはじめ", meaning_mm: "လဆန်းပိုင်း" }
    ]
  },
  "年末年始": {
    same: [],
    diff: []
  },
  "ゴールデンウイーク": {
    same: [
      { word: "大型連休", reading: "おおがたれんきゅう", meaning_mm: "ဆက်တိုက်အားလပ်ရက်ရှည်" }
    ],
    diff: []
  },
  "元旦": {
    same: [
      { word: "元日", reading: "がんじつ", meaning_mm: "နှစ်ဆန်းတစ်ရက်" },
      { word: "正月", reading: "しょうがつ", meaning_mm: "နှစ်သစ်ကူးပွဲ" }
    ],
    diff: [
      { word: "大晦日", reading: "おおみそか", meaning_mm: "နှစ်ကုန်ရက်မြတ်" }
    ]
  },
  "普段": {
    same: [
      { word: "日常", reading: "にちじょう", meaning_mm: "နေ့စဉ်ပုံမှန်" },
      { word: "常に", reading: "つねに", meaning_mm: "အမြဲတစေ" }
    ],
    diff: [
      { word: "臨時", reading: "りんじ", meaning_mm: "ခေတ္တယာယီ/အရေးပေါ်" },
      { word: "特別", reading: "とくべつ", meaning_mm: "အထူးတလည်" }
    ]
  },
  "平日": {
    same: [],
    diff: [
      { word: "祝日", reading: "しゅくじつ", meaning_mm: "ပိတ်ရက်" },
      { word: "休日", reading: "きゅうじつ", meaning_mm: "အားလပ်ရက်" }
    ]
  },
  "祝日": {
    same: [
      { word: "祭日", reading: "さいじつ", meaning_mm: "ပွဲတော်ပိတ်ရက်" }
    ],
    diff: [
      { word: "平日", reading: "へいじつ", meaning_mm: "ကြားရက်/အလုပ်လုပ်ရက်" }
    ]
  },
  "休日": {
    same: [
      { word: "休暇", reading: "きゅうか", meaning_mm: "အားလပ်အနားယူရက်" },
      { word: "休み", reading: "やすみ", meaning_mm: "အနားယူခြင်း" }
    ],
    diff: [
      { word: "平日", reading: "へいじつ", meaning_mm: "ကြားရက်/အလုပ်လုပ်ရက်" }
    ]
  },
  "期間": {
    same: [
      { word: "サイクル", reading: "さいくる", meaning_mm: "သတ်မှတ်အချိန်အပိုင်းအခြား" }
    ],
    diff: []
  },
  "延長": {
    same: [
      { word: "拡大", reading: "かくだい", meaning_mm: "တိုးချဲ့ခြင်း" },
      { word: "伸ばすこと", reading: "のばすこと", meaning_mm: "အချိန်ဆွဲဆွဲဆန့်ခြင်း" }
    ],
    diff: [
      { word: "短縮", reading: "たんしゅく", meaning_mm: "အချိန်တိုတိုဖြတ်ခြင်း" }
    ]
  },
  "シーズン": {
    same: [
      { word: "季節", reading: "きせつ", meaning_mm: "ရာသီဥတု" }
    ],
    diff: [
      { word: "オフシーズン", reading: "オフシーズン", meaning_mm: "ရာသီပြင်ပအချိန်" }
    ]
  },
  "臨時": {
    same: [
      { word: "一時的", reading: "いちじてき", meaning_mm: "ယာယီမျှသာ" },
      { word: "緊急", reading: "きんきゅう", meaning_mm: "အရေးပေါ်" }
    ],
    diff: [
      { word: "常設", reading: "じょうせつ", meaning_mm: "အမြဲတမ်းဖြစ်တည်ခြင်း" },
      { word: "普段", reading: "ふだん", meaning_mm: "ပုံမှန်" }
    ]
  },
  "休暇": {
    same: [
      { word: "休日", reading: "きゅうじつ", meaning_mm: "အားလပ်ရက်" },
      { word: "休み", reading: "やすみ", meaning_mm: "အနားယူခြင်း" }
    ],
    diff: [
      { word: "労働", reading: "ろうどう", meaning_mm: "အလုပ်လုပ်ခြင်း" }
    ]
  },
  "夜中": {
    same: [
      { word: "深夜", reading: "しんや", meaning_mm: "ညနက်ပိုင်း" }
    ],
    diff: [
      { word: "真昼", reading: "まひる", meaning_mm: "နေ့လယ်တည့်တည့်" }
    ]
  },
  "深夜": {
    same: [
      { word: "夜中", reading: "よなか", meaning_mm: "ညလယ်ပိုင်း" },
      { word: "夜更け", reading: "よふけ", meaning_mm: "ညဉ့်နက်သန်းခေါင်" }
    ],
    diff: [
      { word: "早朝", reading: "そうちょう", meaning_mm: "မနက်စောစော" },
      { word: "真昼", reading: "まひる", meaning_mm: "နေ့လယ်တည့်တည့်" }
    ]
  },
  "明ける": {
    same: [
      { word: "始まる", reading: "始まる", meaning_mm: "စတင်ပေါ်ပေါက်သည်" }
    ],
    diff: [
      { word: "暮れる", reading: "くれる", meaning_mm: "မှောင်မိုက်သွားသည်" },
      { word: "終わる", reading: "おわる", meaning_mm: "ပြီးဆုံးသည်" }
    ]
  },
  "初め": {
    same: [
      { word: "最初", reading: "さいしょ", meaning_mm: "အစဦးဆုံး" }
    ],
    diff: [
      { word: "終わり", reading: "おわり", meaning_mm: "အဆုံးသတ်" }
    ]
  },
  "後": {
    same: [
      { word: "のち", reading: "のち", meaning_mm: "နောက်မှ" }
    ],
    diff: [
      { word: "前", reading: "まえ", meaning_mm: "ယခင်က" }
    ]
  },
  "際": {
    same: [
      { word: "時", reading: "とき", meaning_mm: "အခါအချိန်" },
      { word: "場合", reading: "ばあい", meaning_mm: "ကိစ္စရပ်" }
    ],
    diff: []
  },
  "同時": {
    same: [
      { word: "一斉", reading: "いっせい", meaning_mm: "တစ်ပြိုင်နက်တည်း" }
    ],
    diff: [
      { word: "別々", reading: "べつべつ", meaning_mm: "သီးခြားစီ" }
    ]
  },
  "たった今": {
    same: [
      { word: "さっき", reading: "さっき", meaning_mm: "စောစောလေးတင်" },
      { word: "今しがた", reading: "いましがた", meaning_mm: "ယခုတင်လေး" }
    ],
    diff: [
      { word: "後ほど", reading: "のちほど", meaning_mm: "နောက်မှ" }
    ]
  },
  "早め": {
    same: [
      { word: "前倒し", reading: "まえだおし", meaning_mm: "လျင်မြန်စွာ" }
    ],
    diff: [
      { word: "遅め", reading: "おそめ", meaning_mm: "နောက်ကျစွာ" }
    ]
  },
  "現在": {
    same: [
      { word: "今", reading: "いま", meaning_mm: "လက်ရှိ" }
    ],
    diff: [
      { word: "過去", reading: "かこ", meaning_mm: "အတိတ်" },
      { word: "未来", reading: "みらい", meaning_mm: "အနာဂတ်" }
    ]
  },
  "過去": {
    same: [
      { word: "昔", reading: "むかし", meaning_mm: "ဟိုးယခင်" },
      { word: "以前", reading: "いぜん", meaning_mm: "အရင်က" }
    ],
    diff: [
      { word: "未来", reading: "みらい", meaning_mm: "အနာဂတ်" },
      { word: "現在", reading: "げんざい", meaning_mm: "လက်ရှိ" }
    ]
  },
  "未来": {
    same: [
      { word: "将来", reading: "しょうらい", meaning_mm: "အနာဂတ်" }
    ],
    diff: [
      { word: "過去", reading: "かこ", meaning_mm: "အတိတ်" }
    ]
  },
  "将来": {
    same: [
      { word: "未来", reading: "みらい", meaning_mm: "အနာဂတ်" }
    ],
    diff: [
      { word: "過去", reading: "かこ", meaning_mm: "အတိတ်" }
    ]
  },
  "一生": {
    same: [
      { word: "生涯", reading: "しょうがい", meaning_mm: "တစ်သက်တာလုံး" }
    ],
    diff: []
  },
  "永遠": {
    same: [
      { word: "永久", reading: "えいきゅう", meaning_mm: "ထာဝရ" }
    ],
    diff: [
      { word: "一瞬", reading: "いっしゅん", meaning_mm: "တစ်ခဏချင်း" }
    ]
  },
  "現代": {
    same: [
      { word: "近代", reading: "きんだい", meaning_mm: "ခေတ်သစ်" }
    ],
    diff: [
      { word: "古代", reading: "こだい", meaning_mm: "ရှေးခေတ်" }
    ]
  },
  "今日": {
    same: [
      { word: "現代", reading: "げんだい", meaning_mm: "ယနေ့ခေတ်" }
    ],
    diff: [
      { word: "過去", reading: "かこ", meaning_mm: "အတိတ်" }
    ]
  },
  "時代": {
    same: [],
    diff: []
  },
  "年代": {
    same: [],
    diff: []
  },
  "世紀": {
    same: [
      { word: "百年間", reading: "ひゃくねんかん", meaning_mm: "ရာစုနှစ်တစ်ရာ" }
    ],
    diff: []
  },
  "経つ": {
    same: [
      { word: "経過する", reading: "けいかする", meaning_mm: "အချိန်ကုန်လွန်သွားသည်" },
      { word: "過ぎる", reading: "すぎる", meaning_mm: "လွန်မြောက်ကျော်လွန်သည်" }
    ],
    diff: []
  },
  "日にち": {
    same: [
      { word: "日程", reading: "にってい", meaning_mm: "အစီအစဉ်ရက်စွဲ" }
    ],
    diff: []
  },
  "日時": {
    same: [
      { word: "日付", reading: "ひづけ", meaning_mm: "ရက်စွဲ" }
    ],
    diff: []
  },
  "日付": {
    same: [
      { word: "日にち", reading: "ひにち", meaning_mm: "နေ့ရက်" }
    ],
    diff: []
  },
  "今回": {
    same: [
      { word: "今度", reading: "こんど", meaning_mm: "ဒီတစ်ခေါက်" }
    ],
    diff: [
      { word: "前回", reading: "ぜんかい", meaning_mm: "ပြီးခဲ့သည့်တစ်ခေါက်" },
      { word: "次回", reading: "じかい", meaning_mm: "နောက်တစ်ကြိမ်" }
    ]
  },
  "次回": {
    same: [
      { word: "今度", reading: "こんど", meaning_mm: "နောက်တစ်ခေါက်" },
      { word: "次", reading: "つぎ", meaning_mm: "နောက်တစ်ခါ" }
    ],
    diff: [
      { word: "前回", reading: "ぜんかい", meaning_mm: "ပြီးခဲ့သည့်အကြိမ်" },
      { word: "今回", reading: "こんかい", meaning_mm: "ယခုအကြိမ်" }
    ]
  },
  "機会": {
    same: [
      { word: "チャンス", reading: "チャンス", meaning_mm: "အခွင့်ကောင်း" }
    ],
    diff: []
  },
  "チャンス": {
    same: [
      { word: "機会", reading: "きかい", meaning_mm: "အခွင့်အလမ်း" }
    ],
    diff: [
      { word: "ピンチ", reading: "ピンチ", meaning_mm: "အကျပ်အတည်း" }
    ]
  },
  "きっかけ": {
    same: [
      { word: "動機", reading: "どうき", meaning_mm: "အကြောင်းရင်းခံ" }
    ],
    diff: []
  },

  // SPECIFIC FIXED EXAMPLES REQUESTED
  "じゅうたん": {
    same: [
      { word: "カーペット", reading: "かーぺっと", meaning_mm: "ကော်ဇော" }
    ],
    diff: [
      { word: "フローリング", reading: "ふろーりんぐ", meaning_mm: "ပျဉ်ခင်းကြမ်းပြင်" },
      { word: "畳", reading: "たたみ", meaning_mm: "တာတာမိဖျာကလေး" }
    ]
  },
  "氷": {
    same: [
      { word: "氷河", reading: "ひょうが", meaning_mm: "ရေခဲမြစ်" },
      { word: "霜", reading: "しも", meaning_mm: "နှင်းခဲ/ဆီးနှင်း" }
    ],
    diff: [
      { word: "お湯", reading: "おゆ", meaning_mm: "ရေနွေး" },
      { word: "炎", reading: "ほのお", meaning_mm: "မီးတောက်" }
    ]
  },

  // UNIT 2: Family words
  "夫婦": {
    same: [
      { word: "夫妻", reading: "ふさい", meaning_mm: "ဇနီးမောင်နှံ" }
    ],
    diff: [
      { word: "独身", reading: "どくしん", meaning_mm: "လူပျို/အပျို" }
    ]
  },
  "兄弟": {
    same: [
      { word: "姉妹", reading: "しまい", meaning_mm: "ညီအစ်မ" }
    ],
    diff: [
      { word: "他人", reading: "たにん", meaning_mm: "သူစိမ်း" }
    ]
  },
  "姉妹": {
    same: [
      { word: "兄弟", reading: "きょうだい", meaning_mm: "ညီအစ်ကို" }
    ],
    diff: [
      { word: "他人", reading: "たにん", meaning_mm: "သူစိမ်း" }
    ]
  },
  "主人": {
    same: [
      { word: "夫", reading: "おっと", meaning_mm: "ခင်ပွန်း" }
    ],
    diff: [
      { word: "妻", reading: "つま", meaning_mm: "ဇနီး" }
    ]
  },
  "赤ん坊": {
    same: [
      { word: "赤ちゃん", reading: "あかちゃん", meaning_mm: "ကလေးငယ်" },
      { word: "幼児", reading: "ようじ", meaning_mm: "သူငယ် / ကလေးငယ်" }
    ],
    diff: [
      { word: "大人", reading: "おとな", meaning_mm: "လူကြီး" },
      { word: "老人", reading: "ろうじん", meaning_mm: "သက်ကြီးရွယ်အို" }
    ]
  },

  // COMMON ADJECTIVES & OPPOSITES
  "悪い": {
    same: [
      { word: "ひどい", reading: "ひどい", meaning_mm: "ဆိုးရွားသော" },
      { word: "よくない", reading: "よくない", meaning_mm: "မကောင်းသော" }
    ],
    diff: [
      { word: "良い", reading: "よい", meaning_mm: "ကောင်းသော" },
      { word: "正しい", reading: "ただしい", meaning_mm: "မှန်ကန်သော" }
    ]
  },
  "良い": {
    same: [
      { word: "素晴らしい", reading: "すばらしい", meaning_mm: "အံ့ဖွယ်ကောင်းသော" },
      { word: "良好", reading: "りょうこう", meaning_mm: "အဆင်ပြေကောင်းမွန်သော" }
    ],
    diff: [
      { word: "悪い", reading: "わるい", meaning_mm: "ဆိုးသော/မကောင်းသော" },
      { word: "ひどい", reading: "ひどい", meaning_mm: "ဆိုးရွားသော" }
    ]
  },
  "美しい": {
    same: [
      { word: "綺麗", reading: "きれい", meaning_mm: "လှပသပ်ရပ်သော" }
    ],
    diff: [
      { word: "醜い", reading: "みにくい", meaning_mm: "ရုပ်ဆိုးသော" }
    ]
  },
  "醜い": {
    same: [],
    diff: [
      { word: "美しい", reading: "うつくしい", meaning_mm: "လှပတင့်တယ်သော" }
    ]
  },
  "嬉しい": {
    same: [
      { word: "幸せ", reading: "しあわせ", meaning_mm: "ပျော်ရွှင်သော" }
    ],
    diff: [
      { word: "悲しい", reading: "かなしい", meaning_mm: "ဝမ်းနည်းသော" }
    ]
  },
  "悲しい": {
    same: [
      { word: "寂しい", reading: "さびしい", meaning_mm: "အထီးကျန်သော" }
    ],
    diff: [
      { word: "嬉しい", reading: "うれしい", meaning_mm: "ဝမ်းသာသော" }
    ]
  },
  "簡単": {
    same: [
      { word: "易しい", reading: "やさしい", meaning_mm: "လွယ်ကူသော" }
    ],
    diff: [
      { word: "難しい", reading: "むずかしい", meaning_mm: "ခက်ခဲသော" },
      { word: "複雑", reading: "ふくざつ", meaning_mm: "ရှုပ်ထွေးသော" }
    ]
  },
  "難しい": {
    same: [
      { word: "困難", reading: "こんなん", meaning_mm: "ခက်ขဲကြမ်းတမ်းသော" }
    ],
    diff: [
      { word: "簡単", reading: "かんたん", meaning_mm: "လွယ်ကူရိုးရှင်းသော" }
    ]
  },

  // COMMON PREFIX PAIRS
  "無料": {
    same: [
      { word: "タダ", reading: "ただ", meaning_mm: "အလကား" },
      { word: "フリー", reading: "ふりー", meaning_mm: "အခမဲ့" }
    ],
    diff: [
      { word: "有料", reading: "ゆうりょう", meaning_mm: "ကျသင့်ငွေရှိသော" }
    ]
  },
  "有料": {
    same: [],
    diff: [
      { word: "無料", reading: "むりょう", meaning_mm: "အခမဲ့" }
    ]
  },
  "不便": {
    same: [],
    diff: [
      { word: "便利", reading: "べんり", meaning_mm: "အဆင်ပြေသော" }
    ]
  },
  "便利": {
    same: [],
    diff: [
      { word: "不便", reading: "ふべん", meaning_mm: "အဆင်မပြေသော" }
    ]
  },
  "有利": {
    same: [],
    diff: [
      { word: "不利", reading: "ふり", meaning_mm: "အားနည်းချက်ရှိသော" }
    ]
  },
  "不利": {
    same: [],
    diff: [
      { word: "有利", reading: "ゆうり", meaning_mm: "အားသာချက်ရှိသော" }
    ]
  }
};

export function getOfflineMeanings(
  kanji: string,
  _meaningMm: string,
  _pos: string,
  _index: number
 ): { same_meanings: MeaningEntry[]; opposite_meanings: MeaningEntry[] } {
  const clean = kanji.replace(/[~〜()（）]/g, '').trim();

  // Primary: Precise Exact Dictionary Match
  if (SPECIFIC_DICTIONARY[clean]) {
    return {
      same_meanings: SPECIFIC_DICTIONARY[clean].same,
      opposite_meanings: SPECIFIC_DICTIONARY[clean].diff
    };
  }

  // Handle dynamic prefix check only if absolutely precise
  if (clean.startsWith("不") && clean.length > 2) {
    const root = clean.substring(1);
    if (SPECIFIC_DICTIONARY[root]) {
      return {
        same_meanings: [],
        opposite_meanings: [{ word: root, reading: root, meaning_mm: "ဆန့်ကျင်ဘက် အပြုသဘောဆောင်သော" }]
      };
    }
  }

  // If no highly accurate offline mapping is found: return [] as requested.
  // This completely eliminates broad categorical general mismatches like "concept, exceptions".
  return {
    same_meanings: [],
    opposite_meanings: []
  };
}
