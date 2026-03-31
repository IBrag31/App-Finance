function saveData(key, data){
  localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key, fallback){
  try{
    return JSON.parse(localStorage.getItem(key)) || fallback;
  }catch{
    return fallback;
  }
}
