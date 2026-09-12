import { optimizeWorkspacePlates } from './workspace-color-optimization.js?v=tower-free1';
import { packBambuPlateArchive, packCore3mf, packZip, utf8 } from './core-3mf.js?v=liqu3d2';
import { plateIdAt } from './plate-ids.js';

self.onmessage = async ({ data }) => {
  try {
    let validPlates = (data.plates || []).filter((plate) => plate?.model?.objects?.length);
    if (!validPlates.length) throw new Error('There is no geometry to export.');
    let colorOptimization;
    if(data.colorOptimization?.enabled) {
      const optimized=await optimizeWorkspacePlates(validPlates,data.printer,data.colorOptimization,text=>self.postMessage({progress:text}));
      validPlates=optimized.plates;colorOptimization=optimized.report;
      if(data.arrangeOnly){self.postMessage({colorOptimization});return;}
      data.extras['color-optimization.json']=JSON.stringify(colorOptimization);
      const workflow=JSON.parse(data.extras['workflow.json'] || '{}');
      workflow.plateOrder=validPlates.map(plate=>plate.plateId);
      workflow.plates=Object.fromEntries(validPlates.map(plate=>[plate.plateId,{name:plate.model.title}]));
      for(const object of workflow.objects || [])object.plateId=colorOptimization.objects.find(item=>item.id===object.id)?.plateId || object.plateId;
      data.extras['workflow.json']=JSON.stringify(workflow);
    }
    const canNativeMultiPlate = (validPlates.length > 1 || validPlates.some(plate => plate.model.primeTower)) && validPlates.every((plate) => Boolean(plate.model.bambuTemplate));
    if (canNativeMultiPlate) {
      self.postMessage({ progress: `Packing native Bambu project · ${validPlates.length} plates…` });
      const first = validPlates[0].model;
      const { archive, ...format } = packBambuPlateArchive({
        title: data.projectTitle || 'Parametric production project',
        application: first.application,
        palette: first.palette,
        bambuTemplate: first.bambuTemplate,
        attachments: data.extras,
        bedSize: first.bedSize,
        primeTowerSettings: data.primeTower || first.primeTowerSettings,
        plates: validPlates.map((plate, index) => ({
          id: plate.plateId || plateIdAt(index),
          name: plate.model.title || `Plate ${plate.plateId || plateIdAt(index)}`,
          objects: plate.model.objects,
          primeTower: plate.model.primeTower
        }))
      });
      self.postMessage({ archive, ...format, count: validPlates.length, nativeMultiPlate: format.extension === '3mf' && validPlates.length > 1, colorOptimization }, [archive.buffer]);
      return;
    }

    const files = {};
    const singlePlate = validPlates.length === 1;
    for (const [index, plate] of validPlates.entries()) {
      self.postMessage({ progress: `Packing plate ${index + 1}/${validPlates.length}…` });
      files[plate.filename] = packCore3mf({ ...plate.model, attachments: singlePlate ? data.extras : null });
    }
    const entries = Object.entries(files);
    let archive;
    if (entries.length === 1) archive = entries[0][1];
    else {
      for (const [name, text] of Object.entries(data.extras || {})) files[name] = utf8(text);
      archive = packZip(files);
    }
    self.postMessage({ archive, count: entries.length, nativeMultiPlate: false, extension: singlePlate ? '3mf' : 'zip', mimeType: singlePlate ? 'model/3mf' : 'application/zip', projectCount: entries.length, colorOptimization }, [archive.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message || 'Could not pack the 3MF files.' });
  }
};
