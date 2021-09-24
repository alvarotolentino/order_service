import React from 'react';
import './App.css';
import Home from './components/home/Home';
import { TopBar } from './components/topbar/TopBar';

function App() {
  return (
    <>
      <TopBar></TopBar>
      <div className='container'>
        <Home></Home>
      </div>
    </>
  );
}

export default App;
