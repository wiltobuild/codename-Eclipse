const nav=document.querySelector('#chapter-nav'),content=document.querySelector('#chapter-content');let current=0;
nav.innerHTML=chapters.map((c,i)=>`<a href="#${c.id}" data-chapter="${c.id}"><span>${String(i+1).padStart(2,'0')}</span>${c.label}</a>`).join('');
const chapterArt={
overview:['eclipse-world','TWO CIVILIZATIONS · ONE ANCESTRY','An eclipse over contrasting elven civilizations'],
peoples:['sun-battlemage','THE PEOPLES · CULTURE & IDENTITY','The Sun Elf battlemage heroine casting a golden ward','portrait'],
protagonists:['sun-battlemage','THE BATTLEMAGE & THE MOON WARDEN · DUTY & DESIRE','The Sun Elf heroine in protective ivory-gold battle armor','portrait'],
history:['eclipse-world','THE ANCIENT SCHISM · A DISPUTED HISTORY','Golden and violet elven cities divided by a deep chasm'],
divine:['fey-magic','THE INHERITED ARTS · OLDER THAN RELIGION','Gold and violet spellwork converging between two elven hands','magic'],
bloodlines:['sun-battlemage','BLOODLINES · FAMILY & POWER','The Sun Elf battlemage heroine whose marriage contract is coming due','portrait'],
underworld:['underground-city','THE UNDERGROUND ALLIANCE · A SHARED CIVILIZATION','A luminous city combining dwarven halls and hanging elven towers'],
bond:['fey-magic','FATED MATES · RECOGNITION & CHOICE','Two elven hands reaching through interwoven magic','magic'],
primordial:['eclipse-world','THE PRIMORDIAL THREAT · A WORLD TURNED AGAINST ITSELF','Divided elven civilizations beneath an ominous sky'],
fae:['fey-magic','BEYOND THE VANISHED FAE · THE HIDDEN INHERITANCE','Ancient gold and violet magic converging between elven hands','magic'],
mysteries:['eclipse-world','THE UNANSWERED · FRAGMENTS OF A LOST WORLD','An eclipse suspended over an ancient fantasy landscape']};
function render(id,focus=false){
 let i=chapters.findIndex(c=>c.id===id);if(i<0)i=0;current=i;const c=chapters[i],art=chapterArt[c.id];
 content.innerHTML=`<h2>${c.title}</h2><p class="lede">${c.lede}</p><figure class="chapter-art ${art[3]||''}"><img src="${art[0]}.webp" alt="${art[2]}" width="1536" height="1024"><figcaption>${art[1]}</figcaption></figure>${c.body}`;
 document.querySelector('#chapter-number').textContent=`CHAPTER ${String(i+1).padStart(2,'0')}`;
 document.querySelector('#chapter-count').textContent=`${String(i+1).padStart(2,'0')} / ${String(chapters.length).padStart(2,'0')}`;
 nav.querySelectorAll('a').forEach(a=>{if(a.dataset.chapter===c.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.querySelector('#next-chapter').innerHTML=`${i===chapters.length-1?'Back to the world':'Next: '+chapters[i+1].label} <span>→</span>`;
 if(!document.body.classList.contains('motion-off')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){content.animate([{opacity:.25,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});}
 if(focus){content.focus({preventScroll:true});document.querySelector('#chapters').scrollIntoView({behavior:document.body.classList.contains('motion-off')||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
}
document.addEventListener('click',e=>{const a=e.target.closest('[data-chapter]');if(!a)return;e.preventDefault();const id=a.dataset.chapter;history.pushState(null,'','#'+id);render(id,true);});
document.querySelector('#next-chapter').addEventListener('click',()=>{const id=chapters[(current+1)%chapters.length].id;history.pushState(null,'','#'+id);render(id,true);});
window.addEventListener('popstate',()=>{const id=location.hash.slice(1);if(chapters.some(c=>c.id===id))render(id,true);});
render(location.hash.slice(1));if(chapters.some(c=>c.id===location.hash.slice(1)))requestAnimationFrame(()=>document.querySelector('#chapters').scrollIntoView());
const magicTraditions={
 sun:{label:'THE SOLAR TRADITION',title:'Give the unknown a shape.',text:'Precise wards, luminous spellcraft, and disciplined forms. Sun Elves refine their inherited power through structure and control.',traits:['Wards','Light','Precision']},
 moon:{label:'THE LUNAR TRADITION',title:'Let the unknown become.',text:'Illusion, dreams, and transformation. Dark Elves work with intuition and emotion, adapting to the unpredictable nature of their inheritance.',traits:['Illusion','Dreams','Transformation']},
 fey:{label:'THE COMMON ORIGIN',title:'The blood remembers.',text:'The Fae vanished from mortal sight, but their magic endures in their descendants. Both elven traditions draw from this same inheritance. The working story now asks whether the ancestors survive beyond a hidden threshold.',traits:['Ancestry','Shared power','Fated bonds']}
};
const magicTabs=Array.from(document.querySelectorAll('[data-magic]'));
function showMagic(kind){const item=magicTraditions[kind],panel=document.querySelector('#magic-panel');magicTabs.forEach(button=>{const active=button.dataset.magic===kind;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});panel.setAttribute('aria-labelledby',`${kind}-tab`);panel.innerHTML=`<div class="eyebrow">${item.label}</div><h3>${item.title}</h3><p>${item.text}</p><div class="magic-traits">${item.traits.map(t=>`<span>${t}</span>`).join('')}</div>`;document.querySelector('#magic').dataset.tradition=kind;}
magicTabs.forEach((button,index)=>{button.addEventListener('click',()=>showMagic(button.dataset.magic));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%magicTabs.length;else if(event.key==='ArrowLeft')next=(index+magicTabs.length-1)%magicTabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=magicTabs.length-1;else return;event.preventDefault();magicTabs[next].focus();showMagic(magicTabs[next].dataset.magic);});});
let progressQueued=false;
function updateProgress(){const range=document.documentElement.scrollHeight-innerHeight;document.querySelector('#reading-progress').style.width=`${range>0?Math.min(100,Math.max(0,scrollY/range*100)):0}%`;progressQueued=false;}
window.addEventListener('scroll',()=>{if(!progressQueued){progressQueued=true;requestAnimationFrame(updateProgress);}},{passive:true});window.addEventListener('resize',updateProgress);updateProgress();
