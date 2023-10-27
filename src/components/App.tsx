import { useState, useEffect } from 'react';

window.ipcRenderer.on('gotData', (event, data) => {
  console.log('Got data!');
  console.log(data);
})

const App: React.FC = () => {

  const [search, setSearch] = useState('');
  const [output, setOutput] = useState('')


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('attempting to search');
    const query = { search: search };
    window.appBridge.searchAudio(query.search);
  }
  useEffect(() => {
    window.ipcRenderer.on('gotData', (event, data) => {
      console.log('lol')
      setOutput(data);
    });
    return () => {
      window.ipcRenderer.removeAllListeners('gotData');
    };
  });



  const searchChanged = (message: string) => {

    console.log(message);
    setSearch(message);
  }
  return (
    <>
      <div >
        <div>
          <h1>SympSearch</h1>
          <form onSubmit={handleSubmit}>
            <label>
              Search:
              <input alt="searchbar" onChange={(e) => searchChanged(e.target.value)}/>
            </label>
            <button type="submit">Search</button>
          </form>
          <div>
            {output}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
