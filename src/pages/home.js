import React, { useState } from 'react';
import {v4 as uuid} from 'uuid';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 

const Home = () => {
    const navigate = useNavigate();
    const [roomId , setRoomId] = useState('');
    const [username , setUsername] = useState('');

    const createNewRoom = (e) =>{
        e.preventDefault();

        const id = uuid();
        setRoomId(id);
    }

    const joinRoom = () => {
        if(!roomId || !username){
            toast.error('Room ID or User Name can\'t be null');
            //alert('Room ID or User Name can\'t be null');
            return;
        }

        // redirect
        navigate(`/editor/${roomId}` , {
            state : {
                username,
                roomId
            }
        })
    }


  return (
      <div className='homePageWrapper'>
          <div className='formWrapper'>
                <h2 className='mainLabel'>Room Detail</h2>
                <div className='inputGroup'>
                    <input type="text" className='inputBox' placeholder='Room ID' onChange={(e) => {setRoomId(e.target.value)}} value = {roomId}></input>
                    <input type="text" className='inputBox' placeholder='User Name' onChange={(e) => {setUsername(e.target.value)}} value = {username}></input>
                    <button className='btn joinBtn' onClick={joinRoom}>Join</button>
                    <span className='createInfo'> 
                        Create Random Room ID Click &nbsp;
                        <a onClick={createNewRoom} href="www.google.com" className='createBtn'>Generate Room</a>
                    </span>
                </div>
          </div>
          <footer>
            <h4>Online Code Editor Source Code &nbsp;<a href="https://github.com/kevalthakarar/">Github</a></h4>
          </footer>
      </div>   
  )
}

export default Home