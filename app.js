'use strict';
(() => {
  const routes = new Set(['home','about','themes','news','resources','calendar','member','social','contact','numbers','ai','association']);
  const pages = Array.from(document.querySelectorAll('[data-page]'));
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const menuButton = document.getElementById('menu-button');
  const pageTitles = {
    home: '首頁', about: '關於 Ruby 品妍', themes: '三大主題入口',
    news: '最新消息', resources: '資源分享', calendar: '活動行事曆',
    member: '會員專區', social: '社群平台', contact: '聯絡我們',
    numbers: '品妍玩數字', ai: 'Ruby AI 樂學教室', association: '新北市沐庠樂學成長協會'
  };
  function closeMenu() {
    sidebar.classList.remove('is-open');
    backdrop.classList.remove('show');
    menuButton.setAttribute('aria-expanded','false');
    menuButton.setAttribute('aria-label','開啟選單');
  }
  function showRoute() {
    const raw = decodeURIComponent(window.location.hash.slice(1).split('?')[0]);
    const route = routes.has(raw) ? raw : 'home';
    pages.forEach(p => {const yes = p.dataset.page === route; p.classList.toggle('active', yes); p.setAttribute('aria-hidden', String(!yes));});
    document.querySelectorAll('.side-nav a').forEach(a => {
      const isCurrent = a.getAttribute('href') === '#' + route;
      a.classList.toggle('active', isCurrent);
      if(isCurrent) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    document.title = `${pageTitles[route]}｜Ruby 品妍`;
    closeMenu();
    window.scrollTo({top:0,behavior:'instant'});
  }
  window.addEventListener('hashchange',showRoute);
  showRoute();
  menuButton.addEventListener('click',() => {
    const open = sidebar.classList.toggle('is-open');
    backdrop.classList.toggle('show',open);
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'關閉選單':'開啟選單');
  });
  backdrop.addEventListener('click',closeMenu);
  document.addEventListener('keydown',e => {if(e.key === 'Escape'){closeMenu();closeCourse();}});
  document.getElementById('year').textContent = String(new Date().getFullYear());

  // Calendar: dates are real, but no event records are invented.
  const today = new Date();
  let calendarDate = new Date(today.getFullYear(),today.getMonth(),1);
  const monthTitle = document.getElementById('calendar-month-title');
  const calendarDays = document.getElementById('calendar-days');
  function renderCalendar(){
    const year = calendarDate.getFullYear(), month = calendarDate.getMonth();
    monthTitle.textContent = `${year} 年 ${month+1} 月`;
    calendarDays.replaceChildren();
    const firstDay = new Date(year,month,1).getDay();
    const count = new Date(year,month+1,0).getDate();
    for(let j=0;j<firstDay;j++){
      const empty=document.createElement('span');empty.className='empty';empty.setAttribute('aria-hidden','true');calendarDays.appendChild(empty);
    }
    for(let i=1;i<=count;i++){
      const item=document.createElement('span');item.textContent=String(i);
      item.setAttribute('role','gridcell');item.setAttribute('aria-label',`${year} 年 ${month+1} 月 ${i} 日，尚無公布活動`);
      if(year===today.getFullYear() && month===today.getMonth() && i===today.getDate()){
        item.classList.add('today');item.setAttribute('aria-label',`${year} 年 ${month+1} 月 ${i} 日，今天，尚無公布活動`);
      }
      calendarDays.appendChild(item);
    }
  }
  document.getElementById('calendar-prev').addEventListener('click',()=>{calendarDate.setMonth(calendarDate.getMonth()-1);renderCalendar();});
  document.getElementById('calendar-next').addEventListener('click',()=>{calendarDate.setMonth(calendarDate.getMonth()+1);renderCalendar();});
  renderCalendar();

  // Learning checklist: only saved locally in the visitor's browser.
  const practice = Array.from(document.querySelectorAll('[data-practice]'));
  const storageKey='rubyportal-practice-v1';
  let practiceState = {};
  try{practiceState=JSON.parse(localStorage.getItem(storageKey)||'{}')||{}}catch{practiceState={}}
  function updatePractice(){
    let done=0;
    practice.forEach(box=>{if(box.checked)done++;});
    document.getElementById('practice-progress-bar').style.width=`${done/practice.length*100}%`;
    document.getElementById('practice-progress-text').textContent=`已完成 ${done} / ${practice.length} 項`;
  }
  practice.forEach(box=>{
    box.checked=Boolean(practiceState[box.dataset.practice]);
    box.addEventListener('change',()=>{
      practiceState[box.dataset.practice]=box.checked;
      try{localStorage.setItem(storageKey,JSON.stringify(practiceState))}catch{}
      updatePractice();
    });
  });
  document.getElementById('reset-practice').addEventListener('click',()=>{
    practiceState={};practice.forEach(box=>box.checked=false);
    try{localStorage.removeItem(storageKey)}catch{}
    updatePractice();
  });
  updatePractice();

  // News filters will work when confirmed announcement data is added.
  const filterNames={all:'三大主題',numbers:'品妍玩數字',ai:'Ruby AI 樂學教室',association:'新北市沐庠樂學成長協會'};
  document.querySelectorAll('[data-news-filter]').forEach(button=>{
    button.addEventListener('click',()=>{
      document.querySelectorAll('[data-news-filter]').forEach(other=>other.classList.toggle('active',other===button));
      const chosen=button.dataset.newsFilter;
      document.getElementById('news-empty-text').textContent=`${filterNames[chosen]}目前尚未匯入正式公告資料。未確認的日期與活動不會自行編造。`;
    });
  });

  // Course details open a real dialog, without pretending to accept registration.
  const courseDescriptions={
    '手機基本操作':'從觸控、畫面辨識、語音輸入與日常手機功能開始，練習穩定操作。',
    'Gemini 與生成式 AI':'以日常問題為例，練習如何向 AI 提問、理解與查核回覆。',
    'AI 圖像與影片':'了解圖片提示詞、早安圖與創意影音的基本操作流程。',
    '雲端與 Gmail':'認識 Gmail、雲端硬碟、Google 相簿及手機儲存空間的差異。',
    '手機安全與防詐':'練習辨識可疑訊息、保護帳號及個人資訊的基本觀念。',
    'LINE 與日常應用':'熟悉 LINE 訊息、照片與日常交流中的實用功能。'
  };
  const dialog=document.getElementById('course-dialog');
  const dialogClose=document.getElementById('course-close');
  let previousFocus=null;
  function openCourse(name){
    previousFocus=document.activeElement;
    document.getElementById('course-dialog-title').textContent=name;
    document.getElementById('course-dialog-description').textContent=courseDescriptions[name]||'課程介紹準備中';
    dialog.classList.add('visible');dialog.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';dialogClose.focus();
  }
  function closeCourse(){
    if(!dialog.classList.contains('visible'))return;
    dialog.classList.remove('visible');dialog.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    if(previousFocus && previousFocus.focus)previousFocus.focus();
  }
  document.querySelectorAll('[data-course]').forEach(b=>b.addEventListener('click',()=>openCourse(b.dataset.course)));
  dialogClose.addEventListener('click',closeCourse);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeCourse();});
  dialog.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const els=Array.from(dialog.querySelectorAll('button,a[href]'));
    if(!els.length)return;
    if(e.shiftKey && document.activeElement===els[0]){e.preventDefault();els[els.length-1].focus();}
    if(!e.shiftKey && document.activeElement===els[els.length-1]){e.preventDefault();els[0].focus();}
  });

  // Inquiry: text can be copied, but nothing is sent to a server.
  const inquiry=document.getElementById('inquiry-form');
  const inquiryStatus=document.getElementById('inquiry-status');
  function fallbackCopy(text){
    const temp=document.createElement('textarea');temp.value=text;temp.setAttribute('readonly','');
    temp.style.position='fixed';temp.style.opacity='0';document.body.appendChild(temp);
    temp.select();let ok=false;
    try{ok=document.execCommand('copy')}catch{}
    temp.remove();return ok;
  }
  inquiry.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const topic=document.getElementById('inquiry-topic').value;
    const message=document.getElementById('inquiry-message').value.trim();
    if(!message){inquiryStatus.textContent='請先填寫想詢問的內容。';document.getElementById('inquiry-message').focus();return;}
    const text=`您好，我想詢問【${topic}】。\n${message}\n（由 Ruby 品妍入口網站整理）`;
    let copied=false;
    try{if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(text);copied=true;}else{copied=fallbackCopy(text);}}catch{copied=fallbackCopy(text);}
    if(copied){
      inquiryStatus.textContent='詢問文字已複製，請在 LINE 對話中貼上並自行送出。';
      window.open('https://lin.ee/4HfPuwG','_blank','noopener,noreferrer');
    }else{
      inquiryStatus.textContent='無法自動複製，請選取輸入內容自行複製，再按左側 LINE 連結聯繫。';
    }
  });
})();
