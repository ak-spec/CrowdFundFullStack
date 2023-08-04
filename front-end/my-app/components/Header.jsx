import Image from "next/image";
import React, {useState, useEffect, useContext} from "react";
import { CrowdFundContext } from "../context/Crowdfund";


export default function Header(){
    const connectionStatus = useContext(CrowdFundContext)
    const isConnected = connectionStatus.isConnected
    const currAddress = connectionStatus.currAddress
    const shortAddress = currAddress.slice(0, 20)
    return (
        <nav className="Navbar">
            <div className="title-image">
                <Image src="/images/logo.jpeg" alt="Can'l load" width={80} height={80}/>
                <h2 className="platformTitle">Raise</h2>
                <h2 style={{color: 'red'}}>Right</h2>
            </div>
            <div className="connection">
                {
                    isConnected ? (<p>Connected Address: {`${shortAddress}........`}</p>) : 
                    (<button  className="connect_btn" onClick={connectionStatus.connect}>Connect</button>)
                }
            </div>
        </nav>
        
    )
}