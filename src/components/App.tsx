import { useState, useEffect, SetStateAction } from 'react';
import Song from '@/components/Song'

window.ipcRenderer.on('gotData', (event, data) => {
  console.log('Got data!');
  console.log(data);
})

interface ISong {
  id: string;
  title: string;
  thumbnail?: string;
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
          thumbnail: item.snippet.thumbnails.high.url
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

    console.log(message);
    setSearch(message);
  }
  return (
    <>
      <div>
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
            {
              (
                songs.map((song) => {
                  return (<Song id={song.id} title={song.title} thumbnail={song.thumbnail} 
                    />)
                })
              )
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default App
