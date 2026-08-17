// v3.4 GBOARD SIZE - ترتيب Gboard مع تصميم Rapoo
const keyboardEl=document.getElementById('keyboard'),suggestionBar=document.getElementById('suggestionBar'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText'),miniToast=document.getElementById('miniToast'),numpadOverlay=document.getElementById('numpadOverlay'),numpadGrid=document.getElementById('numpadGrid'),batteryDisplay=document.getElementById('batteryDisplay'),timeDisplay=document.getElementById('timeDisplay'),messagesDisplay=document.getElementById('messagesDisplay');
let isShift=false,isCaps=false,isAlt=false,isCtrl=false,isTrackpadActive=false,isFullTrackpad=false,holdTimer=null,lastMoveX=0,startX=0,startY=0;
let currentLang='ar',currentTheme='midnight',currentSound='clicky',currentRGB='reactive',currentScale='medium',vibEnabled=true,soundEnabled=true,autocorrectEnabled=true,suggestEnabled=true,numpadEnabled=true;
let currentWord='',sentenceBuffer='',lastTapTime=0,lastTapKey='',processingKey=false,spacePressed=false;

// قاموس كامل 1600+ (مختصر للمساحة)
const englishFullDict = ["the","be","to","of","and","a","in","that","have","I","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us","hello","world","keyboard","fouad","for","first","f","space","trackpad","numpad","settings","theme","language","fast","stable","smooth","smart","ai","correction","thanks","please","love","happy","today","tomorrow","morning","night","good","great","awesome","beautiful","amazing","perfect","excellent","wonderful","fantastic","brilliant","super","nice","cool","love","like","hate","want","need","have","has","had","was","were","are","is","been","being","do","does","did","done","doing","can","could","should","would","will","shall","may","might","must","ought","going","come","came","coming","go","goes","went","get","got","gotten","getting","make","made","making","take","took","taken","taking","give","gave","given","giving","know","knew","known","knowing","think","thought","thinking","see","saw","seen","seeing","look","looked","looking","want","wanted","wanting","find","found","finding","tell","told","telling","ask","asked","asking","work","worked","working","seem","seemed","seeming","feel","felt","feeling","try","tried","trying","leave","left","leaving","call","called","calling","good","better","best","bad","worse","worst","big","bigger","biggest","small","smaller","smallest","large","larger","largest","much","more","most","many","few","fewer","fewest","own","other","another","same","different","new","old","young","first","last","long","short","high","low","great","little","right","left","next","early","young","important","few","public","bad","same","able","human","local","social","economic","political","military","national","international","federal","state","government","public","private","personal","business","company","system","program","service","information","history","party","country","world","school","state","family","student","group","country","problem","hand","part","place","case","week","company","system","program","question","work","government","number","night","point","home","water","room","mother","area","money","story","fact","month","lot","right","study","book","eye","job","word","business","issue","side","kind","head","house","service","friend","father","power","hour","game","line","end","member","law","car","city","community","name","president","team","minute","idea","kid","body","information","back","parent","face","others","level","office","door","health","person","art","war","history","party","result","change","morning","reason","research","girl","guy","moment","air","teacher","force","education","football","actually","probably","really","very","quite","rather","somewhat","too","enough","just","only","even","also","well","back","here","there","where","when","why","how","what","which","who","whom","whose","that","this","these","those"];
const englishCorrections = {"teh":"the","adn":"and","becuase":"because","recieve":"receive","seperate":"separate","occured":"occurred","definately":"definitely","accomodate":"accommodate","occassion":"occasion","embarass":"embarrass","neccessary":"necessary","priviledge":"privilege","concensus":"consensus","liason":"liaison","maintainance":"maintenance","occassionally":"occasionally","relevent":"relevant","enviroment":"environment","goverment":"government","acheive":"achieve","beleive":"believe","freind":"friend","u":"you","ur":"your","r":"are","thiss":"this","thatt":"that","hthis":"this","hthat":"that","fouad":"Fouad","tettm":"تم","tmm":"تم","f":"for","forst":"first","firt":"first"};
const arabicFullDict = ["ذ","ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د","ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط","ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ","السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هو","هي","نحن","انتم","هم","هن","هذا","هذه","ذلك","تلك","هؤلاء","الذي","التي","الذين","في","من","الى","إلى","على","عن","مع","بعد","قبل","تحت","فوق","يمين","شمال","أمام","خلف","بين","حول","كتاب","قلم","بيت","مدرسة","جامعة","عمل","وظيفة","شركة","وقت","يوم","أسبوع","شهر","سنة","عام","ساعة","دقيقة","ثانية","صباح","مساء","ليل","نهار","اليوم","غدا","أمس","موبايل","جوال","هاتف","كيبورد","لوحة","مفاتيح","مسافة","تراك","باد","شاشة","كمبيوتر","حاسوب","إنترنت","موقع","برنامج","تطبيق","إعدادات","لغة","ثيم","صوت","لون","ألوان","ضوء","شكرا","شكرًا","عفوا","حبيبي","حبيبتي","تمام","ظبط","ممتاز","رائع","جميل","حلو","قمر","عسل","غالي","غالية","الله","محمد","أحمد","مصر","السعودية","الإمارات","قطر","الكويت","عربي","عربية","صباح","الخير","مساء","النور","أهلا","سهلا","مرحبا","كيفك","شلونك","عامل","إيه","أخبارك","كويس","زين","تمام","الحمدلله","بخير","والله","بالله","إن","شاء","ما","شاء","سريع","كبير","صغير","مستقر","سلس","محسن","مطور","ذكي","رائع","جميل","ممتاز","سهل","صعب","قوي","ضعيف","سريع","بطيء","جديد","قديم","حب","حياة","صداقة","عائلة","أسرة","أب","أم","أخ","أخت","ابن","بنت","ولد","طفل","رجل","امرأة","شاب","شابة","صديق","صديقة","أكل","شرب","نام","قام","جلس","وقف","مشى","ركض","كتب","قرأ","سمع","شاف","نظر","تكلم","قال","سأل","أجاب","فهم","عرف","علم","درس","تعلم","عمل","لعب","واحد","اثنين","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","مئة","ألف","مليون","أنا","أنت","أنتِ","هو","هي","نحن","أنتم","هم","هن","كان","يكون","ليس","ما","لا","لم","لن","قد","سوف","إن","أن","لكن","فوق","تحت","يمين","شمال","أمام","خلف","داخل","خارج","وسط","بين","كبير","صغير","طويل","قصير","عريض","ضيق","واسع","عالي","منخفض","قوي","ضعيف","سريع","بطيء","خفيف","ثقيل","حار","بارد","جيد","سيء","حسن","قبيح","جميل","بشع","رائع","ممتاز","رديء","سهل","صعب","بسيط","معقد","واضح","غامض","مفتوح","مغلق","نظيف","وسخ","جديد","قديم","سعيد","حزين","غاضب","متحمس","متعب","مريض","صحي","غني","فقير","قوي","ضعيف","ذكي","غبي","كريم","بخيل","شجاع","جبان","صادق","كاذب","مخلص","خائن","فؤاد","أحمد","محمد","علي","حسن","حسين","عمر","خالد","عبدالله","عبدالرحمن","يوسف","إبراهيم","موسى","عيسى","مريم","فاطمة","زينب","عائشة","خديجة","سارة","نور","ليلى","هند","ريم","منى","سلمى","هالة","دينا","رانيا","نهى","سهى","لمى","رنا","رشا","غادة","مها","مي","هبة","أميرة","جميلة","حنان","وفاء","إيمان","أماني","أمل","هناء","سناء","نجلاء","علا","دعاء","شيماء","إسراء","آلاء","أسماء","هدى","نهى","تقوى","تقى","مصر","القاهرة","الإسكندرية","الجيزة","السعودية","الرياض","جدة","مكة","المدينة","الإمارات","دبي","أبوظبي","قطر","الدوحة","الكويت","البحرين","عمان","الأردن","لبنان","سوريا","العراق","اليمن","فلسطين","المغرب","الجزائر","تونس","ليبيا","السودان","تتم","تم","قلم","يوم","ثيم"];
const arabicCorrections = {"هاذا":"هذا","هاذي":"هذه","هاذه":"هذه","ذالك":"ذلك","هاؤلاء":"هؤلاء","اولائك":"أولئك","انامعرش":"انا معرفش","انامعرفش":"انا معرفش","معرش":"معرفش","ماعرفش":"معرفش","ماعرفشي":"معرفش","معرفشي":"معرفش","احمد":"أحمد","محمد":"محمد","انشاء":"إنشاء","ان":"أن","الي":"إلى","الا":"إلا","لاكن":"لكن","شكرن":"شكرا","عفون":"عفوا","مرحب":"مرحبا","تمام":"تمام","تتم":"تم","تتتم":"تم","هاذا":"هذا","الاان":"الآن","لاكن":"لكن","هاذي":"هذه","هاؤلا":"هؤلاء","انشاءالله":"إن شاء الله","انشالله":"إن شاء الله","ماشاءالله":"ما شاء الله","ماشالله":"ما شاء الله","الحمدلله":"الحمد لله","سبحانالله":"سبحان الله","اللهواكبر":"الله أكبر","فؤاد":"فؤاد","فواد":"فؤاد","فءاد":"فؤاد"};

const dictionaries = {
  en:{words:englishFullDict, corrections:englishCorrections, bigrams:{"hello":"there","how":"are","thank":"you","good":"morning","i":"am","whats":"up","for":"example","first":"time","f":"for"}},
  ar:{words:arabicFullDict, corrections:arabicCorrections, bigrams:{"السلام":"عليكم","صباح":"الخير","مساء":"الخير","كيف":"حالك","شكرا":"جزيلا","انا":"معرفش"}},
  ar_full:{words:arabicFullDict, corrections:arabicCorrections, bigrams:{"السلام":"عليكم"}}
};
Object.assign(dictionaries,{en_full:dictionaries.en, fr:dictionaries.en, de:dictionaries.en, es:dictionaries.en, tr:dictionaries.en, ru:dictionaries.en, fa:dictionaries.ar, ur:dictionaries.ar, hi:dictionaries.en, it:dictionaries.en, colemak:dictionaries.en, dvorak:dictionaries.en, azerty:dictionaries.en, qwertz:dictionaries.en, workman:dictionaries.en});

// ========== Layouts بترتيب Gboard ==========
const layouts = {
  en:{
    n:[{k:'`',d:'`'},{k:'1'},{k:'2'},{k:'3'},{k:'4'},{k:'5'},{k:'6'},{k:'7'},{k:'8'},{k:'9'},{k:'0'},{k:'-',d:'-'},{k:'=',d:'='}],
    q:[{k:'q'},{k:'w'},{k:'e'},{k:'r'},{k:'t'},{k:'y'},{k:'u'},{k:'i'},{k:'o'},{k:'p'},{k:'[',d:'['},{k:']',d:']'},{k:'\\',d:'\\'}],
    a:[{k:'a'},{k:'s'},{k:'d'},{k:'f'},{k:'g'},{k:'h'},{k:'j'},{k:'k'},{k:'l'},{k:';',d:';'},{k:"'",d:"'"},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],
    z:[{k:'shift',d:'⇧',c:'shift',id:'shiftKey'},{k:'z'},{k:'x'},{k:'c'},{k:'v'},{k:'b'},{k:'n'},{k:'m'},{k:',',d:','},{k:'.',d:'.'},{k:'/',d:'/'},{k:'shift',d:'⇧',c:'shift',id:'shiftKey2'}],
    b:[{k:'settings',d:'⚙️',c:'settings',id:'settingsBottom'},{k:'lang',d:'🌐',c:'lang',id:'langBottom'},{k:'space',d:'English',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'search',d:'🔍',c:'search',id:'searchKey'}]
  },
  ar:{
    n:[{k:'ذ',d:'ذ'},{k:'1'},{k:'2'},{k:'3'},{k:'4'},{k:'5'},{k:'6'},{k:'7'},{k:'8'},{k:'9'},{k:'0'},{k:'-',d:'-'},{k:'=',d:'='}],
    q:[{k:'ض'},{k:'ص'},{k:'ث'},{k:'ق'},{k:'ف'},{k:'غ'},{k:'ع'},{k:'ه'},{k:'خ'},{k:'ح'},{k:'ج'},{k:'د'},{k:'\\',d:'\\'}],
    a:[{k:'ش'},{k:'س'},{k:'ي'},{k:'ب'},{k:'ل'},{k:'ا'},{k:'ت'},{k:'ن'},{k:'م'},{k:'ك'},{k:'ط'},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],
    z:[{k:'shift',d:'⇧',c:'shift',id:'shiftKey'},{k:'ئ'},{k:'ء'},{k:'ؤ'},{k:'ر'},{k:'لا'},{k:'ى'},{k:'ة'},{k:'و'},{k:'ز'},{k:'ظ'},{k:'shift',d:'⇧',c:'shift',id:'shiftKey2'}],
    b:[{k:'settings',d:'⚙️',c:'settings',id:'settingsBottom'},{k:'lang',d:'🌐',c:'lang',id:'langBottom'},{k:'space',d:'مسافة',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'search',d:'🔍',c:'search',id:'searchKey'}]
  },
  ar_full:{
    n:[{k:'ذ',d:'ذ'},{k:'1'},{k:'2'},{k:'3'},{k:'4'},{k:'5'},{k:'6'},{k:'7'},{k:'8'},{k:'9'},{k:'0'},{k:'-',d:'-'},{k:'=',d:'='}],
    q:[{k:'ض'},{k:'ص'},{k:'ث'},{k:'ق'},{k:'ف'},{k:'غ'},{k:'ع'},{k:'ه'},{k:'خ'},{k:'ح'},{k:'ج'},{k:'د'},{k:'ش'}],
    a:[{k:'س'},{k:'ي'},{k:'ب'},{k:'ل'},{k:'ا'},{k:'ت'},{k:'ن'},{k:'م'},{k:'ك'},{k:'ط'},{k:'ئ'},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],
    z:[{k:'shift',d:'⇧',c:'shift',id:'shiftKey'},{k:'ء'},{k:'ؤ'},{k:'ر'},{k:'لا'},{k:'ى'},{k:'ة'},{k:'و'},{k:'ز'},{k:'ظ'},{k:',',d:'،'},{k:'shift',d:'⇧',c:'shift',id:'shiftKey2'}],
    b:[{k:'settings',d:'⚙️',c:'settings',id:'settingsBottom'},{k:'lang',d:'🌐',c:'lang',id:'langBottom'},{k:'space',d:'مسافة كاملة',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'search',d:'🔍',c:'search',id:'searchKey'}]
  }
};
// باقي اللغات = EN Gboard order
Object.assign(layouts,{
  colemak:{n:layouts.en.n,q:[{k:'q'},{k:'w'},{k:'f'},{k:'p'},{k:'g'},{k:'j'},{k:'l'},{k:'u'},{k:'y'},{k:';'},{k:'[',d:'['},{k:']',d:']'},{k:'\\',d:'\\'}],a:[{k:'a'},{k:'r'},{k:'s'},{k:'t'},{k:'d'},{k:'h'},{k:'n'},{k:'e'},{k:'i'},{k:'o'},{k:"'",d:"'"},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],z:[{k:'shift',d:'⇧',c:'shift',id:'shiftKey'},{k:'z'},{k:'x'},{k:'c'},{k:'v'},{k:'b'},{k:'k'},{k:'m'},{k:',',d:','},{k:'.',d:'.'},{k:'/',d:'/'},{k:'shift',d:'⇧',c:'shift',id:'shiftKey2'}],b:layouts.en.b},
  dvorak:{n:[{k:'`',d:'`'},{k:'1'},{k:'2'},{k:'3'},{k:'4'},{k:'5'},{k:'6'},{k:'7'},{k:'8'},{k:'9'},{k:'0'},{k:'[',d:'['},{k:']',d:']'}],q:[{k:"'",d:"'"},{k:',',d:','},{k:'.',d:'.'},{k:'p'},{k:'y'},{k:'f'},{k:'g'},{k:'c'},{k:'r'},{k:'l'},{k:'/',d:'/'},{k:'=',d:'='},{k:'\\',d:'\\'}],a:[{k:'a'},{k:'o'},{k:'e'},{k:'u'},{k:'i'},{k:'d'},{k:'h'},{k:'t'},{k:'n'},{k:'s'},{k:'-',d:'-'},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],z:[{k:'shift',d:'⇧',c:'shift',id:'shiftKey'},{k:';'},{k:'q'},{k:'j'},{k:'k'},{k:'x'},{k:'b'},{k:'m'},{k:'w'},{k:'v'},{k:'z'},{k:'shift',d:'⇧',c:'shift',id:'shiftKey2'}],b:layouts.en.b},
  azerty:{n:[{k:'²',d:'²'},{k:'&',d:'1'},{k:'é',d:'2'},{k:'"',d:'3'},{k:"'",d:'4'},{k:'(',d:'5'},{k:'-',d:'6'},{k:'è',d:'7'},{k:'_',d:'8'},{k:'ç',d:'9'},{k:'à',d:'0'},{k:')',d:')'},{k:'=',d:'='}],q:[{k:'a'},{k:'z'},{k:'e'},{k:'r'},{k:'t'},{k:'y'},{k:'u'},{k:'i'},{k:'o'},{k:'p'},{k:'^',d:'^'},{k:'$',d:'$'},{k:'\\',d:'\\'}],a:[{k:'q'},{k:'s'},{k:'d'},{k:'f'},{k:'g'},{k:'h'},{k:'j'},{k:'k'},{k:'l'},{k:'m'},{k:'ù',d:'ù'},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],z:[{k:'shift',d:'⇧',c:'shift',id:'shiftKey'},{k:'w'},{k:'x'},{k:'c'},{k:'v'},{k:'b'},{k:'n'},{k:',',d:','},{k:';',d:';'},{k:':',d:':'},{k:'!',d:'!'},{k:'shift',d:'⇧',c:'shift',id:'shiftKey2'}],b:layouts.en.b},
  qwertz:{n:[{k:'^',d:'^'},{k:'1'},{k:'2'},{k:'3'},{k:'4'},{k:'5'},{k:'6'},{k:'7'},{k:'8'},{k:'9'},{k:'0'},{k:'ß',d:'ß'},{k:'´',d:'´'}],q:[{k:'q'},{k:'w'},{k:'e'},{k:'r'},{k:'t'},{k:'z'},{k:'u'},{k:'i'},{k:'o'},{k:'p'},{k:'ü',d:'ü'},{k:'+',d:'+'},{k:'\\',d:'\\'}],a:[{k:'a'},{k:'s'},{k:'d'},{k:'f'},{k:'g'},{k:'h'},{k:'j'},{k:'k'},{k:'l'},{k:'ö',d:'ö'},{k:'ä',d:'ä'},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],z:[{k:'shift',d:'⇧',c:'shift',id:'shiftKey'},{k:'y'},{k:'x'},{k:'c'},{k:'v'},{k:'b'},{k:'n'},{k:'m'},{k:',',d:','},{k:'.',d:'.'},{k:'-',d:'-'},{k:'shift',d:'⇧',c:'shift',id:'shiftKey2'}],b:layouts.en.b},
  en_full:layouts.en, fr:{n:layouts.azerty.n,q:layouts.azerty.q,a:layouts.azerty.a,z:layouts.azerty.z,b:layouts.en.b}, de:{n:layouts.qwertz.n,q:layouts.qwertz.q,a:layouts.qwertz.a,z:layouts.qwertz.z,b:layouts.en.b}, es:layouts.en, tr:layouts.en, ru:layouts.ar, fa:layouts.ar, ur:layouts.ar, hi:layouts.en, it:layouts.en, workman:layouts.colemak
});

const KC={ESC:111,TAB:61,ENTER:66,LEFT:21,RIGHT:22,UP:19,DOWN:20};

let audioCtx=null;
function getCtx(){ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
function playSound(){ if(!soundEnabled||currentSound==='off') return; try{ const ctx=getCtx(),now=ctx.currentTime; const g=ctx.createGain(); g.gain.setValueAtTime(0.14,now); g.gain.exponentialRampToValueAtTime(0.01,now+0.04); const o=ctx.createOscillator(); o.type='square'; o.frequency.setValueAtTime(3000,now); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.04); }catch(e){} }
function commit(t){ if(window.Android&&Android.commitText) Android.commitText(t); }
function del(){ if(window.Android&&Android.deleteText) Android.deleteText(); }
function delN(n){ if(window.Android&&Android.deleteN) Android.deleteN(n); }
function sendKeyMod(c,s,ctrl,alt){ if(window.Android&&Android.sendKeyWithModifiers) Android.sendKeyWithModifiers(c,!!s,!!ctrl,!!alt); }
function moveCursor(dx){ if(window.Android&&Android.moveCursor) Android.moveCursor(dx); }
function saveSet(k,v){ try{ localStorage.setItem('rapoo_'+k,v); if(window.Android&&Android.saveSetting) Android.saveSetting(k,v);}catch(e){} }
function loadSet(k,d){ try{ const v=localStorage.getItem('rapoo_'+k); if(v!==null) return v; if(window.Android&&Android.getSetting){const av=Android.getSetting(k,d); if(av) return av;}}catch(e){} return d; }
function vibrate(){ if(!vibEnabled) return; try{if(navigator.vibrate) navigator.vibrate(3)}catch(e){} }
function showToast(msg){ miniToast.textContent=msg; miniToast.classList.add('show'); setTimeout(()=>miniToast.classList.remove('show'),1000); }
function levenshtein(a,b){ if(a.length===0) return b.length; if(b.length===0) return a.length; const m=[]; for(let i=0;i<=b.length;i++){m[i]=[i]} for(let j=0;j<=a.length;j++){m[0][j]=j} for(let i=1;i<=b.length;i++){for(let j=1;j<=a.length;j++){if(b.charAt(i-1)==a.charAt(j-1)) m[i][j]=m[i-1][j-1]; else m[i][j]=Math.min(m[i-1][j-1]+1,Math.min(m[i][j-1]+1,m[i-1][j]+1))}} return m[b.length][a.length]; }

function getSmartSuggestions(word,sentence){
  if(!suggestEnabled||!word||word.length<1) return {words:[],smart:[],autoFix:null};
  const dict=dictionaries[currentLang]||dictionaries.en;
  const lower=word.toLowerCase().trim();
  const senLower=(sentence||'').toLowerCase().trim();
  let wordSugs=[],smartSugs=[],autoFix=null;
  if(dict.corrections && dict.corrections[lower]){ autoFix=dict.corrections[lower]; smartSugs.push({text:autoFix,type:'auto',icon:'✓',isAuto:true,score:0}); }
  const wordsInSen=senLower.split(/\s+/).filter(w=>w.length>0);
  const lastWord=wordsInSen[wordsInSen.length-2]||'';
  if(dict.bigrams && dict.bigrams[lastWord]){ const b=dict.bigrams[lastWord]; if(b.toLowerCase()!==lower) smartSugs.push({text:b,type:'smart',icon:'🧠',score:1}); }
  dict.words.forEach(w=>{ const wl=w.toLowerCase(); if(wl.startsWith(lower) && wl!==lower && w.length>1){ wordSugs.push({w,sc:0,exact:1}); } else if(lower.length>=2 && wl.includes(lower) && wl!==lower){ wordSugs.push({w,sc:1,exact:0}); } });
  if(wordSugs.length<8 && lower.length>=2){
    dict.words.forEach(w=>{ const wl=w.toLowerCase(); if(Math.abs(wl.length-lower.length)>2) return; const d=levenshtein(lower,wl); if(d<=2 && d>0 && wl!==lower){ wordSugs.push({w,sc:d+2,exact:0}); } });
  }
  wordSugs.sort((a,b)=>{ if(a.exact!==b.exact) return b.exact-a.exact; return a.sc-b.sc; });
  const uniq=[]; const seen=new Set();
  for(let r of wordSugs){ const key=r.w.toLowerCase(); if(!seen.has(key)){ seen.add(key); uniq.push(r.w); } if(uniq.length>=8) break; }
  return {words:uniq,smart:smartSugs.slice(0,3),autoFix:autoFix};
}
function updateSuggestions(){
  if(!suggestEnabled){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.3">مطفية</div>'; return; }
  if(!currentWord){ suggestionBar.innerHTML=`<div class="suggestion" style="opacity:.4">${(dictionaries[currentLang]||dictionaries.en).words.length} كلمة • ابدأ الكتابة</div>`; return; }
  const sugs=getSmartSuggestions(currentWord,sentenceBuffer);
  let html='';
  if(sugs.autoFix){ html+=`<div class="suggestion auto-fix" data-s="${sugs.autoFix}" data-auto="1">✓ ${sugs.autoFix} ⏎</div>`; } else { html+=`<div class="suggestion active">${currentWord}</div>`; }
  sugs.smart.forEach(s=>{ if(!s.isAuto) html+=`<div class="suggestion smart" data-s="${s.text}"> ${s.icon} ${s.text}</div>`; });
  sugs.words.forEach(w=>{ if(sugs.autoFix && w.toLowerCase()===sugs.autoFix.toLowerCase()) return; html+=`<div class="suggestion correction" data-s="${w}">${w}</div>`; });
  if(sugs.words.length===0&&sugs.smart.length===0&&!sugs.autoFix) html=`<div class="suggestion" style="opacity:.5">لا يوجد • ${currentWord}</div>`;
  suggestionBar.innerHTML=html;
  suggestionBar.querySelectorAll('[data-s]').forEach(el=>{
    el.addEventListener('click',()=>{
      const sug=el.dataset.s;
      const len=currentWord.length;
      if(len>0) delN(len);
      setTimeout(()=>{ commit(sug+' '); currentWord=''; sentenceBuffer+=' '+sug+' '; if(sentenceBuffer.length>100) sentenceBuffer=sentenceBuffer.slice(-60); updateSuggestions(); playSound(); },30);
    });
  });
}
function handleSpace(){
  if(!autocorrectEnabled||!currentWord) return false;
  const dict=dictionaries[currentLang]||dictionaries.en;
  const lower=currentWord.toLowerCase();
  if(dict.corrections && dict.corrections[lower]){
    const correction=dict.corrections[lower];
    delN(currentWord.length);
    setTimeout(()=>{ commit(correction+' '); showToast(`✓ ${currentWord} → ${correction}`); currentWord=''; sentenceBuffer+=' '+correction+' '; },20);
    return true;
  }
  if(currentWord.length>=3){
    let best=null,bestDist=3;
    dict.words.forEach(w=>{ const wl=w.toLowerCase(); if(Math.abs(wl.length-lower.length)>2) return; const d=levenshtein(lower,wl); if(d<bestDist && d>0){ best=w; bestDist=d; } });
    if(best && bestDist===1){
      delN(currentWord.length);
      setTimeout(()=>{ commit(best+' '); showToast(`✓ ${currentWord} → ${best}`); currentWord=''; sentenceBuffer+=' '+best+' '; },20);
      return true;
    }
  }
  return false;
}
function onCharTyped(ch){
  if(/[a-zA-Z\u0600-\u06FF0-9]/.test(ch)){ currentWord+=ch; sentenceBuffer+=ch; }
  else if(ch===' '){ if(handleSpace()){ updateSuggestions(); return; } currentWord=''; sentenceBuffer+=' '; if(sentenceBuffer.length>100) sentenceBuffer=sentenceBuffer.slice(-60); }
  else { currentWord=''; sentenceBuffer+=ch; }
  updateSuggestions();
}
function onDelete(){ if(currentWord.length>0) currentWord=currentWord.slice(0,-1); if(sentenceBuffer.length>0) sentenceBuffer=sentenceBuffer.slice(0,-1); updateSuggestions(); }
function updateFooter(){
  try{
    let battery=98;
    if(window.Android&&Android.getBatteryLevel) battery=Android.getBatteryLevel();
    let timeStr="8:09";
    if(window.Android&&Android.getTime) timeStr=Android.getTime();
    else { const d=new Date(); timeStr=d.getHours()+':'+String(d.getMinutes()).padStart(2,'0'); }
    batteryDisplay.innerHTML=`🔋 ${battery}% <span class="status-dot" style="background:${battery>20?'#10b981':'#ef4444'}"></span>`;
    timeDisplay.textContent=timeStr;
    const msgCount=3;
    messagesDisplay.innerHTML=`💬 ${msgCount} رسائل <span class="status-dot" style="background:#f59e0b"></span>`;
  }catch(e){}
}
setInterval(updateFooter,2000);
updateFooter();

function renderKeyboard(){
  const layout=layouts[currentLang]||layouts.en;
  let html='';
  const rows=[{k:'n',cls:'row-n'},{k:'q',cls:'row-q'},{k:'a',cls:'row-a'},{k:'z',cls:'row-z'},{k:'b',cls:'row-b'}];
  rows.forEach(r=>{
    const row=layout[r.k]; if(!row) return;
    html+=`<div class="row ${r.cls} ${r.k==='b'?'bottom-row':''}">`;
    row.forEach(item=>{
      if(item.special){ html+=`<div class="key ${item.c||''}" id="${item.id||''}" data-key="${item.k}"><div class="space-content"><span>${item.d}</span><div class="track-icon">▣</div></div><div class="space-hint">HOLD • SLIDE</div><div class="trackpad-grid" id="trackpadGrid"></div><div class="track-dot" id="trackDot"></div></div>`; }
      else{ const disp=item.d||item.k; const cls=item.c||''; const id=item.id?` id="${item.id}"`:''; html+=`<div class="key ${cls}"${id} data-key="${item.k}">${disp}</div>`; }
    });
    html+=`</div>`;
  });
  keyboardEl.innerHTML=html;
  attachEvents();
  updateUI();
  updateSuggestions();
  if(numpadGrid){
    const nums=[['7','8','9','/'],['4','5','6','*'],['1','2','3','-'],['0','.','=','+']];
    let ngHtml='';
    nums.forEach(row=>{ row.forEach(n=>{ ngHtml+=`<div class="numpad-key" data-num="${n}">${n}</div>`; }); });
    ngHtml+=`<div class="numpad-key" data-num="Enter" style="grid-column:span 4;background:#8b5cf6">Enter ⏎</div>`;
    numpadGrid.innerHTML=ngHtml;
    numpadGrid.querySelectorAll('.numpad-key').forEach(k=>{
      k.addEventListener('pointerdown',e=>{ e.preventDefault(); k.classList.add('pressed'); commit(k.dataset.num==='Enter'?'\n':k.dataset.num); playSound(); vibrate(); });
      k.addEventListener('pointerup',e=>{ k.classList.remove('pressed'); });
    });
  }
}
function updateUI(){
  document.getElementById('capsKey')?.classList.toggle('active', isCaps);
  document.querySelectorAll('#shiftKey,#shiftKey2').forEach(k=>{ const isActive=isShift||isCaps; k.classList.toggle('active', isActive); });
  document.getElementById('ctrlKey')?.classList.toggle('active', isCtrl);
  document.getElementById('altKey')?.classList.toggle('active', isAlt);
  langIndicator.textContent=currentLang.toUpperCase().slice(0,4);
  versionText.textContent=`v3.4 GBOARD • ${ (dictionaries[currentLang]||dictionaries.en).words.length }`;
  document.body.className=document.body.className.replace(/theme-\S+/g,'').replace(/scale-\S+/g,'');
  document.body.classList.add('theme-'+currentTheme);
  document.body.classList.add('scale-'+currentScale);
}
let deleteInterval=null,deleteSpeed=100,deleteHoldTimer=null,deleteActive=false;
function startFastDelete(){ if(deleteActive) return; deleteActive=true; del(); onDelete(); playSound(); deleteSpeed=100; deleteInterval=setInterval(()=>{ del(); onDelete(); if(deleteSpeed>18){ deleteSpeed-=5; clearInterval(deleteInterval); deleteInterval=setInterval(()=>{ del(); onDelete(); },deleteSpeed); } },deleteSpeed); }
function stopFastDelete(){ deleteActive=false; clearInterval(deleteInterval); deleteInterval=null; clearTimeout(deleteHoldTimer); deleteHoldTimer=null; deleteSpeed=100; }
function attachEvents(){
  window.addEventListener('pointerup',stopFastDelete,{passive:true});
  window.addEventListener('touchend',stopFastDelete,{passive:true});
  window.addEventListener('pointercancel',stopFastDelete,{passive:true});
  const keys=keyboardEl.querySelectorAll('.key');
  keys.forEach(k=>{
    let startX=0,startY=0,startTime=0,moved=false,isDel=k.id==='delKey'||k.dataset.key==='Backspace';
    let handled=false;
    const isSpace=k.id==='spaceTrackpad';
    const isSettings=k.id==='settingsBottom'||k.dataset.key==='settings';
    const isLang=k.id==='langBottom'||k.dataset.key==='lang';
    const isSearch=k.id==='searchKey'||k.dataset.key==='search';
    const handlePointerDown=(e)=>{
      if(processingKey && !isSpace) return;
      startX=e.clientX; startY=e.clientY; startTime=Date.now(); moved=false; handled=false;
      if(!isSpace){ k.classList.add('pressed'); if(currentRGB!=='off'){ k.classList.add('rgb-react'); setTimeout(()=>k.classList.remove('rgb-react'),250); } }
      if(isDel){ deleteHoldTimer=setTimeout(()=>{ startFastDelete(); },300); }
      if(isSpace){ startX=lastMoveX=e.clientX; startY=e.clientY; clearTimeout(holdTimer); holdTimer=setTimeout(()=>{ if(!isTrackpadActive){ isTrackpadActive=true; k.classList.add('track-active'); document.getElementById('overlay').classList.add('show'); vibrate(); playSound(); } },360); }
    };
    const handlePointerMove=(e)=>{
      if(isSpace){
        if(!isTrackpadActive){ if(Math.abs(e.clientX-startX)>10) clearTimeout(holdTimer); return; }
        const dx=e.clientX-lastMoveX; if(Math.abs(dx)>7){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=e.clientX; const rect=k.getBoundingClientRect(); let pct=((e.clientX-rect.left)/rect.width)*100; pct=Math.max(5,Math.min(95,pct)); const dot=document.getElementById('trackDot'); if(dot) dot.style.left=pct+'%'; }
        return;
      }
      if(Math.abs(e.clientX-startX)>10||Math.abs(e.clientY-startY)>10){ moved=true; k.classList.remove('pressed'); if(isDel) stopFastDelete(); }
    };
    const handlePointerUp=(e)=>{
      if(handled) return; handled=true;
      if(isSpace){
        clearTimeout(holdTimer);
        if(isTrackpadActive){ isTrackpadActive=false; k.classList.remove('track-active'); const ov=document.getElementById('overlay'); if(!isFullTrackpad) ov.classList.remove('show'); const dot=document.getElementById('trackDot'); if(dot) dot.style.left='50%'; }
        else{
          if(Math.abs(e.clientX-startX)<10&&Math.abs(e.clientY-startY)<10){
            if(spacePressed) return;
            spacePressed=true;
            if(!handleSpace()){ commit(' '); onCharTyped(' '); }
            playSound(); vibrate();
            setTimeout(()=>{ spacePressed=false; },60);
          }
        }
        return;
      }
      k.classList.remove('pressed');
      if(isDel) stopFastDelete();
      if(moved) return;
      if(Date.now()-startTime>500 && !isDel) return;
      const now=Date.now();
      if(k.dataset.key===lastTapKey && now-lastTapTime<70) return;
      lastTapTime=now; lastTapKey=k.dataset.key;
      if(processingKey) return;
      processingKey=true; setTimeout(()=>{ processingKey=false; },30);
      const key=k.dataset.key; if(!key) return;
      playSound(); vibrate();
      if(key==='settings'){ document.getElementById('settingsPanel').classList.add('show'); return; }
      if(key==='lang'){ const langs=['en','ar','ar_full','colemak','dvorak']; const idx=langs.indexOf(currentLang); const next=langs[(idx+1)%langs.length]; currentLang=next; saveSet('language',currentLang); renderKeyboard(); showToast('🌐 '+currentLang); return; }
      if(key==='search'){ sendKeyMod(KC.ENTER,isShift,isCtrl,isAlt); onCharTyped('\n'); return; }
      if(key==='shift'){isShift=!isShift;updateUI();return;}
      if(key==='caps'){isCaps=!isCaps;updateUI();return;}
      if(key==='ctrl'){isCtrl=!isCtrl;updateUI();return;}
      if(key==='alt'){isAlt=!isAlt;updateUI();return;}
      if(key==='fn'){const n=Date.now(); if(n-(window.lastFnTap||0)<350){ if(numpadEnabled){ numpadOverlay.classList.toggle('show'); } else { isFullTrackpad=!isFullTrackpad; const ov=document.getElementById('overlay'); if(isFullTrackpad) ov.classList.add('show'); else ov.classList.remove('show'); } } window.lastFnTap=n; return;}
      if(key==='esc'){sendKeyMod(KC.ESC,isShift,isCtrl,isAlt);currentWord='';sentenceBuffer='';updateSuggestions();return;}
      if(key==='tab'){sendKeyMod(KC.TAB,isShift,isCtrl,isAlt);onCharTyped('\t');return;}
      if(key==='enter'){sendKeyMod(KC.ENTER,isShift,isCtrl,isAlt);onCharTyped('\n');return;}
      if(key==='Backspace'){del();onDelete();return;}
      if(/^F\d+$/.test(key)){const code=KC[key]; if(code) sendKeyMod(code,isShift,isCtrl,isAlt); currentWord='';sentenceBuffer='';updateSuggestions(); return;}
      if(key==='arrowleft'){sendKeyMod(KC.LEFT,isShift,isCtrl,isAlt);return;}
      if(key==='arrowright'){sendKeyMod(KC.RIGHT,isShift,isCtrl,isAlt);return;}
      if(key==='arrowupdown'){sendKeyMod(KC.UP,isShift,isCtrl,isAlt);return;}
      let out=key;
      if(out.length===1){ if(currentLang.startsWith('en')&&/[a-z]/.test(out)) out=(isShift||isCaps)?out.toUpperCase():out.toLowerCase(); }
      if(out==='space'){ if(spacePressed) return; spacePressed=true; if(!handleSpace()){ commit(' '); onCharTyped(' '); } setTimeout(()=>{ spacePressed=false; },60); }
      else { if(isCtrl||isAlt){const code=KC[out.toUpperCase()]||0; if(code) sendKeyMod(code,isShift,isCtrl,isAlt); else commit(out);} else commit(out); onCharTyped(out); }
      if(isShift){isShift=false;updateUI();}
    };
    k.addEventListener('pointerdown',handlePointerDown,{passive:true});
    k.addEventListener('pointermove',handlePointerMove,{passive:true});
    k.addEventListener('pointerup',handlePointerUp,{passive:true});
    k.addEventListener('pointercancel',()=>{ k.classList.remove('pressed'); stopFastDelete(); if(k.id==='spaceTrackpad'){ clearTimeout(holdTimer); isTrackpadActive=false; k.classList.remove('track-active'); } },{passive:true});
  });
  const overlay=document.getElementById('overlay');
  overlay.addEventListener('click',()=>{ if(isTrackpadActive){ isTrackpadActive=false; document.getElementById('spaceTrackpad')?.classList.remove('track-active'); if(!isFullTrackpad) overlay.classList.remove('show'); } if(isFullTrackpad){ isFullTrackpad=false; overlay.classList.remove('show'); } });
}
document.getElementById('dotsMenu')?.addEventListener('click',()=>document.getElementById('settingsPanel').classList.add('show'));
document.getElementById('closeSettings')?.addEventListener('click',()=>document.getElementById('settingsPanel').classList.remove('show'));
document.getElementById('closeNumpad')?.addEventListener('click',()=>numpadOverlay.classList.remove('show'));
document.querySelectorAll('#langOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#langOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentLang=b.dataset.lang; saveSet('language',currentLang); renderKeyboard(); showToast('🌐 '+currentLang);}));
document.querySelectorAll('#themeOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#themeOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentTheme=b.dataset.theme; saveSet('theme',currentTheme); updateUI(); showToast('🎨 '+currentTheme);}));
document.querySelectorAll('#rgbOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#rgbOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentRGB=b.dataset.rgb; saveSet('rgb',currentRGB); updateUI(); showToast('🌈 '+currentRGB);}));
document.querySelectorAll('#scaleOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#scaleOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentScale=b.dataset.scale; saveSet('scale',currentScale); updateUI(); showToast('🔍 '+currentScale);}));
document.querySelectorAll('#soundOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#soundOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentSound=b.dataset.sound; soundEnabled=currentSound!=='off'; saveSet('sound',currentSound); saveSet('sound_enabled',soundEnabled?'true':'false'); if(soundEnabled) playSound();}));
document.getElementById('autocorrectToggle')?.addEventListener('click',function(){autocorrectEnabled=!autocorrectEnabled; this.textContent=`${autocorrectEnabled?'✅':'❌'} تصحيح بمسافة`; saveSet('autocorrect',autocorrectEnabled?'true':'false');});
document.getElementById('suggestToggle')?.addEventListener('click',function(){suggestEnabled=!suggestEnabled; this.textContent=`${suggestEnabled?'💡':'❌'} اقتراحات`; saveSet('suggest',suggestEnabled?'true':'false'); updateSuggestions();});
document.getElementById('vibToggle')?.addEventListener('click',function(){vibEnabled=!vibEnabled; this.textContent=`📳 اهتزاز: ${vibEnabled?'مفعل':'مطفي'}`; saveSet('vib',vibEnabled?'true':'false'); if(vibEnabled) vibrate();});
document.getElementById('numpadToggle')?.addEventListener('click',function(){numpadEnabled=!numpadEnabled; this.textContent=`🔢 نمباد: ${numpadEnabled?'مفعل':'مطفي'}`; saveSet('numpad',numpadEnabled?'true':'false');});
document.getElementById('resetBtn')?.addEventListener('click',()=>{localStorage.clear(); location.reload();});
currentLang=loadSet('language','ar'); currentTheme=loadSet('theme','midnight'); currentSound=loadSet('sound','clicky'); currentRGB=loadSet('rgb','reactive'); currentScale=loadSet('scale','medium'); soundEnabled=loadSet('sound_enabled','true')==='true'; vibEnabled=loadSet('vib','true')==='true';
document.querySelector(`[data-lang="${currentLang}"]`)?.classList.add('active');
document.querySelector(`[data-theme="${currentTheme}"]`)?.classList.add('active');
document.querySelector(`[data-sound="${currentSound}"]`)?.classList.add('active');
document.querySelector(`[data-rgb="${currentRGB}"]`)?.classList.add('active');
document.querySelector(`[data-scale="${currentScale}"]`)?.classList.add('active');
renderKeyboard();
console.log('Rapoo v3.4 GBOARD SIZE - Gboard order & size with Rapoo design, settings in colored dots');
