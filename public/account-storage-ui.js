export function initStorageBrowser({ root, fetchJson, updateUsage, onDelete = () => {} }) {
  const tree = root.querySelector('#accountStorageTree');
  const status = root.querySelector('#accountStorageStatus');
  tree.tabIndex = -1;
  let loading = 0;
  let busy = false;
  let cancelPending;
  const expanded = new Set();
  tree.addEventListener('keydown', event => { if (event.key === 'Escape' && cancelPending) { event.preventDefault(); event.stopPropagation(); cancelPending(); } });
  function size(bytes) {
    if(bytes<1024)return `${bytes} B`;
    const units=['KB','MB','GB']; let i=-1;
    do {bytes/=1024;i++;} while(bytes>=1024&&i<2);
    return `${bytes.toFixed(bytes>=100?0:bytes>=10?1:2)} ${units[i]}`;
  }
  function render(groups) {
    function item(node) {
      const branch=document.createElement(node.children.length?'details':'div');
      branch.className='storage-item';
      const key=node.kind ? `${node.kind}:${node.id}` : `group:${node.name}`;
      if(node.children.length) {
        branch.open=expanded.has(key);
        if(branch.open)expanded.add(key);
        branch.addEventListener('toggle',()=>{if(!branch.isConnected)return;if(branch.open)expanded.add(key);else expanded.delete(key);});
      }
      const row=document.createElement(node.children.length?'summary':'div');
      row.className='storage-item-row';
      const name=document.createElement('span');name.className='storage-item-name';name.textContent=node.name;
      const bytes=document.createElement('span');bytes.className='storage-item-size';bytes.textContent=size(node.bytes);
      row.append(name,bytes); branch.append(row);
      if(node.kind && node.deletable) {
        const remove=document.createElement('button');remove.type='button';remove.className='storage-delete';remove.textContent='Delete';
        remove.setAttribute('aria-label',`Delete ${node.name}`);
        row.append(remove);
        remove.addEventListener('click', async event => {
          event.preventDefault();
          if(busy)return;
          if(remove.dataset.confirm !== 'true') {
            cancelPending?.();
            remove.dataset.confirm='true';remove.textContent='Confirm delete';
            remove.setAttribute('aria-label',`Confirm delete ${node.name}`);
            row.classList.add('storage-pending');
            const cancel=document.createElement('button');cancel.type='button';cancel.className='storage-cancel';cancel.textContent='Cancel';
            row.append(cancel);
            const message=document.createElement('p');message.className='storage-delete-note';
            message.textContent=node.children.length?'Deletes this item and its contents.':node.kind==='export_snapshots'?'Deletes all exports sharing this result.':'Permanently deletes this item.';
            row.after(message);
            if(node.children.length) { branch.open=true; expanded.add(key); }
            cancelPending=()=>{remove.dataset.confirm='false';remove.textContent='Delete';remove.setAttribute('aria-label',`Delete ${node.name}`);row.classList.remove('storage-pending');cancel.remove();message.remove();cancelPending=null;};
            cancel.addEventListener('click',event=>{event.preventDefault();cancelPending?.();remove.focus();});
            return;
          }
          busy=true;remove.disabled=true;remove.textContent='Deleting…';
          try {
            const result=await fetchJson('/api/account/storage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:node.kind,key:node.key,id:node.id,confirm:true})});
            loading++;cancelPending?.();updateUsage(result);render(result.groups);tree.focus();status.textContent=`Deleted “${node.name}”.`;
            await onDelete(node);
          }catch(error){cancelPending?.();remove.disabled=false;status.textContent=error.message;}
          finally{busy=false;}
        });
      } else if(node.kind) {
        const hint=document.createElement('span');hint.className='storage-item-note';
        hint.textContent=node.kind==='instant_packages'?'Shared sources · removed when no longer used':'Managed with its parent';
        row.append(hint);
      }
      if(node.children.length){const children=document.createElement('div');children.className='storage-children';children.append(...node.children.map(item));branch.append(children);}
      return branch;
    }
    cancelPending?.();
    tree.replaceChildren(...groups.map(item));
    if(!groups.length)tree.textContent='No saved data yet.';
  }
  async function load() {
    const request=++loading;
    status.textContent='Loading storage…';
    try {
      const result=await fetchJson('/api/account/storage');
      if(request!==loading)return;
      updateUsage(result);render(result.groups);
      status.textContent='';
    } catch(error){if(request===loading)status.textContent=error.message;}
  }
  return {load};
}
