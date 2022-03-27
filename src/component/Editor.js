import React, { useEffect ,useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTION from '../Action';

const Editor = ({socketRef , roomId , onCodeChange}) => {


  const editorRef = useRef(null);

  useEffect(()=>{
      async function init() {
        editorRef.current = Codemirror.fromTextArea(document.getElementById('OnlineEditor'), {
          mode: {name: 'javascript' , json: true},
          theme : 'dracula',
          autoCloseTags : true,
          autoCloseBrackets: true,
          lineNumbers: true,
        });

        editorRef.current.on('change' , (instance , changes) => {
          const {origin} = changes;
          const code = instance.getValue();
          onCodeChange(code);
          if(origin !== 'setValue'){
            socketRef.current.emit(ACTION.CODE_CHANGE , {
              roomId,
              code,
            })
          }
        })

        return ()=>{
          socketRef.current.off(ACTION.CODE_CHANGE);
        }

      }
      init();
  },[]);


  useEffect(()=>{
    async function init() {
      if(socketRef.current !== null) {
        socketRef.current.on(ACTION.CODE_CHANGE , ({code}) => {
          if(code !== null){
            editorRef.current.setValue(code);
          }
        })
      }
    };
    init();
    
  } , [socketRef.current]);



  return (
    <textarea id="OnlineEditor"></textarea>
  )
}

export default Editor