export function bambuProtocolUrl(filePath,{origin=location.origin,platform=navigator.platform}={}) {
  const url=new URL(filePath,origin);
  if(url.origin!==origin||!/^https?:$/.test(url.protocol)||!/^\/api\/bambu-handoff\/[A-Za-z0-9_-]{43}\/[^/]+$/.test(url.pathname))throw new Error('Invalid Bambu export link.');
  return /Mac|iPhone|iPad/i.test(platform)?`bambustudioopen://${encodeURIComponent(url.href)}`:`bambustudio://open?file=${encodeURIComponent(url.href)}`;
}

export function offerBambuHandoff(result,{download}={}) {
  if(!result)return;
  const files=result.files||[];
  const dialog=document.createElement('dialog');dialog.className='bambu-handoff-dialog';dialog.setAttribute('aria-label','Bambu Studio export');
  const heading=document.createElement('h2');heading.textContent=files.length?'Opening Bambu Studio…':'Instant Export';
  heading.setAttribute('tabindex','-1');heading.setAttribute('autofocus','');
  const note=document.createElement('p');note.textContent=files.length?`${files.length>1?`${files.length} files. `:''}Choose Allow if prompted.`:result.message;
  const list=document.createElement('details');list.className='bambu-handoff-files';
  const summary=document.createElement('summary');summary.textContent='Individual files';list.append(summary);
  const links=files.map(file=>{
    const link=document.createElement('a');link.href=bambuProtocolUrl(file.path);link.textContent=files.length===1?'Retry':file.name;if(files.length>1)list.append(link);return link;
  });
  const status=document.createElement('p');status.className='bambu-handoff-status';status.setAttribute('aria-live','polite');
  const all=document.createElement('button');all.type='button';all.textContent='Retry all';
  const fallback=document.createElement('button');fallback.type='button';fallback.textContent='Download instead';
  if(download)fallback.addEventListener('click',download);
  const close=document.createElement('button');close.type='button';close.textContent='Done';close.className='bambu-handoff-done';
  const actions=document.createElement('div');actions.className='bambu-handoff-actions';if(links.length)actions.append(links.length>1?all:links[0]);if(download)actions.append(fallback);actions.append(close);
  let timers=[];
  const clear=()=>{timers.forEach(clearTimeout);timers=[];};
  const openAll=()=>{
    clear();status.textContent='Requesting Bambu Studio…';
    links.forEach((link,index)=>{
      const open=()=>{link.click();status.textContent=`Requested ${index+1} of ${links.length} files.`;};
      if(index===0)open();else timers.push(setTimeout(open,index*1200));
    });
  };
  all.addEventListener('click',openAll);close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{clear();dialog.remove();});
  dialog.append(heading,note);if(links.length>1)dialog.append(list);dialog.append(status,actions);document.body.append(dialog);dialog.showModal();
  if(links.length)openAll();
}
