import thumbnailPlaceholder from '@/assets/thumbnail-placeholder.png'

interface Props {
    id: string;
    title: string;
    thumbnail?: string;
}

const Song: React.FC<Props> = ({id, title="default-title", thumbnail}) => {
    
    const playSong = () => {
        console.log('playing song with id' + id);
        window.appBridge.playAudio(id);
    }
    return (
    <div key={id} style={{ padding: 10, backgroundColor: '#FFD6C0', borderBottom: 'solid',
    borderColor: '#000', borderBottomWidth: 1, width: '100vw',
     height: 150, color: '#000', display: 'flex'}}>
        <div style={{ width: '30%'}}><h1 style={{ fontSize: 20}}>{title}</h1></div>
        <img src={thumbnail ? thumbnail : thumbnailPlaceholder} width={150} height={150}/>
        <button type="button" onClick={playSong}/>
    </div>
    )
}

export default Song;