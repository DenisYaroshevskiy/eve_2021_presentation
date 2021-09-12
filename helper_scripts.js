function addSection(parent) {
  let section = document.createElement('section');
  parent.appendChild(section);
  return section;
}

function addTitle(section, text) {
  let element = document.createElement('h3');
  let textNode = document.createTextNode(text);
  element.appendChild(textNode);
  section.appendChild(element);
  return element;
}

function measurement_filter(m) {
  if (m.algorithm.includes('unsq_eve')) return false;
  if (m.group == 'ryzen3600x'         ) return false;
  if (['std::reverse', 'std::transform'].some(x => x == m.algorithm)) return false;
  return true;
}

async function loadStaticData() {
  if (!loadStaticData.cache) {
    let loaded = await loadMeasurements();
    loaded = loaded.filter(measurement_filter).map((v) => {
           if (v.group == 'intel_9700K'       ) v.group = 'avx2';
      else if (v.group == 'intel_9700K_sse2'  ) v.group = 'sse2';
      else if (v.group == 'intel_9700K_sse4_2') v.group = 'sse4.2';
      return v;
    });
    let byKeys = valuesByKeys(loaded);
    loadStaticData.cache = [loaded, byKeys];
  }
  return loadStaticData.cache;
}

async function thisPresentationDraw(elementID, selection_, filter_ = []) {
  const element = document.getElementById(elementID);
  const [measurements, byKeys] = await loadStaticData();

  let selection = JSON.stringify(selection_, undefined, 2);
  let filter = JSON.stringify(filter_, undefined, 2);
  const [varying, fixed] = inputParse(selection, byKeys);
  const traceFilter = filterParse(filter);
  const asVisualized = visualizationDataFromMeasurements(varying, fixed, measurements);

  drawBenchmark(element, 1000, asVisualized, traceFilter);
}

function addBenchmarkForParameters(slide_id, title, parameters, filter) {
  let main = document.getElementById(slide_id);
  let section = addSection(main);
  addTitle(section, title);
  let div = document.createElement('div');
  const id = slide_id + '_' + JSON.stringify(parameters);
  div.setAttribute('id', id);
  section.appendChild(div);
  thisPresentationDraw(id, parameters, filter);
}

function addBenchmarkForSize(slide_id, title, size, parameters, filter) {
  title += ' (' + size.toString() + ' bytes)';

  let parameters_copy = JSON.parse(JSON.stringify(parameters));

  parameters_copy.size = size;
  addBenchmarkForParameters(slide_id, title, parameters_copy, filter);
}

function addBenchmarkForType(slide_id, title, type, parameters, filter) {
  title += ' (' + type + ')';

  let parameters_copy = JSON.parse(JSON.stringify(parameters));

  parameters_copy.type = type;
  addBenchmarkForParameters(slide_id, title, parameters_copy, filter);
}

function allSizesBenchmark(slide_id, title, parameters, filter) {
  for (let size of [40, 1000, 10000]) {
    addBenchmarkForSize(slide_id, title, size, parameters, filter);
  }
}

function allTypesBenchmark(slide_id, title, parameters, filter) {
  for (let type of ['char', 'short', 'int']) {
    addBenchmarkForType(slide_id, title, type, parameters, filter);
  }
}

function addImg(parent, img_path) {
  let img = document.createElement('img');
  img.src = img_path;
  parent.appendChild(img);
  return img;
}

function imagesSlideShow(id, img_count) {
  let main = document.getElementById(id);
  for (let i = 0; i != img_count; ++i) {
    let section = addSection(main);
    const img_path = 'img/' + id + '/img' + i.toString() + '.png';
    console.log(img_path);
    addImg(section, img_path);
  }
}
