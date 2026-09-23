(() => {
  const STORAGE_KEY = 'archive_recovery_v4';
  const stageMount = document.getElementById('stageMount');
  const statusText = document.getElementById('statusText');
  const settingsBtn = document.getElementById('settingsBtn');
  const settings = document.getElementById('settings');
  const resetBtn = document.getElementById('resetBtn');

  const answers = [
    ['porch'],
    ['basement'],
    ['greenhouse'],
    ['lentkey','lent key'],
    ['mirror'],
    ['afterimage','after image'],
    ['neverempty','never empty']
  ];

  const sysErrors = [
    ['Recovery phrase not recognized.','No matching recovery phrase.','Volume header remains locked.'],
    ['Index token rejected.','No matching directory token.','Archive lookup failed.'],
    ['Sequence validation failed.','Recovery log did not resolve.','No matching location index.'],
    ['Encoded note did not resolve.','Record key rejected.','No matching recovered instruction.'],
    ['Object reference rejected.','Cross-record lookup failed.','No matching recovered object.'],
    ['Cipher output rejected.','Derived token did not validate.','No matching recovered phrase.'],
    ['Final access phrase rejected.','Seal remains closed.','Archive closeout denied.']
  ];

  const beats = [
    'Recovered note points to an exterior entry point.',
    'A deleted folder references a room that does not appear on the house inventory.',
    'Activity records continue after the property was marked vacant.',
    'A recovered note says someone borrowed a key rather than forcing entry.',
    'Two archived records describe the same hidden object from different viewpoints.',
    'The archive owner appears to have preserved evidence after realizing records were being altered.',
    'The final seal contains the explanation for why the house logs never truly went quiet.'
  ];

  function norm(v){return v.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');}
  function state(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {stage:0};}catch{return {stage:0};}
  }
  function save(s){localStorage.setItem(STORAGE_KEY, JSON.stringify(s));}

  const stages = [
    () => `
      <div class="card system">
        <div class="label">SYSTEM</div>
        <div class="mono">Primary index unreadable. One handwritten recovery slip survived the scan.</div>
      </div>
      <div class="card evidence">
        <div class="label">RECOVERED SLIP / SCAN 01</div>
        <div class="small dim">written on reverse of utility receipt · undated</div>
        <div class="codeblock">.--. --- .-. -.-. ....</div>
      </div>
    `,
    () => `
      <div class="card system"><div class="label">SYSTEM</div><div class="mono">Exterior index mounted. One deleted directory header recovered.</div></div>
      <div class="card evidence">
        <div class="label">DIRECTORY FRAGMENT / REV 03</div>
        <div class="codeblock">EDVHPHQW</div>
        <div class="small dim">source: node03.idx · checksum partial</div>
      </div>
    `,
    () => `
      <div class="card system"><div class="label">SYSTEM</div><div class="mono">Deleted room directory restored. Event records remain unsorted.</div></div>
      <div class="card evidence">
        <div class="label">RECOVERY EVENT LOG</div>
        <div class="grid small">
          <div class="record"><span>22:41:08</span><span><b>H</b>all sensor resumed after manual override.</span></div>
          <div class="record"><span>22:38:11</span><span><b>E</b>ast window status changed to open.</span></div>
          <div class="record"><span>22:36:02</span><span><b>R</b>elay power restored to auxiliary panel.</span></div>
          <div class="record"><span>22:43:22</span><span><b>U</b>tility meter pulse recorded.</span></div>
          <div class="record"><span>22:45:00</span><span><b>E</b>ntry finalized by local controller.</span></div>
          <div class="record"><span>22:39:43</span><span><b>E</b>xternal latch reported secure.</span></div>
          <div class="record"><span>22:35:19</span><span><b>G</b>ate contact cleared.</span></div>
          <div class="record"><span>22:44:10</span><span><b>S</b>outh vent motor cycled.</span></div>
          <div class="record"><span>22:42:17</span><span><b>O</b>ccupancy sensor registered motion.</span></div>
          <div class="record"><span>22:40:25</span><span><b>N</b>etwork camera rejoined local bus.</span></div>
        </div>
      </div>
    `,
    () => `
      <div class="card system"><div class="label">SYSTEM</div><div class="mono">Vacancy contradiction confirmed. One text fragment recovered from a damaged note.</div></div>
      <div class="card evidence">
        <div class="label">NOTE FRAGMENT / CACHE</div>
        <div class="small dim">attachment body recovered, filename lost</div>
        <div class="codeblock">TEVOVCBLRVk=</div>
      </div>
    `,
    () => `
      <div class="card system"><div class="label">SYSTEM</div><div class="mono">Access record indicates a key was borrowed. Two records reference the same concealed item.</div></div>
      <div class="card evidence">
        <div class="label">RECORD A / HOUSE INVENTORY</div>
        <table class="table">
          <tr><th>Shelf</th><th>Entry</th></tr>
          <tr><td>upper-2</td><td>lamp shade</td></tr>
          <tr><td>upper-3</td><td><span class="redact">silver hand mirror</span></td></tr>
          <tr><td>upper-4</td><td>camera case</td></tr>
        </table>
      </div>
      <div class="card evidence">
        <div class="label">RECORD B / PHOTO CONTACT SHEET</div>
        <div class="small mono">frame 04: reflective oval, hairline crack at lower edge\nframe 07: same object wrapped in tea towel\nframe 11: reverse side shows initials: E.M.</div>
      </div>
    `,
    () => `
      <div class="card system"><div class="label">SYSTEM</div><div class="mono">Concealed item matched. A cipher note was stored with it.</div></div>
      <div class="card evidence">
        <div class="label">HANDWRITTEN CARD</div>
        <div class="small dim">header: “USE THE BORROWED WORD”</div>
        <div class="codeblock">LJGXBMKLKR</div>
        <div class="small dim">pencil notation on reverse: 22-9-7-5-14-5-18-5</div>
      </div>
    `,
    () => `
      <div class="card system"><div class="label">SYSTEM</div><div class="mono">Preservation note accepted. Final archive seal recovered.</div></div>
      <div class="card evidence">
        <div class="label">FINAL SEAL / TRANSCRIPTION</div>
        <div class="small mono">THE HOUSE WAS MARKED VACANT.\nTHE SYSTEM WAS NOT.\nSEAL INDEX: 3 · 6 · 9 · 12 · 15 · 18 · 21 · 24 · 27 · 30</div>
        <div class="codeblock">QZNQZEQZVQZEQZRQZEQZMQZPQZTQZY</div>
      </div>
    `
  ];

  function render(){
    const s = state();
    statusText.textContent = s.stage >= stages.length ? 'ARCHIVE SEALED' : `RECOVERY ${s.stage+1}/${stages.length}`;
    if(s.stage >= stages.length){
      stageMount.innerHTML = `
        <div class="card system"><div class="label">SYSTEM</div><div class="mono">End of recoverable volume.</div></div>
        <div class="card evidence finalnote">
          <div class="label">OUT-OF-WORLD NOTICE</div>
          <h2>This archive was fictional.</h2>
          <p>Everything in this experience — the property, the records, the names, the logs, and the events — was invented for this ARG.</p>
          <p>The mystery was designed to feel like a real recovered household archive, but it does not describe real people or real events.</p>
          <p class="small">Thanks for playing.</p>
        </div>`;
      return;
    }
    stageMount.innerHTML = stages[s.stage]() + `
      <div class="storybeat">${s.stage ? beats[s.stage-1] : ''}</div>
      <form id="answerForm" class="prompt">
        <div class="label">RECOVERY INPUT</div>
        <div class="row"><input id="answer" class="input" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="go"><button class="submit">submit</button></div>
        <div id="feedback" class="feedback"></div>
      </form>`;
    const f = document.getElementById('answerForm');
    f.addEventListener('submit', e => {
      e.preventDefault();
      const v = norm(document.getElementById('answer').value);
      const ok = answers[s.stage].map(norm).includes(v);
      const fb = document.getElementById('feedback');
      if(!ok){
        const msgs=sysErrors[s.stage];
        fb.textContent = msgs[Math.floor(Math.random()*msgs.length)];
        return;
      }
      save({stage:s.stage+1});
      render();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  }

  settingsBtn.addEventListener('click',()=>settings.classList.toggle('hidden'));
  resetBtn.addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);settings.classList.add('hidden');render();window.scrollTo(0,0);});
  render();
})();
