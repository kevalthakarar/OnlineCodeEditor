import React,{useState , useRef, useEffect} from 'react'
import ACTION from '../Action';
import Client from '../component/Client';
import Editor from '../component/Editor';
import { initSocket } from '../socket';
import { Navigate, useLocation , useNavigate, useParams} from 'react-router-dom';
import toast from 'react-hot-toast'; 

const EditorPage = () => {

  const reactNavigator = useNavigate();
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const [clients , setClients] = useState([]);


  useEffect(()=>{
      const init = async ()=>{

        socketRef.current = await initSocket();

        socketRef.current.on('connect_error' , (err) => handleErrors(err));

        function handleErrors(e) {
          console.log(e);
          toast.error('Connection Failed');
          //alert('Connection Failed');
          reactNavigator('/');
        }

        socketRef.current.emit(ACTION.JOIN , {
          roomId,
          username:location.state?.username
        })

        // listining other client if joined

        socketRef.current.on(ACTION.JOINED , ({clients , username , socketId})=>{
          setClients(clients);
          socketRef.current.emit(ACTION.SYNC_CODE , {
            code : codeRef.current,
            socketId,
          });
          if(socketId !== socketRef.current.id){
            toast.success(`${username} Join Room`); 
            //alert(`${username} Join Room`);
          }
        })

        // listing for discnnected

        socketRef.current.on(ACTION.DISCONNECTED , ({socketId , username})=>{
            setClients((prev) => {
              return prev.filter(client => client.socketId !== socketId);
            })
            toast.success(`${username} left Room`);
            //alert(`${username} left Room`); 
        })

      }
      init();

      return ()=>{
        socketRef.current.disconnect();
        socketRef.current.off(ACTION.JOINED);
        socketRef.current.off(ACTION.DISCONNECTED); 
      }


  }, []);

  async function copyRoomId(){
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room Id copied`)
      //alert(`Room Id copied`);
    }catch(err){
      toast.error('Problem while Copying');
      //alert(`Problem while Copying`);
    }
  }

  async function onLeave(){
    reactNavigator('/');
  }

  if(!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className='mainWrap'>
        <div className='aside'>

          <div className='asideInner'>
            <div className='logo'>
              <img  className = 'logoImage'src='/sublime.png'alt='Sublime Text'></img>
            </div>
            <h3 className='connected'>Connected</h3>
            <div className='clientsList'>
              {
                clients.map((client) => (
                    <Client key = {client.socketId} username={client.username}/>
                ))
              }
            </div>
          </div>
          <button className='btn copyBtn' onClick={copyRoomId}>Copy RoomId</button>
          <button className='btn leaveBtn' onClick={onLeave}>Leave</button>
        </div>
        <div className='editorWrap'>
          <Editor socketRef = {socketRef} roomId = {roomId} onCodeChange = {(code) => {codeRef.current = code;}}/>
        </div>
    </div>
  )
}

export default EditorPage