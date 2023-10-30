import { useState, useEffect} from 'react';
import '../../css/App.css';
import Song from '@/components/Song';
import treble from '@/assets/treble.png';
import magnifying from '@/assets/magnifier.png';

window.ipcRenderer.on('gotData', (event, data) => {
  console.log('Got data!');
  console.log(data);
})

interface ISong {
  id: string;
  title: string;
  thumbnail?: string;
  author: string;
}

interface IItem {
  
    kind: string;
    etag: string;
    id: {
        kind: string;
        videoId: string;
    },
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default: {
                url: string;
                width: number;
                height: number;
            },
            medium: {
                url: string;
                width: number;
                height: number;
            },
            high: {
                url: string;
                width: number;
                height: number;
            }
        },
        channelTitle: string;
        liveBroadcastContent: string;
        publishTime: string;
    }
}

const App: React.FC = () => {

  const [search, setSearch] = useState('');
  const [songs, setSongs] = useState<ISong[]>([])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('attempting to search');
    const query = { search: search };
    window.appBridge.searchAudio(query.search);
  }
  useEffect(() => {
    window.ipcRenderer.on('gotData', (event, data) => {
      const dataObj = JSON.parse(data)
      const items = dataObj.items;
      let songList: ISong[] = [];
      items.forEach((item: IItem) => {
        let song: ISong = {
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          author: item.snippet.channelTitle
        }
        songList.push(song);
      })
      setSongs(songList);
    });
    return () => {
      window.ipcRenderer.removeAllListeners('gotData');
    };
  });



  const searchChanged = (message: string) => {
    setSearch(message);
  }
  return (<>
        {songs.length > 0 && <div className="main-container-active" ></div>}
        <div className='songsWrapper'>
            {
                songs.map((song) => {
                  return (<Song id={song.id} title={song.title} thumbnail={song.thumbnail} author={song.author}
                    />)
                })
            }
        </div>
        <div className="search-frame">
          <div className="logo-section">
            <img src={treble} width={32} height={54.54}/>
            <h1 className="title">Symphony</h1>
          </div>
          <div className="magnifyer-search">
              <img className="magnifying-glass" src={magnifying} width={64} height={63.47}/>
              <form onSubmit={handleSubmit}>
                  <input className="searchbar" alt="searchbar" onChange={(e) => searchChanged(e.target.value)}/>
              </form>
          </div>
        </div>
        
      </>
  )
}

export default App
