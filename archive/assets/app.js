(function(){
  const form=document.querySelector('[data-search-form]');
  if(!form) return;
  const input=form.querySelector('input');
  const status=document.querySelector('[data-search-status]');
  const expected=document.body.dataset.answerHash || '';
  const target=document.body.dataset.target || '';
  function norm(v){return (v||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
  async function sha256(str){
    const data=new TextEncoder().encode(str);
    const buf=await crypto.subtle.digest('SHA-256',data);
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  form.addEventListener('submit',async function(e){
    e.preventDefault();
    const q=norm(input.value);
    if(!q){status.textContent='Enter a search term.';status.classList.add('show');return;}
    const h=await sha256(q);
    if(expected && h===expected && target){window.location.href=target;return;}
    status.textContent='No matching index entry.';
    status.classList.add('show');
  });
})();
