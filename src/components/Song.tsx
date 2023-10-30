import thumbnailPlaceholder from '@/assets/thumbnail-placeholder.png'
import playButton from '@/assets/play.svg'
import '../../css/App.css';

interface Props {
    id: string;
    title: string;
    thumbnail?: string;
    author: string;
}

const Song: React.FC<Props> = ({id, title="default-title", thumbnail, author="some-author"}) => {
    
    const playSong = () => {
        console.log('playing song with id' + id);
        window.appBridge.playAudio(id);
    }

    const maxTextLength = 45

    return (
    <div key={id} className='songContainer'>
        <div className='songWidget'>
            <h1 className='audioTitle'>{ (title.length <= maxTextLength) ? title : 
            title.substring(0, maxTextLength) + " . . ." }</h1>
            <p className='author'>{author}</p>
                    <div className='thumbnailWrapper'>
                        <img className='thumbnail' src={thumbnail} />
                    </div>
            <div className='playButtonWrapper'>
                <img className='playButtonImage' src={playButton}/>
                <button className='playButton' type='button' onClick={playSong}/>
            </div>
            
        </div>
    </div>
    )
}

export default Song;