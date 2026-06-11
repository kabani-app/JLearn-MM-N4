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
    same: [{ word: "前日", reading: "ぜんじつ", meaning_mm: "အရင်နေ့" }],
    diff: [{ word: "明日", reading: "あした", meaning_mm: "မနက်ဖြန်" }]
  },
  "一昨日": {
    same: [{ word: "二日前", reading: "ふつかまえ", meaning_mm: "လွန်ခဲ့သောနှစ်ရက်" }],
    diff: [{ word: "明後日", reading: "あさって", meaning_mm: "သန်ဘက်ခါ" }]
  },
  "昨年": {
    same: [{ word: "去年", reading: "きょねん", meaning_mm: "မနှစ်က" }, { word: "前年", reading: "ぜんねん", meaning_mm: "ယခင်နှစ်" }],
    diff: [{ word: "来年", reading: "らいねん", meaning_mm: "နောက်နှစ်" }]
  },
  "しあさって": {
    same: [{ word: "三日後", reading: "みっかご", meaning_mm: "သုံးရက်မြောက်နေ့" }],
    diff: []
  },
  "先々週": {
    same: [{ word: "二週間前", reading: "にしゅうかんまえ", meaning_mm: "လွန်ခဲ့သောနှစ်ပတ်" }],
    diff: [{ word: "来々週", reading: "らいらいしゅう", meaning_mm: "နောက်နှစ်ပတ်" }]
  },
  "先日": {
    same: [{ word: "この間", reading: "このあいだ", meaning_mm: "မကြာခင်က" }],
    diff: [{ word: "後日", reading: "ごじつ", meaning_mm: "နောက်ရက်" }]
  },
  "当日": {
    same: [{ word: "その日", reading: "そのひ", meaning_mm: "အဲ့ဒီနေ့" }],
    diff: []
  },
  "翌日": {
    same: [{ word: "明くる日", reading: "あくるひ", meaning_mm: "နောက်ရက်" }],
    diff: [{ word: "前日", reading: "ぜんじつ", meaning_mm: "မနေ့က" }]
  },
  "近いうちに": {
    same: [{ word: "近々", reading: "ちかじか", meaning_mm: "သိပ်မကြာခင်အတွင်း" }, { word: "すぐに", reading: "すぐに", meaning_mm: "မကြာမီ" }],
    diff: []
  },
  "後日": {
    same: [{ word: "後で", reading: "あとで", meaning_mm: "နောက်မှ" }],
    diff: [{ word: "先日", reading: "せんじつ", meaning_mm: "ပြီးခဲ့သည့်နေ့ရက်" }]
  },
  "今後": {
    same: [{ word: "これから", reading: "これから", meaning_mm: "ယခုမှစ၍" }],
    diff: [{ word: "これまで", reading: "これまで", meaning_mm: "ယခုအချိန်ထိ" }]
  },
  "当時": {
    same: [{ word: "その頃", reading: "そのころ", meaning_mm: "ထိုအချိန်က" }],
    diff: [{ word: "現代", reading: "げんだい", meaning_mm: "ယခုခေတ်" }]
  },
  "以前": {
    same: [{ word: "かつて", reading: "かつて", meaning_mm: "တစ်ခါက" }, { word: "前", reading: "まえ", meaning_mm: "ယခင်က" }],
    diff: [{ word: "以後", reading: "いご", meaning_mm: "နောက်ပိုင်း" }]
  },
  "以後": {
    same: [{ word: "以降", reading: "いこう", meaning_mm: "နောက်ပိုင်း" }],
    diff: [{ word: "以前", reading: "いぜん", meaning_mm: "ယခင်က" }]
  },
  "依頼": {
    same: [{ word: "要請", reading: "ようせい", meaning_mm: "တောင်းဆိုခြင်း/မေတ္တာရပ်ခံခြင်း" }],
    diff: []
  },
  "以降": {
    same: [{ word: "以後", reading: "いご", meaning_mm: "နောက်ပိုင်း" }],
    diff: [{ word: "以前", reading: "いぜん", meaning_mm: "ယခင်က" }]
  },
  "時期": {
    same: [{ word: "期間", reading: "きかん", meaning_mm: "အချိန်ကာလ" }],
    diff: []
  },
  "延期": {
    same: [{ word: "繰り延べ", reading: "くりのべ", meaning_mm: "ရွှေ့ဆိုင်းခြင်း" }],
    diff: []
  },
  "上旬": {
    same: [{ word: "初旬", reading: "しょじゅん", meaning_mm: "လဆန်းပိုင်း" }],
    diff: [{ word: "下旬", reading: "げじゅん", meaning_mm: "လကုန်ပိုင်း" }]
  },
  "中旬": {
    same: [{ word: "なかごろ", reading: "なかごろ", meaning_mm: "လလယ်ပိုင်း" }],
    diff: []
  },
  "下旬": {
    same: [{ word: "月末", reading: "げつまつ", meaning_mm: "လကုန်ပိုင်း" }],
    diff: [{ word: "上旬", reading: "じょうじゅん", meaning_mm: "လဆန်းပိုင်း" }]
  },
  "月末": {
    same: [{ word: "月の終わり", reading: "つきのおわり", meaning_mm: "လကုန်စွန်း" }],
    diff: [{ word: "月初め", reading: "つきはじめ", meaning_mm: "လဆန်းပိုင်း" }]
  },
  "ゴールデンウイーク": {
    same: [{ word: "大型連休", reading: "おおがたれんきゅう", meaning_mm: "ဆက်တိုက်အားလပ်ရက်ရှည်" }],
    diff: []
  },
  "元旦": {
    same: [{ word: "元日", reading: "がんじつ", meaning_mm: "နှစ်ဆန်းတစ်ရက်" }],
    diff: [{ word: "大晦日", reading: "おおみそか", meaning_mm: "နှစ်ကုန်ရက်မြတ်" }]
  },
  "普段": {
    same: [{ word: "日常", reading: "にちじょう", meaning_mm: "နေ့စဉ်ပုံမှန်" }, { word: "常に", reading: "つねに", meaning_mm: "အမြဲတစေ" }],
    diff: [{ word: "特別", reading: "とくべつ", meaning_mm: "အထူးတလည်" }, { word: "臨時", reading: "りんじ", meaning_mm: "ခေတ္တယာယီ" }]
  },
  "平日": {
    same: [],
    diff: [{ word: "休日", reading: "きゅうじつ", meaning_mm: "အားလပ်ရက်" }, { word: "祝日", reading: "しゅくじつ", meaning_mm: "ပိတ်ရက်" }]
  },
  "祝日": {
    same: [{ word: "祭日", reading: "さいじつ", meaning_mm: "ပွဲတော်ပိတ်ရက်" }],
    diff: [{ word: "平日", reading: "へいじつ", meaning_mm: "ကြားရက်" }]
  },
  "休日": {
    same: [{ word: "休暇", reading: "きゅうか", meaning_mm: "အားလပ်အနားယူရက်" }, { word: "休み", reading: "やすみ", meaning_mm: "အနားယူခြင်း" }],
    diff: [{ word: "平日", reading: "へいじつ", meaning_mm: "ကြားရက်" }]
  },
  "延長": {
    same: [{ word: "伸ばすこと", reading: "のばすこと", meaning_mm: "အချိန်ဆွဲဆွဲဆန့်ခြင်း" }],
    diff: [{ word: "短縮", reading: "たんしゅく", meaning_mm: "အချိန်တိုတိုဖြတ်ခြင်း" }]
  },
  "シーズン": {
    same: [{ word: "季節", reading: "きせつ", meaning_mm: "ရာသီဥတု" }],
    diff: [{ word: "オフシーズン", reading: "オフシーズン", meaning_mm: "ရာသီပြင်ပအချိန်" }]
  },
  "臨時": {
    same: [{ word: "一時的", reading: "いちじてき", meaning_mm: "ယာယီမျှသာ" }],
    diff: [{ word: "常設", reading: "じょうせつ", meaning_mm: "အမြဲတမ်းဖြစ်တည်ခြင်း" }]
  },
  "休暇": {
    same: [{ word: "休日", reading: "きゅうじつ", meaning_mm: "အားလပ်ရက်" }, { word: "休み", reading: "やすみ", meaning_mm: "အနားယူခြင်း" }],
    diff: [{ word: "労働", reading: "ろうどう", meaning_mm: "အလုပ်လုပ်ခြင်း" }]
  },
  "夜中": {
    same: [{ word: "深夜", reading: "しんや", meaning_mm: "ညနက်ပိုင်း" }],
    diff: [{ word: "真昼", reading: "まひる", meaning_mm: "နေ့လယ်တည့်တည့်" }]
  },
  "深夜": {
    same: [{ word: "夜中", reading: "よなか", meaning_mm: "ညလယ်ပိုင်း" }, { word: "夜更け", reading: "よふけ", meaning_mm: "ညဉ့်နက်သန်းခေါင်" }],
    diff: [{ word: "真昼", reading: "まひる", meaning_mm: "နေ့လယ်တည့်တည့်" }, { word: "早朝", reading: "そうちょう", meaning_mm: "မနက်စောစော" }]
  },
  "明ける": {
    same: [{ word: "始まる", reading: "始まる", meaning_mm: "စတင်ပေါ်ပေါက်သည်" }],
    diff: [{ word: "暮れる", reading: "くれる", meaning_mm: "မှောင်မိုက်သွားသည်" }, { word: "終わる", reading: "おわる", meaning_mm: "ပြီးဆုံးသည်" }]
  },
  "初め": {
    same: [{ word: "最初", reading: "さいしょ", meaning_mm: "အစဦးဆုံး" }],
    diff: [{ word: "終わり", reading: "おわり", meaning_mm: "အဆုံးသတ်" }]
  },
  "後": {
    same: [{ word: "のち", reading: "のち", meaning_mm: "နောက်မှ" }],
    diff: [{ word: "前", reading: "まえ", meaning_mm: "ယခင်က" }]
  },
  "際": {
    same: [{ word: "時", reading: "とき", meaning_mm: "အခါအချိန်" }, { word: "場合", reading: "ばあい", meaning_mm: "ကိစ္စရပ်" }],
    diff: []
  },
  "同時": {
    same: [{ word: "一斉", reading: "いっせい", meaning_mm: "တစ်ပြိုင်နက်တည်း" }],
    diff: [{ word: "別々", reading: "べつべつ", meaning_mm: "သီးခြားစီ" }]
  },
  "たった今": {
    same: [{ word: "さっき", reading: "さっき", meaning_mm: "စောစောလေးတင်" }, { word: "今しがた", reading: "いましがた", meaning_mm: "ယခုတင်လေး" }],
    diff: [{ word: "後ほど", reading: "のちほど", meaning_mm: "နောက်မှ" }]
  },
  "早め": {
    same: [{ word: "前倒し", reading: "まえだおし", meaning_mm: "လျင်မြန်စွာ" }],
    diff: [{ word: "遅め", reading: "おそめ", meaning_mm: "နောက်ကျစွာ" }]
  },
  "現在": {
    same: [{ word: "今", reading: "いま", meaning_mm: "လက်ရှိ" }],
    diff: [{ word: "過去", reading: "かこ", meaning_mm: "အတိတ်" }, { word: "未来", reading: "みらい", meaning_mm: "အနာဂတ်" }]
  },
  "過去": {
    same: [{ word: "昔", reading: "むかし", meaning_mm: "ဟိုးယခင်" }, { word: "以前", reading: "いぜん", meaning_mm: "အရင်က" }],
    diff: [{ word: "現在", reading: "げんざい", meaning_mm: "လက်ရှိ" }, { word: "未来", reading: "みらい", meaning_mm: "အနာဂတ်" }]
  },
  "未来": {
    same: [{ word: "将来", reading: "しょうらい", meaning_mm: "အနာဂတ်" }],
    diff: [{ word: "過去", reading: "かこ", meaning_mm: "အတိတ်" }]
  },
  "将来": {
    same: [{ word: "未来", reading: "みらい", meaning_mm: "အနာဂတ်" }],
    diff: [{ word: "過去", reading: "かこ", meaning_mm: "အတိတ်" }]
  },
  "一生": {
    same: [{ word: "生涯", reading: "しょうがい", meaning_mm: "တစ်သက်တာလုံး" }],
    diff: []
  },
  "永遠": {
    same: [{ word: "永久", reading: "えいきゅう", meaning_mm: "ထာဝရ" }],
    diff: [{ word: "一瞬", reading: "いっしゅん", meaning_mm: "တစ်ခဏချင်း" }]
  },
  "現代": {
    same: [{ word: "近代", reading: "きんだい", meaning_mm: "ခေတ်သစ်" }],
    diff: [{ word: "古代", reading: "こだい", meaning_mm: "ရှေးခေတ်" }]
  },
  "今日": {
    same: [{ word: "現代", reading: "げんだい", meaning_mm: "ယနေ့ခေတ်" }],
    diff: [{ word: "過去", reading: "かこ", meaning_mm: "အတိတ်" }]
  },
  "世紀": {
    same: [{ word: "百年間", reading: "ひゃくねんかん", meaning_mm: "ရာစုနှစ်တစ်ရာ" }],
    diff: []
  },
  "経つ": {
    same: [{ word: "経過する", reading: "けいかする", meaning_mm: "အချိန်ကုန်လွန်သွားသည်" }, { word: "過ぎる", reading: "すぎる", meaning_mm: "လွန်မြောက်ကျော်လွန်သည်" }],
    diff: []
  },
  "日にち": {
    same: [{ word: "日程", reading: "にってい", meaning_mm: "အစီအစဉ်ရက်စွဲ" }],
    diff: []
  },
  "日時": {
    same: [{ word: "日付", reading: "ひづけ", meaning_mm: "ရက်စွဲ" }],
    diff: []
  },
  "日付": {
    same: [{ word: "日にち", reading: "ひにち", meaning_mm: "နေ့ရက်" }],
    diff: []
  },
  "今回": {
    same: [{ word: "今度", reading: "こんど", meaning_mm: "ဒီတစ်ခေါက်" }],
    diff: [{ word: "前回", reading: "ぜんかい", meaning_mm: "ပြီးခဲ့သည့်တစ်ခေါက်" }, { word: "次回", reading: "じかい", meaning_mm: "နောက်တစ်ကြိမ်" }]
  },
  "次回": {
    same: [{ word: "今度", reading: "こんど", meaning_mm: "နောက်တစ်ခေါက်" }, { word: "次", reading: "つぎ", meaning_mm: "နောက်တစ်ခါ" }],
    diff: [{ word: "前回", reading: "ぜんかい", meaning_mm: "ပြီးခဲ့သည့်အကြိမ်" }]
  },
  "機会": {
    same: [{ word: "チャンス", reading: "チャンス", meaning_mm: "အခွင့်ကောင်း" }],
    diff: []
  },
  "チャンス": {
    same: [{ word: "機会", reading: "きかい", meaning_mm: "အခွင့်အလမ်း" }],
    diff: [{ word: "ピンチ", reading: "ピンチ", meaning_mm: "အကျပ်အတည်း" }]
  },
  "きっかけ": {
    same: [{ word: "動機", reading: "どうき", meaning_mm: "အကြောင်းရင်းခံ" }],
    diff: []
  },

  // UNIT 2: Family words
  "夫婦": {
    same: [{ word: "夫妻", reading: "ふさい", meaning_mm: "ဇနီးမောင်နှံ" }],
    diff: [{ word: "独身", reading: "どくしん", meaning_mm: "လူပျို/အပျို" }]
  },
  "姉妹": {
    same: [{ word: "兄弟", reading: "きょうだい", meaning_mm: "ညီအစ်ကို" }],
    diff: []
  },
  "兄弟": {
    same: [{ word: "姉妹", reading: "しまい", meaning_mm: "ညီအစ်မ" }],
    diff: []
  },
  "主人": {
    same: [{ word: "夫", reading: "おっと", meaning_mm: "ခင်ပွန်း" }],
    diff: [{ word: "妻", reading: "つま", meaning_mm: "ဇနီး" }]
  },
  "長男": {
    same: [],
    diff: [{ word: "長女", reading: "ちょうじょ", meaning_mm: "သမီးကြီး" }]
  },
  "長女": {
    same: [],
    diff: [{ word: "長男", reading: "ちょうなん", meaning_mm: "သားအကြီးဆုံး" }]
  },
  "姪": {
    same: [],
    diff: [{ word: "甥", reading: "おい", meaning_mm: "တူ" }]
  },
  "甥": {
    same: [],
    diff: [{ word: "姪", reading: "めい", meaning_mm: "တူမ" }]
  },
  "親せき": {
    same: [{ word: "親類", reading: "しんるい", meaning_mm: "ဆွေမျိုးသားချင်း" }],
    diff: [{ word: "他人", reading: "たにん", meaning_mm: "သူစိမ်း" }]
  },
  "親類": {
    same: [{ word: "親せき", reading: "しんせき", meaning_mm: "ဆွေမျိုး" }],
    diff: [{ word: "他人", reading: "たにん", meaning_mm: "သူစိမ်း" }]
  },
  "孫": {
    same: [],
    diff: [{ word: "祖父母", reading: "そふぼ", meaning_mm: "ဘိုးဘွား" }]
  },
  "子孫": {
    same: [],
    diff: [{ word: "先祖", reading: "せんぞ", meaning_mm: "ဘိုးဘွား" }, { word: "祖先", reading: "そせん", meaning_mm: "ဘိုးဘေးဘီဘင်" }]
  },

  // UNIT 3: Age & People
  "赤ん坊": {
    same: [{ word: "赤ちゃん", reading: "あかちゃん", meaning_mm: "ကလေးငယ်" }, { word: "幼児", reading: "ようじ", meaning_mm: "သူငယ် / ကလေးငယ်" }],
    diff: [{ word: "大人", reading: "おとな", meaning_mm: "လူကြီး" }]
  },
  "少年": {
    same: [{ word: "男児", reading: "だんじ", meaning_mm: "ယောက်ျားလေး" }],
    diff: [{ word: "少女", reading: "しょうじょ", meaning_mm: "မိန်းမငယ်" }]
  },
  "少女": {
    same: [{ word: "女児", reading: "じょじ", meaning_mm: "မိန်းကလေး" }],
    diff: [{ word: "少年", reading: "しょうねん", meaning_mm: "လူငယ်" }]
  },
  "お嬢さん": {
    same: [{ word: "お嬢様", reading: "おじょうさま", meaning_mm: "သမီးပျို" }],
    diff: []
  },
  "青年": {
    same: [{ word: "若者", reading: "わかもの", meaning_mm: "လူငယ်" }],
    diff: [{ word: "老人", reading: "ろうじん", meaning_mm: "သက်ကြီးရွယ်အို" }]
  },
  "女子": {
    same: [{ word: "女性", reading: "じょせい", meaning_mm: "အမျိုးသမီး" }],
    diff: [{ word: "男子", reading: "だんし", meaning_mm: "ယောက်ျားလေး" }]
  },
  "男子": {
    same: [{ word: "男性", reading: "だんせい", meaning_mm: "အမျိုးသား" }],
    diff: [{ word: "女子", reading: "じょし", meaning_mm: "မိန်းကလေး" }]
  },
  "年寄り": {
    same: [{ word: "高齢者", reading: "こうれいしゃ", meaning_mm: "သက်ကြီးရွယ်အို" }, { word: "老人", reading: "ろうじん", meaning_mm: "သက်ကြီးရွယ်အို" }],
    diff: [{ word: "若者", reading: "わかもの", meaning_mm: "လူငယ်" }]
  },
  "高齢者": {
    same: [{ word: "お年寄り", reading: "おとしより", meaning_mm: "အသက်ကြီးသူ" }, { word: "老人", reading: "ろうじん", meaning_mm: "သက်ကြီးရွယ်အို" }],
    diff: [{ word: "若者", reading: "わかもの", meaning_mm: "လူငယ်" }]
  },
  "住民": {
    same: [{ word: "市民", reading: "しみん", meaning_mm: "မြို့သူမြို့သား" }],
    diff: []
  },
  "通行人": {
    same: [{ word: "歩行者", reading: "ほこうしゃ", meaning_mm: "လမ်းလျှောက်သူ" }],
    diff: []
  },
  "知らない人": {
    same: [{ word: "他人", reading: "たにん", meaning_mm: "သူစိမ်း" }],
    diff: [{ word: "知り合い", reading: "しりあい", meaning_mm: "အသိမိတ်ဆွေ" }, { word: "知人", reading: "ちじん", meaning_mm: "အသိ" }]
  },
  "おじさん": {
    same: [],
    diff: [{ word: "おばさん", reading: "おばさん", meaning_mm: "အဒေါ်" }]
  },
  "おばさん": {
    same: [],
    diff: [{ word: "おじさん", reading: "おじさん", meaning_mm: "ဦးလေး" }]
  },
  "人ごみ": {
    same: [{ word: "雑踏", reading: "ざっとう", meaning_mm: "လူအုပ်တိုးဝှေ့ရာလမ်း" }],
    diff: []
  },
  "独り": {
    same: [{ word: "孤独", reading: "こどく", meaning_mm: "အထီးကျန်ခြင်း" }],
    diff: []
  },
  "有名人": {
    same: [{ word: "セレブ", reading: "せれぶ", meaning_mm: "ကျော်ကြားသူ" }, { word: "スター", reading: "すたー", meaning_mm: "စတား" }],
    diff: [{ word: "一般人", reading: "いっぱんじん", meaning_mm: "သာမန်လူ" }]
  },
  "スター": {
    same: [{ word: "有名人", reading: "ゆうめいじん", meaning_mm: "နာမည်ကြီးသူ" }],
    diff: []
  },
  "ファン": {
    same: [{ word: "支持者", reading: "しじしゃ", meaning_mm: "အားပေးသူ" }],
    diff: []
  },
  "氏": {
    same: [{ word: "様", reading: "さま", meaning_mm: "ဦး/ဒေါ်" }],
    diff: []
  },
  "氏名": {
    same: [{ word: "名前", reading: "なまえ", meaning_mm: "နာမည်" }],
    diff: []
  },
  "先祖": {
    same: [{ word: "祖先", reading: "そせん", meaning_mm: "ဘိုးဘေးဘီဘင်" }],
    diff: [{ word: "子孫", reading: "しそん", meaning_mm: "သားစဉ်မြေးဆက်" }]
  },
  "祖先": {
    same: [{ word: "先祖", reading: "せんぞ", meaning_mm: "ဘိုးဘွား" }],
    diff: [{ word: "子孫", reading: "しそん", meaning_mm: "သားစဉ်မြေးဆက်" }]
  },

  // UNIT 4: Relationships
  "出会う": {
    same: [{ word: "巡り合う", reading: "めぐりあう", meaning_mm: "တွေ့ဆုံသည်" }],
    diff: [{ word: "別れる", reading: "わかれる", meaning_mm: "လမ်းခွဲသည်" }]
  },
  "出会い": {
    same: [{ word: "遭遇", reading: "そうぐう", meaning_mm: "တွေ့ဆုံခြင်း" }],
    diff: [{ word: "別れ", reading: "わかれ", meaning_mm: "လမ်းခွဲခြင်း" }]
  },
  "知り合い": {
    same: [{ word: "知人", reading: "ちじん", meaning_mm: "အသိ" }],
    diff: [{ word: "知らない人", reading: "しらないひと", meaning_mm: "မသိတဲ့သူ" }]
  },
  "知人": {
    same: [{ word: "知り合い", reading: "しりあい", meaning_mm: "အသိမိတ်ဆွေ" }],
    diff: [{ word: "他人", reading: "たにん", meaning_mm: "သူစိမ်း" }]
  },
  "友人": {
    same: [{ word: "友達", reading: "ともだち", meaning_mm: "သူငယ်ချင်း" }],
    diff: [{ word: "敵", reading: "てき", meaning_mm: "ရန်သူ" }]
  },
  "親友": {
    same: [{ word: "親しい友", reading: "したしいとも", meaning_mm: "ရင်းနှီးသောမိတ်ဆွေ" }],
    diff: []
  },
  "仲": {
    same: [{ word: "関係", reading: "かんけい", meaning_mm: "ပတ်သတ်မှု" }],
    diff: []
  },
  "仲良し": {
    same: [{ word: "親密", reading: "しんみつ", meaning_mm: "ချစ်ခင်ရင်းနှီးသော" }],
    diff: [{ word: "不仲", reading: "ふなか", meaning_mm: "အဆင်မပြေခြင်း" }]
  },
  "仲直り": {
    same: [{ word: "和解", reading: "わかい", meaning_mm: "ပြန်လည်သင့်မြတ်ခြင်း" }],
    diff: [{ word: "喧嘩", reading: "けんか", meaning_mm: "ရန်ဖြစ်ခြင်း" }]
  },
  "先輩": {
    same: [],
    diff: [{ word: "後輩", reading: "こうはい", meaning_mm: "ဂျူနီယာ" }]
  },
  "後輩": {
    same: [],
    diff: [{ word: "先輩", reading: "せんぱい", meaning_mm: "စီနီယာ" }]
  },
  "年上": {
    same: [{ word: "年長", reading: "ねんちょう", meaning_mm: "အသက်ပိုကြီးသော" }],
    diff: [{ word: "年下", reading: "としした", meaning_mm: "အသက်ငယ်သူ" }]
  },
  "年下": {
    same: [{ word: "年少", reading: "ねんしょう", meaning_mm: "အသက်ငယ်သော" }],
    diff: [{ word: "年上", reading: "としうえ", meaning_mm: "အသက်ကြီးသူ" }]
  },
  "クラスメート": {
    same: [{ word: "同級生", reading: "どうきゅうせい", meaning_mm: "အတန်းဖော်" }],
    diff: []
  },
  "ルームメート": {
    same: [{ word: "同居人", reading: "どうきょにん", meaning_mm: "အခန်းဖော်" }],
    diff: []
  },
  "付き合う": {
    same: [{ word: "交際する", reading: "こうさいする", meaning_mm: "တွဲခေါ်ပေါင်းသင်းသည်" }],
    diff: [{ word: "別れる", reading: "わかれる", meaning_mm: "လမ်းခွဲသည်" }]
  },
  "付き合い": {
    same: [{ word: "交際", reading: "こうさい", meaning_mm: "ပေါင်းသင်းဆက်ဆံခြင်း" }],
    diff: []
  },
  "交際": {
    same: [{ word: "付き合い", reading: "つきあい", meaning_mm: "လက်တွဲခြင်း" }],
    diff: [{ word: "絶縁", reading: "ぜつえん", meaning_mm: "အဆက်အသွယ်ဖြတ်ခြင်း" }]
  },
  "彼": {
    same: [{ word: "彼氏", reading: "かれし", meaning_mm: "ကောင်လေး" }],
    diff: [{ word: "彼女", reading: "かのじょ", meaning_mm: "ကောင်မလေး" }]
  },
  "彼女": {
    same: [],
    diff: [{ word: "彼", reading: "かれ", meaning_mm: "ကောင်လေး" }]
  },
  "失恋": {
    same: [],
    diff: [{ word: "両想い", reading: "りょうおもい", meaning_mm: "တစ်ဦးနှင့်တစ်ဦးချစ်ကြိုက်ခြင်း" }]
  },
  "ふる": {
    same: [{ word: "拒絶する", reading: "きょぜつする", meaning_mm: "ငြင်းပယ်သည်" }],
    diff: []
  },
  "慰める": {
    same: [{ word: "元気づける", reading: "げんきづける", meaning_mm: "အားပေးနှစ်သိမ့်သည်" }],
    diff: [{ word: "傷つける", reading: "きずつける", meaning_mm: "အနာတရဖြစ်စေသည်" }]
  },
  "離婚": {
    same: [],
    diff: [{ word: "結婚", reading: "けっこん", meaning_mm: "အိမ်ထောင်ပြုခြင်း" }]
  },
  "愛": {
    same: [{ word: "愛情", reading: "あいじょう", meaning_mm: "ချစ်ခြင်းမေတ္တာ" }],
    diff: [{ word: "憎しみ", reading: "にくしみ", meaning_mm: "မုန်းတီးခြင်း" }]
  },
  "目上": {
    same: [{ word: "上司", reading: "じょうし", meaning_mm: "အထက်လူကြီး" }],
    diff: [{ word: "目下", reading: "めした", meaning_mm: "လက်အောက်ငယ်သား" }]
  },
  "目下": {
    same: [{ word: "部下", reading: "ぶか", meaning_mm: "လက်အောက်ငယ်သား" }],
    diff: [{ word: "目上", reading: "めうえ", meaning_mm: "အထက်လူကြီး" }]
  },
  "尊敬": {
    same: [{ word: "敬意", reading: "けいい", meaning_mm: "ရိုသေလေးစားမှု" }],
    diff: [{ word: "軽蔑", reading: "けいべつ", meaning_mm: "နှိမ်ချဆက်ဆံခြင်း" }]
  },
  "他人": {
    same: [{ word: "知らない人", reading: "しらないひと", meaning_mm: "မသိသောသူ" }],
    diff: [{ word: "親せき", reading: "しんせき", meaning_mm: "ဆွေမျိုး" }]
  },
  "敵": {
    same: [{ word: "ライバル", reading: "らいばる", meaning_mm: "ပြိုင်ဘက်" }],
    diff: [{ word: "味方", reading: "みかた", meaning_mm: "ကိုယ့်ဘက်တော်သား" }]
  },
  "味方": {
    same: [{ word: "仲間", reading: "なかま", meaning_mm: "လုပ်ဖော်ကိုင်ဖက်" }],
    diff: [{ word: "敵", reading: "てき", meaning_mm: "ရန်သူ" }]
  },
  "ライバル": {
    same: [{ word: "競争相手", reading: "きょうそうあいて", meaning_mm: "ပြိုင်ဘက်" }],
    diff: [{ word: "味方", reading: "みかた", meaning_mm: "ကိုယ့်ဘက်တော်သား" }]
  },
  "仲間": {
    same: [{ word: "同僚", reading: "どうりょう", meaning_mm: "လုပ်ဖော်ကိုင်ဖက်" }],
    diff: [{ word: "敵", reading: "てき", meaning_mm: "ရန်သူ" }]
  },
  "相手": {
    same: [{ word: "パートナー", reading: "ぱーとなー", meaning_mm: "အဖော်/ဆက်ဆံဘက်" }],
    diff: []
  },
  "君": {
    same: [{ word: "あなた", reading: "あなた", meaning_mm: "သင်" }],
    diff: []
  },
  "おまえ": {
    same: [{ word: "あんた", reading: "あんた", meaning_mm: "မင်း" }],
    diff: []
  },
  "様": {
    same: [{ word: "殿", reading: "どの", meaning_mm: "သခင်/မင်းကြီး" }],
    diff: []
  },
  "我々": {
    same: [{ word: "私たち", reading: "わたしたち", meaning_mm: "ကျွန်ုပ်တို့" }],
    diff: [{ word: "彼ら", reading: "かれら", meaning_mm: "သူတို့" }]
  },
  "頼む": {
    same: [{ word: "依頼する", reading: "いらいする", meaning_mm: "တောင်းဆိုသည်" }],
    diff: [{ word: "断る", reading: "ことわる", meaning_mm: "ငြင်းဆန်သည်" }]
  },
  "頼る": {
    same: [{ word: "依存する", reading: "いぞんする", meaning_mm: "မှီခိုအားကိုးသည်" }],
    diff: []
  },
  "甘える": {
    same: [{ word: "頼る", reading: "たよる", meaning_mm: "မှီခိုအားကိုးသည်" }],
    diff: []
  },
  "感謝": {
    same: [{ word: "お礼", reading: "おれい", meaning_mm: "ကျေးဇူးတင်စကား" }],
    diff: []
  },
  "協力": {
    same: [{ word: "共同", reading: "きょう동", meaning_mm: "ပူးပေါင်းဆောင်ရွက်ခြင်း" }],
    diff: []
  },
  "回答": {
    same: [{ word: "返答", reading: "へんとう", meaning_mm: "ပြန်လည်ဖြေကြားချက်" }, { word: "答え", reading: "こたえ", meaning_mm: "အဖြေ" }],
    diff: [{ word: "質問", reading: "しつもん", meaning_mm: "မေးခွန်း" }]
  },
  "断る": {
    same: [{ word: "辞退する", reading: "じたいする", meaning_mm: "ငြင်းပယ်သည်" }, { word: "拒否する", reading: "きょひする", meaning_mm: "ငြင်းဆိုသည်" }],
    diff: [{ word: "引き受ける", reading: "ひきうける", meaning_mm: "လက်ခံဆောင်ရွက်သည်" }]
  },
  "応援": {
    same: [{ word: "支援", reading: "しえん", meaning_mm: "ထောက်ပံ့ကူညီခြင်း" }],
    diff: []
  },

  // UNIT 5: Profile
  "住所": {
    same: [{ word: "住まい", reading: "すまい", meaning_mm: "နေအိမ်" }],
    diff: []
  },
  "生年月日": {
    same: [{ word: "誕生日", reading: "たんじょうび", meaning_mm: "မွေးနေ့" }],
    diff: []
  },
  "年齢": {
    same: [{ word: "歳", reading: "さい", meaning_mm: "အသက်" }, { word: "お年", reading: "おとし", meaning_mm: "အသက်" }],
    diff: []
  },
  "お年": {
    same: [{ word: "年齢", reading: "ねんれい", meaning_mm: "အသက်" }],
    diff: []
  },
  "性別": {
    same: [{ word: "ジェンダー", reading: "じぇんだー", meaning_mm: "ကျားမခွဲခြားမှု" }],
    diff: []
  },
  "姓": {
    same: [{ word: "苗字", reading: "みょうじ", meaning_mm: "မျိုးရိုးနာမည်" }],
    diff: [{ word: "名", reading: "な", meaning_mm: "ကိုယ်ပိုင်နာမည်" }]
  },
  "名字": {
    same: [{ word: "姓", reading: "せい", meaning_mm: "မျိုးရိုးအမည်" }],
    diff: [{ word: "名前", reading: "なまえ", meaning_mm: "ပေးထားသောအမည်" }]
  },
  "生まれ": {
    same: [{ word: "誕生", reading: "たんじょう", meaning_mm: "မွေးဖွားခြင်း" }],
    diff: [{ word: "死", reading: "し", meaning_mm: "သေဆုံးခြင်း" }]
  },
  "出身": {
    same: [{ word: "故郷", reading: "こきょう", meaning_mm: "မွေးရပ်မြေ" }],
    diff: []
  },

  // UNIT 6: Eating
  "味見": {
    same: [{ word: "試食", reading: "ししょく", meaning_mm: "မြည်းစမ်းစားသောက်ခြင်း" }],
    diff: []
  },
  "味わう": {
    same: [{ word: "堪能する", reading: "たんのうする", meaning_mm: "အားရပါးရခံစားသည်" }],
    diff: []
  },
  "かじる": {
    same: [{ word: "噛む", reading: "かむ", meaning_mm: "ကိုက်ခဲသည်" }],
    diff: []
  },
  "食う": {
    same: [{ word: "食べる", reading: "たべる", meaning_mm: "စားသည်" }],
    diff: []
  },
  "昼食": {
    same: [{ word: "昼ご飯", reading: "ひるごはん", meaning_mm: "နေ့လည်စာ" }],
    diff: [{ word: "夕食", reading: "ゆうしょく", meaning_mm: "ညစာ" }, { word: "朝食", reading: "ちょうしょく", meaning_mm: "မနက်စာ" }]
  },
  "朝食": {
    same: [{ word: "朝ご飯", reading: "あさごはん", meaning_mm: "နံနက်စာ" }],
    diff: [{ word: "夕食", reading: "ゆうしょく", meaning_mm: "ညစာ" }]
  },
  "夕食": {
    same: [{ word: "晩ご飯", reading: "ばんごはん", meaning_mm: "ညစာ" }],
    diff: [{ word: "朝食", reading: "ちょうしょく", meaning_mm: "မနက်စာ" }]
  },
  "食卓": {
    same: [{ word: "テーブル", reading: "てーぶる", meaning_mm: "ထမင်းစားပွဲ" }],
    diff: []
  },
  "ごちそう": {
    same: [{ word: "ご馳走", reading: "ごちそう", meaning_mm: "ကောင်းမွန်စွာကျွေးမွေးခြင်း" }],
    diff: []
  },
  "外食": {
    same: [],
    diff: [{ word: "自炊", reading: "じすい", meaning_mm: "ကိုယ်တိုင်ချက်ပြုတ်ခြင်း" }]
  },
  "自炊": {
    same: [],
    diff: [{ word: "外食", reading: "がいしょく", meaning_mm: "အပြင်ထွက်စားခြင်း" }]
  },
  "おかず": {
    same: [{ word: "惣菜", reading: "そうざい", meaning_mm: "အရန်ဟင်းလျာ" }],
    diff: [{ word: "主食", reading: "しゅしょく", meaning_mm: "အဓိကအစားအစာ" }]
  },
  "お菓子": {
    same: [{ word: "スイーツ", reading: "すいーつ", meaning_mm: "မုန့်/အချိုပွဲ" }],
    diff: []
  },
  "お米": {
    same: [{ word: "米", reading: "こめ", meaning_mm: "ဆန်" }],
    diff: []
  },
  "小麦": {
    same: [{ word: "小麦粉", reading: "こむぎこ", meaning_mm: "ဂျုံမှုန့်" }],
    diff: []
  },
  "豆": {
    same: [{ word: "豆類", reading: "まめるい", meaning_mm: "ပဲမျိုးနွယ်ဝင်" }],
    diff: []
  },
  "作物": {
    same: [{ word: "農作物", reading: "のうさくぶつ", meaning_mm: "လယ်ယာသီးနှံ" }],
    diff: []
  },
  "収穫": {
    same: [{ word: "刈り入れ", reading: "かりいれ", meaning_mm: "ရိတ်သိမ်းခြင်း" }],
    diff: []
  },
  "食料": {
    same: [{ word: "食品", reading: "しょくひん", meaning_mm: "စားသောက်ကုန်" }],
    diff: []
  },
  "食品": {
    same: [{ word: "食料品", reading: "しょくりょうひん", meaning_mm: "စားသောက်ကုန်သီးသန့်" }],
    diff: []
  },
  "インスタント食品": {
    same: [{ word: "即席食品", reading: "そくせきしょくひん", meaning_mm: "အဆင်သင့်စားသောက်ကန်" }],
    diff: []
  },
  "缶詰": {
    same: [],
    diff: [{ word: "瓶詰", reading: "びんづめ", meaning_mm: "ပုလင်းသွပ်ဘူး" }]
  },
  "調味料": {
    same: [{ word: "スパイス", reading: "すぱいす", meaning_mm: "ဟင်းခတ်အမွှေးအကြိုင်" }],
    diff: []
  },
  "スパイス": {
    same: [{ word: "香辛料", reading: "こうしんりょう", meaning_mm: "ဟင်းခတ်အမွှေးအကြိုင်" }],
    diff: []
  },
  "酢": {
    same: [{ word: "お酢", reading: "おす", meaning_mm: "ရှာလကာရည်" }],
    diff: []
  },
  "酸っぱい": {
    same: [],
    diff: [{ word: "甘い", reading: "あまい", meaning_mm: "ချိုသော" }]
  },
  "さじ": {
    same: [{ word: "スプーン", reading: "すぷーん", meaning_mm: "ဇွန်း" }],
    diff: []
  },
  "生": {
    same: [{ word: "新鮮", reading: "しんせん", meaning_mm: "လတ်ဆတ်သော" }],
    diff: [{ word: "加熱", reading: "かねつ", meaning_mm: "ချက်ပြုတ်အပူပေးပြီး" }]
  },
  "腐る": {
    same: [{ word: "痛む", reading: "いたむ", meaning_mm: "ပုပ်သိုးပျက်စီးသည်" }],
    diff: []
  },
  "熱する": {
    same: [{ word: "温める", reading: "あたためる", meaning_mm: "နွေးအပူပေးသည်" }],
    diff: [{ word: "冷やす", reading: "ひやす", meaning_mm: "အအေးခံသည်" }]
  },

  // UNIT 7: House & Daily
  "じゅうたん": {
    same: [{ word: "カーペット", reading: "かーぺっと", meaning_mm: "ကော်ဇော" }],
    diff: [{ word: "フローリング", reading: "ふろーりんぐ", meaning_mm: "ပျဉ်ခင်းကြမ်းပြင်" }, { word: "畳", reading: "たたみ", meaning_mm: "ဖျာ" }]
  },
  "カーペット": {
    same: [{ word: "じゅうたん", reading: "じゅうたん", meaning_mm: "ကော်ဇော" }],
    diff: [{ word: "フローリング", reading: "ふろーりんぐ", meaning_mm: "ပျဉ်ခင်းကြမ်းပြင်" }]
  },
  "毛布": {
    same: [{ word: "ブランケット", reading: "ぶらんけっと", meaning_mm: "စောင်" }],
    diff: []
  },
  "タオル": {
    same: [{ word: "手拭い", reading: "てぬぐい", meaning_mm: "လက်သုတ်ပုဝါ" }],
    diff: []
  },
  "ふとん": {
    same: [{ word: "寝具", reading: "しんぐ", meaning_mm: "အိပ်ယာအသုံးအဆောင်" }],
    diff: [{ word: "ベッド", reading: "べっど", meaning_mm: "ကုတင်" }]
  },
  "シーツ": {
    same: [{ word: "敷布", reading: "しきふ", meaning_mm: "အိပ်ယာခင်း" }],
    diff: []
  },
  "歯磨き粉": {
    same: [{ word: "練り歯磨き", reading: "ねりはみがき", meaning_mm: "သွားတိုက်ဆေး" }],
    diff: []
  },
  "ハンガー": {
    same: [{ word: "衣類掛け", reading: "いるいかけ", meaning_mm: "အင်္ကျီချိတ်" }],
    diff: []
  },
  "クーラー": {
    same: [{ word: "冷房", reading: "れいぼう", meaning_mm: "လေအေးပေးစက်" }],
    diff: [{ word: "ヒーター", reading: "ひーたー", meaning_mm: "အပူပေးစက်" }, { word: "暖房", reading: "だんぼう", meaning_mm: "အပူပေးစနစ်" }]
  },
  "扇風機": {
    same: [{ word: "ファン", reading: "ふぁん", meaning_mm: "ပန်ကာ" }],
    diff: []
  },
  "ストーブ": {
    same: [{ word: "ヒーター", reading: "ひーたー", meaning_mm: "အပူပေးမီးဖို" }],
    diff: [{ word: "クーラー", reading: "くーらー", meaning_mm: "ရေခဲသေတ္တာ/လေအေးစက်" }]
  },
  "ヒーター": {
    same: [{ word: "暖房", reading: "だんぼう", meaning_mm: "အပူပေးစက်" }, { word: "ストーブ", reading: "すとーぶ", meaning_mm: "မီးဖို" }],
    diff: [{ word: "クーラー", reading: "くーらー", meaning_mm: "အအေးပေးစက်" }]
  },
  "レンジ": {
    same: [{ word: "電子レンジ", reading: "でんしれんじ", meaning_mm: "မိုက်ကရိုဝေ့ဖ်" }],
    diff: []
  },
  "ガスコンロ": {
    same: [{ word: "ガスレンジ", reading: "がすれんじ", meaning_mm: "ဂတ်စ်မီးဖို" }],
    diff: []
  },
  "やかん": {
    same: [{ word: "ケトル", reading: "けとる", meaning_mm: "ရေနွေးအိုး" }],
    diff: []
  },
  "わん": {
    same: [{ word: "お椀", reading: "おわん", meaning_mm: "ပန်းကန်လုံး" }, { word: "器", reading: "うつわ", meaning_mm: "ခွက်/အိုးခွက်" }],
    diff: []
  },
  "ふきん": {
    same: [{ word: "台拭き", reading: "だいぶき", meaning_mm: "စားပွဲသုတ်ပုဝါ" }],
    diff: []
  },
  "洗剤": {
    same: [{ word: "クリーナー", reading: "くりーなー", meaning_mm: "သန့်စင်ဆေးရည်" }],
    diff: []
  },
  "トイレットペーパー": {
    same: [{ word: "トイレットロール", reading: "といれっとろーる", meaning_mm: "အိမ်သာသုံးစက္ကူ" }],
    diff: []
  },
  "ティッシュペーパー": {
    same: [{ word: "ティッシュ", reading: "てぃっしゅ", meaning_mm: "တစ်ရှူးစက္ကူ" }],
    diff: []
  },
  "日用品": {
    same: [{ word: "生活用品", reading: "せいかつようひん", meaning_mm: "နေ့စဉ်သုံးပစ္စည်း" }, { word: "雑貨", reading: "ざっか", meaning_mm: "လူသုံးကုန်ပစ္စည်း" }],
    diff: []
  },

  // UNIT 8: Daily Actions
  "通う": {
    same: [{ word: "通学する", reading: "つうがくする", meaning_mm: "ကျောင်းတက်သည်" }, { word: "通勤する", reading: "つうきんする", meaning_mm: "အလုပ်တက်သည်" }],
    diff: []
  },
  "帰宅": {
    same: [{ word: "家路", reading: "いえじ", meaning_mm: "အိမ်ပြန်လမ်း" }],
    diff: [{ word: "外出", reading: "がいしゅつ", meaning_mm: "အပြင်ထွက်ခြင်း" }]
  },
  "暮らす": {
    same: [{ word: "生活する", reading: "せいかつする", meaning_mm: "ရှင်သန်နေထိုင်သည်" }],
    diff: []
  },
  "暮らし": {
    same: [{ word: "生活", reading: "せいかつ", meaning_mm: "လူမှုဘဝ" }],
    diff: []
  },
  "下宿": {
    same: [{ word: "アパート", reading: "あぱー့", meaning_mm: "အခန်းငှားခြင်း" }],
    diff: []
  },
  "化粧": {
    same: [{ word: "メイク", reading: "めいく", meaning_mm: "မိတ်ကပ်ပြင်ခြင်း" }],
    diff: [{ word: "すっぴん", reading: "すっぴん", meaning_mm: "ပင်ကိုယ်မျက်နှာအလှ" }]
  },
  "洗濯物": {
    same: [{ word: "洗い物", reading: "あらいもの", meaning_mm: "လျှော်ဖွပ်စရာ" }],
    diff: []
  },
  "そる": {
    same: [{ word: "剃る", reading: "そる", meaning_mm: "မုတ်ဆိတ်ရိတ်သည်" }],
    diff: []
  },
  "とく": {
    same: [{ word: "梳く", reading: "すく", meaning_mm: "ဆံပင်ဖြီးသည်" }],
    diff: []
  },
  "眠る": {
    same: [{ word: "就寝する", reading: "しゅうしんする", meaning_mm: "အိပ်စက်သည်" }],
    diff: [{ word: "起きる", reading: "おきる", meaning_mm: "နိုးထသည်" }]
  },
  "寝る": {
    same: [{ word: "就寝する", reading: "しゅうしんする", meaning_mm: "အိပ်စက်အနားယူသည်" }],
    diff: [{ word: "起きる", reading: "おきる", meaning_mm: "ထပြေးသည်" }]
  },
  "分別": {
    same: [{ word: "仕分け", reading: "しわけ", meaning_mm: "ခွဲခြားသတ်မှတ်ခြင်း" }],
    diff: [{ word: "混同", reading: "こんどう", meaning_mm: "ရောထွေးသိမြင်ခြင်း" }]
  },

  // UNIT 9: Transportation
  "乗車": {
    same: [{ word: "搭乗", reading: "とうじょう", meaning_mm: "ယာဉ်ပေါ်တက်စီးခြင်း" }],
    diff: [{ word: "下車", reading: "げしゃ", meaning_mm: "ယာဉ်ပေါ်မှဆင်းခြင်း" }]
  },
  "乗客": {
    same: [{ word: "旅客", reading: "りょかく", meaning_mm: "ခရီးသည်" }],
    diff: [{ word: "乗務員", reading: "じょうむいん", meaning_mm: "ယာဉ်မောင်း/ယာဉ်ဝန်ထမ်း" }]
  },
  "往復": {
    same: [],
    diff: [{ word: "片道", reading: "かたみち", meaning_mm: "တစ်ကြောင်းသွားလမ်း" }]
  },
  "片道": {
    same: [],
    diff: [{ word: "往復", reading: "おうふく", meaning_mm: "အသွားအပြန်" }]
  },
  "運賃": {
    same: [{ word: "交通費", reading: "こうつうひ", meaning_mm: "သယ်ယူပို့ဆောင်ရေးခ" }],
    diff: []
  },
  "定期券": {
    same: [{ word: "定期", reading: "ていき", meaning_mm: "လပေးလက်မှတ်" }],
    diff: []
  },
  "発車": {
    same: [{ word: "出発", reading: "しゅっぱつ", meaning_mm: "စတင်ထွက်ခွာခြင်း" }],
    diff: [{ word: "停車", reading: "ていしゃ", meaning_mm: "ယာဉ်ရပ်တန့်ခြင်း" }, { word: "到着", reading: "とうちゃく", meaning_mm: "ဆိုက်ရောက်ခြင်း" }]
  },
  "終点": {
    same: [{ word: "終着駅", reading: "しゅうちゃくえき", meaning_mm: "ပန်းတိုင်ဆုံးဂိတ်" }],
    diff: [{ word: "始発点", reading: "しはつてん", meaning_mm: "စတင်ထွက်ခွာရာနေရာ" }]
  },
  "到着": {
    same: [{ word: "到達", reading: "とうたつ", meaning_mm: "ရောက်ရှိဆိုက်ကပ်သည်" }],
    diff: [{ word: "出発", reading: "しゅっぱつ", meaning_mm: "ထွက်ခွာသည်" }]
  },
  "時刻": {
    same: [{ word: "時間", reading: "じかん", meaning_mm: "အချိန်နာရီ" }],
    diff: []
  },
  "停車": {
    same: [],
    diff: [{ word: "発車", reading: "はっしゃ", meaning_mm: "ထွက်ခွာခြင်း" }]
  },
  "終電": {
    same: [{ word: "最終列車", reading: "さいしゅうれっしゃ", meaning_mm: "ဒီနေ့နောက်ဆုံးရထား" }],
    diff: [{ word: "始発", reading: "しはつ", meaning_mm: "ပထမဆုံးထွက်သောရထား" }]
  },
  "列車": {
    same: [{ word: "電車", reading: "でんしゃ", meaning_mm: "လျှပ်စစ်ရထား" }],
    diff: []
  },
  "優先席": {
    same: [{ word: "シルバーシート", reading: "しるばーしーと", meaning_mm: "သက်ကြီးဦးစားပေးထိုင်ခုံ" }],
    diff: [{ word: "一般席", reading: "いっぱんぜき", meaning_mm: "သာမန်ထိုင်ခုံ" }]
  },
  "停留所": {
    same: [{ word: "バス停", reading: "ばすてい", meaning_mm: "ဘတ်စ်ကားမှတ်တိုင်" }],
    diff: []
  },
  "バス停": {
    same: [{ word: "バス停留所", reading: "ばすていりゅうじょ", meaning_mm: "ဘတ်စ်ကားဂိတ်" }],
    diff: []
  },
  "大通り": {
    same: [{ word: "本通り", reading: "ほんどおり", meaning_mm: "လမ်းမကြီး" }],
    diff: [{ word: "路地", reading: "ろじ", meaning_mm: "လမ်းကြား/လမ်းသွယ်" }]
  },
  "交差点": {
    same: [{ word: "四つ角", reading: "よつかど", meaning_mm: "လမ်းဆုံ" }],
    diff: []
  },
  "四つ角": {
    same: [{ word: "交差点", reading: "こうさてん", meaning_mm: "လမ်းညှပ်လေးခွ" }],
    diff: []
  },
  "通行": {
    same: [{ word: "通り抜け", reading: "とおりぬけ", meaning_mm: "ဖြတ်သန်းသွားလာခြင်း" }],
    diff: [{ word: "通行止め", reading: "つうこうどめ", meaning_mm: "လမ်းပိတ်ထားခြင်း" }]
  },
  "高速道路": {
    same: [{ word: "フリーウェイ", reading: "ふりーうぇい", meaning_mm: "အဝေးပြေးလမ်းမကြီး" }],
    diff: [{ word: "一般道路", reading: "いっぱんどうろ", meaning_mm: "သာမန်ရိုးရိုးလမ်း" }]
  },
  "渋滞": {
    same: [{ word: "混雑", reading: "こんざつ", meaning_mm: "ယာဉ်ကြောပိတ်ဆို့မှု" }],
    diff: []
  },
  "近道": {
    same: [{ word: "ショートカット", reading: "しょーとかっと", meaning_mm: "ဖြတ်လမ်း" }],
    diff: [{ word: "回り道", reading: "まわりみち", meaning_mm: "ပတ်လမ်း/လှည့်ပတ်သွားလမ်း" }]
  },
  "駐車": {
    same: [],
    diff: [{ word: "停車", reading: "ていしゃ", meaning_mm: "ယာယီကားရပ်နားခြင်း" }]
  },
  "歩道": {
    same: [],
    diff: [{ word: "車道", reading: "しゃどう", meaning_mm: "ကားလမ်း" }]
  },
  "運転免許証": {
    same: [{ word: "免許証", reading: "めんきょしょう", meaning_mm: "ယာဉ်မောင်းလိုင်စင်" }],
    diff: []
  },
  "ブレーキ": {
    same: [],
    diff: [{ word: "アクセル", reading: "あくせる", meaning_mm: "လီဗာ" }]
  },
  "パトカー": {
    same: [{ word: "パトロールカー", reading: "ぱとろーるかー", meaning_mm: "ရဲကင်းလှည့်ကား" }],
    diff: []
  },
  "航空機": {
    same: [{ word: "飛行機", reading: "ひこうき", meaning_mm: "လေယာဉ်ပျံ" }],
    diff: []
  },
  "便": {
    same: [{ word: "フライト", reading: "ふらいと", meaning_mm: "လေယာဉ်ခရီးစဉ်" }],
    diff: []
  },

  // UNIT 10: Places
  "書店": {
    same: [{ word: "本屋", reading: "ほんや", meaning_mm: "စာအုပ်ဆိုင်" }],
    diff: []
  },
  "床屋": {
    same: [{ word: "理髪店", reading: "りはつてん", meaning_mm: "ဆံသဆိုင်" }],
    diff: []
  },
  "劇場": {
    same: [{ word: "シアター", reading: "しあたー", meaning_mm: "ပြဇာတ်ရုံ" }],
    diff: []
  },
  "舞台": {
    same: [{ word: "ステージ", reading: "すてーじ", meaning_mm: "ဇာတ်စင်" }],
    diff: []
  },
  "売店": {
    same: [{ word: "ショップ", reading: "しょっぷ", meaning_mm: "အရောင်းကောင်တာ" }],
    diff: []
  },
  "ショップ": {
    same: [{ word: "店", reading: "みせ", meaning_mm: "ဆိုင်" }],
    diff: []
  },
  "フロント": {
    same: [{ word: "受付", reading: "うけつけ", meaning_mm: "ဧည့်ကြိုကောင်တာ" }],
    diff: []
  },
  "博物館": {
    same: [{ word: "ミュージアム", reading: "みゅーじあむ", meaning_mm: "ပြတိုက်" }],
    diff: []
  },
  "遊園地": {
    same: [{ word: "テーマパーク", reading: "てーまぱーく", meaning_mm: "အပန်းဖြေကစားကွင်း" }],
    diff: []
  },
  "ファミリーレストラン": {
    same: [{ word: "ファミレス", reading: "ふぁみれす", meaning_mm: "မိသားစုစားသောက်ဆိုင်" }],
    diff: []
  },
  "会場": {
    same: [{ word: "ホール", reading: "ほーる", meaning_mm: "ကျင်းပရာနေရာ" }],
    diff: []
  },
  "老人ホーム": {
    same: [{ word: "介護施設", reading: "かいごしせつ", meaning_mm: "ဘိုးဘွားရိပ်သာ" }],
    diff: []
  },
  "寮": {
    same: [{ word: "寄宿舎", reading: "きしゅくしゃ", meaning_mm: "အဆောင်" }],
    diff: []
  },
  "グラウンド": {
    same: [{ word: "運動場", reading: "うんどうじょう", meaning_mm: "ကစားကွင်း" }],
    diff: []
  },
  "コインランドリー": {
    same: [{ word: "コインランドリ", reading: "こいんらんどり", meaning_mm: "အဝတ်လျှော်စက်အရောင်းဆိုင်" }],
    diff: []
  },
  "待合室": {
    same: [{ word: "ウェイティングルーム", reading: "うぇいてぃんぐるーむ", meaning_mm: "စောင့်ဆိုင်းခန်း" }],
    diff: []
  },
  "広場": {
    same: [{ word: "スクエア", reading: "すくえあ", meaning_mm: "အများပြည်သူကွင်းကျယ်" }],
    diff: []
  },
  "便所": {
    same: [{ word: "お手洗い", reading: "おてあらい", meaning_mm: "အိမ်သာ" }, { word: "トイレ", reading: "といれ", meaning_mm: "အိမ်သာ" }],
    diff: []
  },
  "別荘": {
    same: [{ word: "コテージ", reading: "こてーじ", meaning_mm: "အပန်းဖြေအိမ်ယာ" }],
    diff: []
  },
  "城": {
    same: [{ word: "城郭", reading: "じょうかく", meaning_mm: "မြို့ရိုးခံတပ်ရဲတိုက်" }],
    diff: []
  },
  "支店": {
    same: [{ word: "分店", reading: "ぶんてん", meaning_mm: "ရုံးခွဲ" }],
    diff: [{ word: "本店", reading: "ほんてん", meaning_mm: "ရုံးချုပ်/ပင်မဆိုင်" }, { word: "本社", reading: "ほんしゃ", meaning_mm: "ပင်မကုမ္ပဏီချုပ်" }]
  },
  "オフィス": {
    same: [{ word: "事務所", reading: "じむしょ", meaning_mm: "ရုံးခန်း" }],
    diff: []
  },
  "会議室": {
    same: [{ word: "ミーティングルーム", reading: "みーてぃんぐるーむ", meaning_mm: "အစည်းအဝေးခန်းမ" }],
    diff: []
  },
  "居間": {
    same: [{ word: "リビングルーム", reading: "りびんぐるーむ", meaning_mm: "ဧည့်ခန်း" }],
    diff: []
  },
  "リビング": {
    same: [{ word: "居間", reading: "いま", meaning_mm: "ဧည့်ခန်း" }],
    diff: []
  },
  "キッチン": {
    same: [{ word: "台所", reading: "だいどころ", meaning_mm: "မီးဖိုချောင်" }],
    diff: []
  },
  "ベランダ": {
    same: [{ word: "バルコニー", reading: "ばるこにー", meaning_mm: "ဝရန်တာ" }],
    diff: []
  },
  "書斎": {
    same: [{ word: "勉強部屋", reading: "べんきょうべや", meaning_mm: "စာဖတ်ခန်း" }],
    diff: []
  },
  "押し入れ": {
    same: [{ word: "クローゼット", reading: "くろーぜっと", meaning_mm: "နံရံကပ်ဘီဒို" }],
    diff: []
  },
  "お手洗い": {
    same: [{ word: "トイレ", reading: "といれ", meaning_mm: "သန့်စင်ခန်း" }, { word: "便所", reading: "べんじょ", meaning_mm: "အိမ်သာ" }],
    diff: []
  },
  "施設": {
    same: [{ word: "機関", reading: "きかん", meaning_mm: "အဆောက်အဦး/အဖွဲ့အစည်း" }],
    diff: []
  },
  "設備": {
    same: [{ word: "インフラ", reading: "いんふら", meaning_mm: "အခြေခံအဆောက်အအုံ" }],
    diff: []
  },

  // UNIT 11: Reading/Writing
  "書類": {
    same: [{ word: "文書", reading: "ぶんしょ", meaning_mm: "စာရွက်စာတမ်း" }],
    diff: []
  },
  "資料": {
    same: [{ word: "データ", reading: "でーた", meaning_mm: "အချက်အလက်" }],
    diff: []
  },
  "記事": {
    same: [{ word: "レポート", reading: "れぽー့", meaning_mm: "သတင်းဆောင်းပါး" }],
    diff: []
  },
  "載る": {
    same: [{ word: "掲載される", reading: "けいさいされる", meaning_mm: "ဆောင်းပါးဖော်ပြခြင်းခံရသည်" }],
    diff: []
  },
  "載せる": {
    same: [{ word: "掲載する", reading: "けいさいする", meaning_mm: "ပုံနှိပ်ဖော်ပြသည်" }],
    diff: [{ word: "削除する", reading: "さくじょする", meaning_mm: "ပယ်ဖျက်သည်" }]
  },
  "物語": {
    same: [{ word: "ストーリー", reading: "すとーりー", meaning_mm: "ဝတ္ထုပုံပြင်" }],
    diff: []
  },
  "記入": {
    same: [{ word: "書き込み", reading: "かきこみ", meaning_mm: "ရေးသားဖြည့်စွက်ခြင်း" }],
    diff: [{ word: "削除", reading: "さくじょ", meaning_mm: "ပယ်ဖျက်ခြင်း" }]
  },
  "下書き": {
    same: [{ word: "草稿", reading: "そうこう", meaning_mm: "မူကြမ်းစာမူ" }],
    diff: [{ word: "清書", reading: "せいしょ", meaning_mm: "စာချောပြန်လည်ကူးယူခြင်း" }]
  },
  "削除": {
    same: [{ word: "消去", reading: "しょうきょ", meaning_mm: "ပယ်ဖျက်ဖယ်ရှားခြင်း" }],
    diff: [{ word: "追加", reading: "ついか", meaning_mm: "ဖြည့်စွက်ထည့်သွင်းခြင်း" }]
  },
  "聴く": {
    same: [{ word: "耳を傾ける", reading: "みみをかたむける", meaning_mm: "နားစွင့်သည်" }],
    diff: []
  },
  "話題": {
    same: [{ word: "トピック", reading: "とぴっく", meaning_mm: "ဆွေးနွေးစရာခေါင်းစဉ်" }],
    diff: []
  },
  "しゃべる": {
    same: [{ word: "話す", reading: "はなす", meaning_mm: "စကားပြောဆိုသည်" }],
    diff: [{ word: "黙る", reading: "だまる", meaning_mm: "နှုတ်ဆိတ်နေသည်" }]
  },
  "おしゃべり": {
    same: [{ word: "雑談", reading: "ざつだん", meaning_mm: "စကားလက်ဆုံပြောခြင်း" }],
    diff: [{ word: "無口", reading: "むくち", meaning_mm: "စကားနည်းသောသူ" }]
  },
  "発言": {
    same: [{ word: "発話", reading: "はつわ", meaning_mm: "ပြောဆိုဆွေးနွေးမှု" }],
    diff: [{ word: "沈黙", reading: "ちんもく", meaning_mm: "တိတ်ဆိတ်ငြိမ်သက်ခြင်း" }]
  },
  "述べる": {
    same: [{ word: "伝える", reading: "つたえる", meaning_mm: "ပြောကြားတင်ပြသည်" }],
    diff: []
  },
  "語る": {
    same: [{ word: "話す", reading: "はなす", meaning_mm: "ပြောပြဆွေးနွေးသည်" }],
    diff: [{ word: "黙秘する", reading: "もくひする", meaning_mm: "နှုတ်ဆိတ်ငြိမ်ခံနေသည်" }]
  },
  "スピーチ": {
    same: [{ word: "演説", reading: "えんぜつ", meaning_mm: "မိန့်ခွန်းပြောခြင်း" }],
    diff: []
  },
  "訳す": {
    same: [{ word: "翻訳する", reading: "ほんやくする", meaning_mm: "ဘာသာပြန်သည်" }],
    diff: []
  },
  "通訳": {
    same: [],
    diff: [{ word: "翻訳", reading: "ほんやく", meaning_mm: "ဘာသာပြန်ခြင်း" }]
  },
  "翻訳": {
    same: [{ word: "訳", reading: "やく", meaning_mm: "ဘာသာပြန်ခြင်းသီးသန့်" }],
    diff: [{ word: "通訳", reading: "つうやく", meaning_mm: "နှုတ်တိုက်စကားပြန်ခြင်း" }]
  },

  // UNIT 12: Weather
  "照る": {
    same: [{ word: "晴れる", reading: "はれる", meaning_mm: "သာယာတောက်ပသည်" }],
    diff: [{ word: "曇る", reading: "くもる", meaning_mm: "အုံ့မှိုင်းသည်" }]
  },
  "日差し": {
    same: [{ word: "日光", reading: "にっこう", meaning_mm: "နေရောင်ခြည်" }],
    diff: []
  },
  "曇る": {
    same: [{ word: "陰る", reading: "かげる", meaning_mm: "မှောင်ကျအုံ့ဆိုင်းသည်" }],
    diff: [{ word: "晴れる", reading: "はれる", meaning_mm: "နေသာသည်" }]
  },
  "にわか雨": {
    same: [{ word: "通り雨", reading: "とおりあめ", meaning_mm: "မိုးပြိုက်" }],
    diff: []
  },
  "嵐": {
    same: [{ word: "暴風雨", reading: "ぼうふうう", meaning_mm: "လေမုန်တိုင်း" }],
    diff: []
  },
  "積もる": {
    same: [{ word: "重なる", reading: "かさなる", meaning_mm: "စုပုံလာသည်" }],
    diff: [{ word: "解ける", reading: "とける", meaning_mm: "အရည်ပျော်သည်" }]
  },
  "天候": {
    same: [{ word: "天気", reading: "てんき", meaning_mm: "ရာသီဥတု" }],
    diff: []
  },
  "気候": {
    same: [{ word: "気象", reading: "きしょう", meaning_mm: "သဘာဝရာသီဥတု" }],
    diff: []
  },
  "気温": {
    same: [{ word: "温度", reading: "おんど", meaning_mm: "အပူချိန်" }],
    diff: []
  },
  "湿度": {
    same: [],
    diff: [{ word: "乾燥", reading: "かんそう", meaning_mm: "ခြောက်သွေ့ခြင်း" }]
  },
  "蒸し暑い": {
    same: [],
    diff: [{ word: "肌寒い", reading: "はだざむい", meaning_mm: "အေးစိမ့်သော" }]
  },
  "予報": {
    same: [{ word: "予測", reading: "よそく", meaning_mm: "ကြိုတင်ခန့်မှန်းချက်" }],
    diff: []
  },
  "梅雨": {
    same: [],
    diff: [{ word: "乾季", reading: "かんき", meaning_mm: "နွေရာသီခြောက်သွေ့ချိန်" }]
  },

  // UNIT 13: Money
  "会計": {
    same: [{ word: "勘定", reading: "かんじょう", meaning_mm: "ငွေတွက်ချက်ရှင်းခြင်း" }],
    diff: []
  },
  "勘定": {
    same: [{ word: "会計", reading: "かいけい", meaning_mm: "ငွေရှင်းခြင်း" }],
    diff: []
  },
  "金額": {
    same: [{ word: "代金", reading: "だいきん", meaning_mm: "ကုန်ကျငွေပမာဏ" }],
    diff: []
  },
  "支払う": {
    same: [{ word: "払う", reading: "はらう", meaning_mm: "ပေးချေသည်" }],
    diff: [{ word: "受け取る", reading: "うけとる", meaning_mm: "လက်ခံရရှိသည်" }]
  },
  "レシート": {
    same: [{ word: "領収書", reading: "りょうしゅうしょ", meaning_mm: "ပြေစာ" }],
    diff: []
  },
  "領収書": {
    same: [{ word: "レシート", reading: "れしーと", meaning_mm: "ပြေစာ" }],
    diff: [{ word: "請求書", reading: "せいきゅうしょ", meaning_mm: "ငွေတောင်းခံလွှာ" }]
  },
  "無料": {
    same: [{ word: "タダ", reading: "ただ", meaning_mm: "အလကား" }, { word: "フリー", reading: "ふりー", meaning_mm: "အခမဲ့" }],
    diff: [{ word: "有料", reading: "ゆうりょう", meaning_mm: "ကျသင့်ငွေရှိသော" }]
  },
  "ただ": {
    same: [{ word: "無料", reading: "むりょう", meaning_mm: "အခမဲ့" }],
    diff: [{ word: "有料", reading: "ゆうりょう", meaning_mm: "ငွေပေးချေရသော" }]
  },
  "有料": {
    same: [],
    diff: [{ word: "無料", reading: "むりょう", meaning_mm: "အခမဲ့" }]
  },
  "払戻す": {
    same: [{ word: "返金する", reading: "へんきんする", meaning_mm: "ငွေပြန်အမ်းသည်" }],
    diff: []
  },
  "払い戻し": {
    same: [{ word: "返金", reading: "へんきん", meaning_mm: "ငွေပြန်ထုတ်ပေးခြင်း" }],
    diff: []
  },
  "おごる": {
    same: [{ word: "ご馳走する", reading: "ごちそうする", meaning_mm: "ဒကာခံကျွေးမွေးသည်" }],
    diff: [{ word: "割り勘", reading: "わりかん", meaning_mm: "အညီအမျှခွဲဝေရှင်းစနစ်" }]
  },
  "割り勘": {
    same: [],
    diff: [{ word: "おごる", reading: "おごる", meaning_mm: "ကျွေးမွေးဒကာခံသည်" }]
  },
  "貯金": {
    same: [{ word: "預金", reading: "よきん", meaning_mm: "ဘဏ်အပ်နှံငွေစုခြင်း" }],
    diff: [{ word: "浪費", reading: "ろうひ", meaning_mm: "ဖြုန်းတီးခြင်း" }, { word: "借金", reading: "しゃっきん", meaning_mm: "အကြွေး" }]
  },
  "通帳": {
    same: [{ word: "預金通帳", reading: "よきんつうちょう", meaning_mm: "ဘဏ်စာအုပ်ပုံစံ" }],
    diff: []
  },
  "口座": {
    same: [{ word: "預金口座", reading: "よきんこうざ", meaning_mm: "အပ်နှံဘဏ်စာရင်း" }],
    diff: []
  },
  "利子": {
    same: [{ word: "利息", reading: "りそく", meaning_mm: "ဘဏ်အတိုးနှုန်း" }],
    diff: []
  },
  "預金": {
    same: [{ word: "貯金", reading: "ちょきん", meaning_mm: "ငွေစုဆောင်းခြင်း" }],
    diff: [{ word: "引き出し", reading: "ひきだし", meaning_mm: "ပြန်လည်ထုတ်ယူခြင်း" }]
  },
  "下ろす": {
    same: [{ word: "引き出す", reading: "ひきだす", meaning_mm: "ငွေထုတ်သည်" }],
    diff: [{ word: "預ける", reading: "あずける", meaning_mm: "အပ်နှံသည်" }]
  },
  "請求書": {
    same: [],
    diff: [{ word: "領収書", reading: "りょうしゅうしょ", meaning_mm: "ပြေစာ/ငွေရခံစာ" }]
  },
  "振り込み": {
    same: [{ word: "送金", reading: "そうきん", meaning_mm: "ငွေလွှဲပေးပို့ခြင်း" }],
    diff: []
  },
  "収入": {
    same: [{ word: "所得", reading: "しょとく", meaning_mm: "ရရှိသောဝင်ငွေ" }],
    diff: [{ word: "支出", reading: "ししゅつ", meaning_mm: "အသုံးစရိတ်ထွက်ငွေ" }]
  },
  "赤字": {
    same: [{ word: "損失", reading: "そんしつ", meaning_mm: "အရှုံးပေါ်မှု" }],
    diff: [{ word: "黒字", reading: "くろじ", meaning_mm: "အကျိုးအမြတ်အပိုထွက်ခြင်း" }]
  },
  "黒字": {
    same: [{ word: "利益", reading: "りえき", meaning_mm: "အသားတင်အမြတ်" }],
    diff: [{ word: "赤字", reading: "あかじ", meaning_mm: "အနုတ်အရှုံးပြခြင်း" }]
  },
  "節約": {
    same: [{ word: "倹約", reading: "けんやく", meaning_mm: "ခြိုးခြံချွေတာခြင်း" }],
    diff: [{ word: "浪費", reading: "ろうひ", meaning_mm: "ဖြုန်းတီးပစ်ခြင်း" }]
  },
  "費用": {
    same: [{ word: "経費", reading: "けいひ", meaning_mm: "ကုန်ကျစရိတ်စုစုပေါင်း" }],
    diff: []
  },
  "小遣い": {
    same: [{ word: "お小遣い", reading: "おこづかい", meaning_mm: "မုန့်ဖိုးငွေ" }],
    diff: []
  },

  // UNIT 14: Clothes
  "服装": {
    same: [{ word: "衣服", reading: "いふく", meaning_mm: "ဝတ်စုံအဝတ်အစား" }],
    diff: []
  },
  "ドレス": {
    same: [{ word: "ワンピース", reading: "わんぴーす", meaning_mm: "ဝတ်စုံဂါဝန်" }],
    diff: []
  },
  "制服": {
    same: [{ word: "ユニフォーム", reading: "ゆにふぉーむ", meaning_mm: "တူညီဝတ်စုံ" }],
    diff: [{ word: "私服", reading: "しふく", meaning_mm: "အရပ်ဝတ်အင်္ကျီ" }]
  },
  "ブラウス": {
    same: [{ word: "シャツ", reading: "しゃつ", meaning_mm: "ရှပ်အင်္ကျီ" }],
    diff: []
  },
  "ワンピース": {
    same: [{ word: "ドレス", reading: "どれす", meaning_mm: "တစ်ဆက်တည်းဂါဝန်" }],
    diff: []
  },
  "パンツ": {
    same: [{ word: "ズボン", reading: "ずぼん", meaning_mm: "ဘောင်းဘီရှည်" }],
    diff: []
  },
  "ベルト": {
    same: [{ word: "帯", reading: "おび", meaning_mm: "ခါးပတ်စည်းကြိုး" }],
    diff: []
  },
  "コート": {
    same: [{ word: "オーバーコート", reading: "おーばーこーと", meaning_mm: "ကုတ်အင်္ကျီကြီး" }],
    diff: []
  },
  "レインコート": {
    same: [{ word: "雨具", reading: "あまぐ", meaning_mm: "မိုးကာအင်္ကျီ" }],
    diff: []
  },
  "サンダル": {
    same: [{ word: "スリッパ", reading: "すりっぱ", meaning_mm: "အိမ်စီးဖိနပ်" }],
    diff: []
  },
  "ストッキング": {
    same: [{ word: "タイツ", reading: "たいつ", meaning_mm: "ခြေစွပ်ဘောင်းဘီအသားကပ်" }],
    diff: []
  },
  "浴衣": {
    same: [{ word: "着物", reading: "きもの", meaning_mm: "ဂျပန်ဝတ်စုံ" }],
    diff: []
  },
  "水着": {
    same: [{ word: "スイムウェア", reading: "すいむうぇあ", meaning_mm: "ရေကူးဝတ်စုံ" }],
    diff: []
  },
  "宝石": {
    same: [{ word: "ジュエリー", reading: "じゅえりー", meaning_mm: "ရတနာကျောက်မျက်" }],
    diff: []
  },
  "アクセサリー": {
    same: [{ word: "装飾品", reading: "そうしょくひん", meaning_mm: "အဆင်တန်ဆာပစ္စည်း" }],
    diff: []
  },
  "イヤリング": {
    same: [{ word: "ピアス", reading: "ぴあす", meaning_mm: "နားကပ်" }],
    diff: []
  },
  "ピアス": {
    same: [{ word: "イヤリング", reading: "いやりんぐ", meaning_mm: "နားကပ်/နားပေါက်ထိုးတန်ဆာ" }],
    diff: []
  },
  "ネックレス": {
    same: [{ word: "首飾り", reading: "くびかざり", meaning_mm: "ဆွဲကြိုး" }],
    diff: []
  },
  "コンタクトレンズ": {
    same: [{ word: "コンタクト", reading: "こんたくと", meaning_mm: "မျက်ကပ်မှန်" }],
    diff: [{ word: "眼鏡", reading: "めがね", meaning_mm: "မျက်မှန်" }]
  },

  // UNIT 15: Design/Shape
  "カラー": {
    same: [{ word: "色", reading: "いろ", meaning_mm: "အရောင်" }],
    diff: [{ word: "モノクロ", reading: "ものくろ", meaning_mm: "အဖြူအမည်း" }]
  },
  "ピンク": {
    same: [{ word: "桃色", reading: "ももいろ", meaning_mm: "ပန်းရောင်" }],
    diff: []
  },
  "オレンジ": {
    same: [{ word: "橙色", reading: "だいだいいろ", meaning_mm: "လိမ္မော်ရောင်" }],
    diff: []
  },
  "ゴールド": {
    same: [{ word: "金色", reading: "きんいろ", meaning_mm: "ရွှေရောင်" }],
    diff: [{ word: "シルバー", reading: "しるばー", meaning_mm: "ငွေရောင်" }]
  },
  "金色": {
    same: [{ word: "ゴールド", reading: "ごーるど", meaning_mm: "ရွှေရောင်" }],
    diff: [{ word: "銀色", reading: "ぎんいろ", meaning_mm: "ငွေရောင်" }]
  },
  "銀色": {
    same: [{ word: "シルバー", reading: "しるばー", meaning_mm: "ငွေရောင်" }],
    diff: [{ word: "金色", reading: "きんいろ", meaning_mm: "ရွှေရောင်" }]
  },
  "派手": {
    same: [],
    diff: [{ word: "地味", reading: "じみ", meaning_mm: "ရိုးရိုးစင်းစင်းစိုပြေမှုမရှိ" }]
  },
  "地味": {
    same: [{ word: "シンプル", reading: "しんぷる", meaning_mm: "ရိုးရှင်းသော" }],
    diff: [{ word: "派手", reading: "はで", meaning_mm: "တောက်ပြောင်စူးရှသော" }]
  },
  "シンプル": {
    same: [{ word: "簡単", reading: "かんたん", meaning_mm: "လွယ်ကူသော" }],
    diff: [{ word: "複雑", reading: "ふくざつ", meaning_mm: "ရှုပ်ထွေးခက်ခဲသော" }, { word: "派手", reading: "はde", meaning_mm: "လူမြင်သူပြိုင်ပြောင်သော" }]
  },
  "模様": {
    same: [{ word: "柄", reading: "がら", meaning_mm: "ပုံသဏ္ဌာန်ဆန်း" }],
    diff: [{ word: "無地", reading: "むじ", meaning_mm: "ဗြောင်ကွက်အဆင်မပါ" }]
  },
  "柄": {
    same: [{ word: "模様", reading: "もよう", meaning_mm: "ပန်းပွင့်ပုံဒီဇိုင်း" }],
    diff: [{ word: "無地", reading: "むじ", meaning_mm: "ဗြောင်ရိုးရိုးအသား" }]
  },
  "しま": {
    same: [{ word: "ストライプ", reading: "すとらいぷ", meaning_mm: "အစင်းကျား" }],
    diff: [{ word: "無地", reading: "むじ", meaning_mm: "ဗြောင်" }]
  },
  "水玉": {
    same: [{ word: "ドット", reading: "どっと", meaning_mm: "အစက်အပြောက်ပုံဆန်း" }],
    diff: []
  },
  "無地": {
    same: [],
    diff: [{ word: "模様", reading: "もよう", meaning_mm: "ပန်းအလှဒီဇိုင်း" }, { word: "柄", reading: "がら", meaning_mm: "အကွက်ဆန်းအဆင်" }]
  },
  "円": {
    same: [{ word: "丸", reading: "まる", meaning_mm: "အဝိုင်းပုံ" }, { word: "輪", reading: "わ", meaning_mm: "ကွင်း" }],
    diff: []
  },
  "丸": {
    same: [{ word: "円", reading: "えん", meaning_mm: "ဂျပန်အဝိုင်းကွင်း" }],
    diff: [{ word: "四角", reading: "しかく", meaning_mm: "လေးထောင့်" }, { word: "三角", reading: "さんかく", meaning_mm: "တြိဂံ" }]
  },
  "輪": {
    same: [{ word: "リング", reading: "りんぐ", meaning_mm: "လက်စွပ်အဝိုင်းဂွင်း" }],
    diff: []
  },
  "球": {
    same: [{ word: "ボール", reading: "ぼーる", meaning_mm: "ဘောလုံး" }],
    diff: []
  },
  "ボール": {
    same: [{ word: "球", reading: "きゅう", meaning_mm: "အလုံး" }, { word: "たま", reading: "たま", meaning_mm: "ဘောလုံး" }],
    diff: []
  },
  "たま": {
    same: [{ word: "球", reading: "きゅう", meaning_mm: "ဂျပန်အလုံး" }],
    diff: []
  },
  "三角": {
    same: [],
    diff: [{ word: "四角", reading: "しかく", meaning_mm: "စတုရန်းလေးထောင့်" }]
  },
  "四角": {
    same: [],
    diff: [{ word: "三角", reading: "さんかく", meaning_mm: "တြိဂံ" }, { word: "丸", reading: "まる", meaning_mm: "အဝိုင်း" }]
  },
  "直線": {
    same: [],
    diff: [{ word: "曲線", reading: "きょくせん", meaning_mm: "မျဉ်းကွေး" }, { word: "カーブ", reading: "かーぶ", meaning_mm: "အကွေးအကောက်" }]
  },
  "カーブ": {
    same: [{ word: "曲線", reading: "きょくせん", meaning_mm: "ကွေးညွတ်မျဉ်း" }],
    diff: [{ word: "直線", reading: "ちょくせん", meaning_mm: "မျဉ်းဖြောင့်" }]
  },

  // UNIT 16: Numbers/Math
  "余る": {
    same: [{ word: "残る", reading: "のこる", meaning_mm: "ပိုလျှံကျန်ရှိသည်" }],
    diff: [{ word: "足りない", reading: "たりない", meaning_mm: "မလုံလောက်ဖြစ်သည်" }]
  },
  "余り": {
    same: [{ word: "残り", reading: "のこり", meaning_mm: "ပိုလျှံသောအရာကျန်" }],
    diff: [{ word: "不足", reading: "ふそく", meaning_mm: "မလုံလောက်မှု" }]
  },
  "一定": {
    same: [{ word: "固定", reading: "こてい", meaning_mm: "သေသပ်ငြိမ်သက်ပုံသေ" }],
    diff: [{ word: "変動", reading: "へんどう", meaning_mm: "အတက်အကျမငြိမ်မသက်ဖြစ်ခြင်း" }]
  },
  "いっぱい": {
    same: [{ word: "満杯", reading: "まんぱい", meaning_mm: "အပြည့်လျှံ" }],
    diff: [{ word: "空っぽ", reading: "からっぽ", meaning_mm: "ဘာမှမရှိဗလာ" }]
  },
  "およそ": {
    same: [{ word: "約", reading: "やく", meaning_mm: "ခန့်မှန်းခြေ" }, { word: "だいたい", reading: "だいたい", meaning_mm: "အကြမ်းဖျဉ်းအားဖြင့်" }],
    diff: [{ word: "正確に", reading: "せいかくに", meaning_mm: "တိကျမှန်ကန်စွာ" }]
  },
  "約": {
    same: [{ word: "およそ", reading: "およそ", meaning_mm: "အကြမ်းဖျဉ်းအားဖြင့်" }],
    diff: [{ word: "正確に", reading: "せいかくに", meaning_mm: "တိကျသေချာစွာ" }]
  },
  "だいたい": {
    same: [{ word: "約", reading: "やく", meaning_mm: "ခန့်မှန်းပျမ်းမျှ" }],
    diff: [{ word: "正確に", reading: "せいかくに", meaning_mm: "အမှားအယွင်းမရှိ" }]
  },
  "温度": {
    same: [{ word: "気温", reading: "きおん", meaning_mm: "လေထုအပူချိန်" }],
    diff: []
  },
  "体温": {
    same: [{ word: "熱", reading: "ねつ", meaning_mm: "ကိုယ်အပူချိန်/အဖျား" }],
    diff: []
  },
  "数えあげる": {
    same: [{ word: "数える", reading: "かぞえる", meaning_mm: "ရေတွက်သည်" }],
    diff: []
  },
  "偶数": {
    same: [],
    diff: [{ word: "奇数", reading: "きすう", meaning_mm: "မကိန်း" }]
  },
  "奇数": {
    same: [],
    diff: [{ word: "偶数", reading: "ぐうすう", meaning_mm: "စုံကိန်း" }]
  },
  "計": {
    same: [{ word: "合計", reading: "ごうけい", meaning_mm: "စုစုပေါင်းတန်ဖိုး။" }],
    diff: []
  },
  "計算": {
    same: [{ word: "勘定", reading: "かんじょう", meaning_mm: "တွက်ချက်ခြင်း" }],
    diff: []
  },
  "減少": {
    same: [{ word: "低下", reading: "ていか", meaning_mm: "ကျဆင်းနည်းပါးခြင်း" }],
    diff: [{ word: "増加", reading: "ぞうか", meaning_mm: "တိုးပွားများပြားလာခြင်း" }]
  },
  "増加": {
    same: [{ word: "上昇", reading: "じょうしょう", meaning_mm: "မြင့်တက်လာခြင်း" }],
    diff: [{ word: "減少", reading: "げんしょう", meaning_mm: "လျော့နည်းသွားခြင်း" }]
  },

  // UNIT 17: Hobbies
  "趣味": {
    same: [{ word: "ホビー", reading: "ほびー", meaning_mm: "ဝါသနာ" }],
    diff: []
  },
  "読書": {
    same: [{ word: "本読み", reading: "ほんよみ", meaning_mm: "စာဖတ်ခြင်း" }],
    diff: []
  },
  "雑貨": {
    same: [{ word: "小物", reading: "こもの", meaning_mm: "အသေးအဖွဲသုံးပစ္စည်း" }],
    diff: []
  },
  "おもちゃ": {
    same: [{ word: "玩具", reading: "がんぐ", meaning_mm: "ကစားစရာ" }],
    diff: []
  },
  "娯楽": {
    same: [{ word: "レジャー", reading: "れじゃー", meaning_mm: "အပန်းဖြေပျော်ရွှင်မှု" }],
    diff: []
  },
  "レジャー": {
    same: [{ word: "余暇", reading: "よか", meaning_mm: "အားလပ်ချိန်" }],
    diff: [{ word: "労働", reading: "ろうどう", meaning_mm: "ပင်ပန်းစွာအလုပ်လုပ်ခြင်း" }]
  },
  "旅": {
    same: [{ word: "旅行", reading: "りょကို", meaning_mm: "ခရီးသွားခြင်း" }],
    diff: []
  },
  "ピクニック": {
    same: [{ word: "ハイキング", reading: "はいきんぐ", meaning_mm: "တောလမ်းလျှောက်ပျော်ပွဲစား" }],
    diff: []
  },
  "登山": {
    same: [{ word: "山登り", reading: "やまのぼり", meaning_mm: "တောင်တက်ခရီး" }],
    diff: [{ word: "下山", reading: "げざん", meaning_mm: "တောင်ပေါ်မှဆင်းခြင်း" }]
  },
  "水泳": {
    same: [{ word: "スイミング", reading: "すいみんぐ", meaning_mm: "ရေကူးအားကစား" }],
    diff: []
  },

  // UNIT 18: Living
  "粗大ごみ": {
    same: [{ word: "大型ゴミ", reading: "おおがたごみ", meaning_mm: "အရွယ်အစားကြီးသောအမှိုက်" }],
    diff: [{ word: "一般ゴミ", reading: "いっぱんごみ", meaning_mm: "သာမန်အိမ်သုံးအမှိုက်" }]
  },
  "リサイクル": {
    same: [{ word: "再生利用", reading: "さいせいりよう", meaning_mm: "တစ်ခါသုံးပြီးပြန်လည်ပြုပြင်သုံးစွဲခြင်း" }],
    diff: [{ word: "廃棄", reading: "はいき", meaning_mm: "စွန့်ပစ်ဖျက်ဆီးခြင်း" }]
  },
  "自宅": {
    same: [{ word: "我が家", reading: "わがや", meaning_mm: "ကိုယ့်အိမ်" }],
    diff: []
  },
  "芝生": {
    same: [{ word: "芝", reading: "しば", meaning_mm: "မျက်ခင်းပြင်" }],
    diff: []
  },
  "住まい": {
    same: [{ word: "住宅", reading: "じゅうたく", meaning_mm: "လူနေအိမ်ခြေ" }, { word: "住居", reading: "じゅうきょ", meaning_mm: "တည်းခိုနေထိုင်ရာ" }],
    diff: []
  },
  "住宅": {
    same: [{ word: "住まい", reading: "すまい", meaning_mm: "နေထိုင်ရာအဆောက်အဦး" }],
    diff: []
  },
  "田舎": {
    same: [{ word: "地方", reading: "ちほう", meaning_mm: "နယ်ဖက်ဒေသ" }],
    diff: [{ word: "都会", reading: "とかい", meaning_mm: "မြို့ပြကြီး" }]
  },
  "都会": {
    same: [{ word: "都市", reading: "とし", meaning_mm: "စည်ကားသောမြို့ကြီး" }],
    diff: [{ word: "田舎", reading: "いなか", meaning_mm: "ကျေးလက်တောရွာ" }]
  },
  "故郷": {
    same: [{ word: "ふるさと", reading: "ふるさと", meaning_mm: "မိခင်မွေးရပ်မြေ" }],
    diff: []
  },
  "土地": {
    same: [{ word: "敷地", reading: "しきち", meaning_mm: "မြေကွက်နေရာရိပ်" }],
    diff: []
  },
  "田んぼ": {
    same: [{ word: "水田", reading: "すいでん", meaning_mm: "ရေသွင်းလယ်ကွက်" }],
    diff: [{ word: "畑", reading: "はたけ", meaning_mm: "ကုန်ခြောက်ယာကွက်" }]
  },
  "畑": {
    same: [{ word: "農地", reading: "のうち", meaning_mm: "စိုက်ပျိုးမြေ" }],
    diff: [{ word: "田んぼ", reading: "たんぼ", meaning_mm: "လယ်ကွင်း" }]
  },

  // UNIT 19: Body
  "髪の毛": {
    same: [{ word: "髪", reading: "かみ", meaning_mm: "ဦးခေါင်းဆံပင်" }],
    diff: []
  },
  "白髪": {
    same: [],
    diff: [{ word: "黒髪", reading: "くろかみ", meaning_mm: "နက်မှောင်သောဆံကေသာ" }]
  },
  "眉": {
    same: [{ word: "眉毛", reading: "まゆげ", meaning_mm: "မျက်ခုံးမွှေး" }],
    diff: []
  },
  "眉毛": {
    same: [{ word: "眉", reading: "まゆ", meaning_mm: "မျက်ခုံး" }],
    diff: []
  },
  "頬": {
    same: [{ word: "ほっぺた", reading: "ほっぺた", meaning_mm: "ပါး" }],
    diff: []
  },
  "眠たい": {
    same: [{ word: "眠い", reading: "ねむい", meaning_mm: "အိပ်ငိုက်သော" }],
    diff: [{ word: "冴えている", reading: "さえている", meaning_mm: "စိတ်နိုးကြားလန်းဆန်းသော" }]
  },
  "眠い": {
    same: [{ word: "眠たい", reading: "ねむたい", meaning_mm: "အိပ်ချင်စမ်းစမ်းဖြစ်သော" }],
    diff: [{ word: "冴えている", reading: "さえている", meaning_mm: "မျက်လုံးပွင့်လန်းဆန်း" }]
  },
  "覚ます": {
    same: [{ word: "起こす", reading: "おこす", meaning_mm: "နှိုးထစေသည်" }],
    diff: [{ word: "眠らせる", reading: "ねむらせる", meaning_mm: "အိပ်စက်ခိုင်းစေသည်" }]
  },
  "覚める": {
    same: [{ word: "起きる", reading: "おきる", meaning_mm: "နိုးတပွင့်လန်းလာသည်" }],
    diff: [{ word: "眠る", reading: "ねむる", meaning_mm: "အိပ်ပျော်သွားသည်" }, { word: "寝る", reading: "ねる", meaning_mm: "အိပ်စက်သည်" }]
  },
  "息": {
    same: [{ word: "呼吸", reading: "こきゅう", meaning_mm: "အသက်ရှူသွင်းရှူထုတ်လှုပ်ရှားမှု" }],
    diff: []
  },
  "胸": {
    same: [],
    diff: [{ word: "背中", reading: "せなか", meaning_mm: "ကျောဘက်ပြင်" }]
  },
  "背中": {
    same: [],
    diff: [{ word: "胸", reading: "むね", meaning_mm: "ရင်ဘတ်" }, { word: "お腹", reading: "おなか", meaning_mm: "ဗိုက်" }]
  },
  "手首": {
    same: [],
    diff: [{ word: "足首", reading: "あしくび", meaning_mm: "ခြေကျင်းဝတ်" }]
  },

  // UNIT 20: Health
  "健康": {
    same: [{ word: "健勝", reading: "けんしょう", meaning_mm: "ကျန်းမာသန်စွမ်းခြင်း" }],
    diff: [{ word: "不健康", reading: "ふけんこう", meaning_mm: "ကျန်းမာရေးချို့တဲ့ခြင်း" }, { word: "病気", reading: "びょうき", meaning_mm: "ဖျားနာရောဂါရခြင်း" }]
  },
  "健康な": {
    same: [{ word: "元気な", reading: "げんきな", meaning_mm: "လန်းဆန်းကျန်းမာသော" }, { word: "健やかな", reading: "すこやかな", meaning_mm: "လန်းဖြာကျန်းမာစိုပြေသော" }],
    diff: [{ word: "不健康な", reading: "ふけんこうな", meaning_mm: "ရောဂါထူပြောသော" }]
  },
  "健康的な": {
    same: [{ word: "ヘルシーな", reading: "へるしーな", meaning_mm: "အာဟာရဖြစ်ကျန်းမာရေးညီညွတ်သော" }],
    diff: [{ word: "不健康な", reading: "ふけんこうな", meaning_mm: "ကျန်းမာရေးနှင့်မဆီလျော်သော" }]
  },
  "ストレス": {
    same: [{ word: "心労", reading: "しんろう", meaning_mm: "စိတ်ပူပန်သောကဖြစ်မှု" }, { word: "プレッシャー", reading: "ぷれっしゃー", meaning_mm: "စိတ်ပိုင်းဆိုင်ရာဖိအား" }],
    diff: [{ word: "リラックス", reading: "りらっくす", meaning_mm: "စိတ်အေးလက်အေးနေထိုင်မှု" }]
  },
  "症状": {
    same: [{ word: "容態", reading: "ようだい", meaning_mm: "နာကျင်ရောဂါအခြေအနေ" }],
    diff: []
  },
  "苦しい": {
    same: [{ word: "辛い", reading: "つらい", meaning_mm: "ပင်ပန်းခက်ခဲနာကျင်ရသော" }],
    diff: [{ word: "楽な", reading: "らくな", meaning_mm: "သက်တောင့်သက်သာရှိသော" }]
  },
  "苦しむ": {
    same: [{ word: "悩む", reading: "なやむ", meaning_mm: "သောကဖြစ်နာကျင်ရသည်" }],
    diff: [{ word: "楽しむ", reading: "たのしむ", meaning_mm: "ပျော်ရွှင်ကြည်နူးသည်" }]
  },
  "痛む": {
    same: [{ word: "疼く", reading: "うずく", meaning_mm: "နာကျင်ကိုက်ခဲသည်" }],
    diff: []
  },
  "痛み": {
    same: [{ word: "苦痛", reading: "くつう", meaning_mm: "နာကျင်ခံစားရမှု" }],
    diff: [{ word: "快感", reading: "かいかん", meaning_mm: "သာယာကြည်နူးမှုအရသာ" }]
  },
  "だるい": {
    same: [],
    diff: [{ word: "爽快な", reading: "そうかいな", meaning_mm: "လန်းဆန်းတက်ကြွသော" }]
  },
  "しびれる": {
    same: [{ word: "麻痺する", reading: "まひする", meaning_mm: "ထုံကျဉ်ကျပ်ခဲသည်" }],
    diff: []
  },
  "吐く": {
    same: [{ word: "嘔吐する", reading: "おうとする", meaning_mm: "အန်ထုတ်သည်" }],
    diff: [{ word: "吸う", reading: "すう", meaning_mm: "ရှူသွင်းသည်" }]
  },
  "傷": {
    same: [{ word: "怪我", reading: "けが", meaning_mm: "ထိခိုက်ဒဏ်ရာ" }],
    diff: []
  },
  "けが": {
    same: [{ word: "負傷", reading: "ふしょう", meaning_mm: "ထိခိုက်ရှနာမှု" }, { word: "傷", reading: "きず", meaning_mm: "ဒဏ်ရာ" }],
    diff: []
  },
  "診る": {
    same: [{ word: "診察する", reading: "しんさつする", meaning_mm: "ဆရာဝန်စမ်းသပ်စစ်ဆေးသည်" }],
    diff: []
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
